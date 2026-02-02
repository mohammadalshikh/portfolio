#!/usr/bin/env node

/**
 * Script to sync fallback data with JSONBin
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const FALLBACK_DIR = path.join(__dirname, '..', 'src', 'fallback');
const ASSETS_DIR = path.join(FALLBACK_DIR, 'assets');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'fallbackData.js');

// JSONBin config
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

// Load env vars
try {
    const dotenv = await import('dotenv');
    dotenv.config();
} catch {
    // dotenv not installed
}

// Unescape env vars (handle \$ escaping)
const unescapeEnv = (val) => val ? val.replace(/\\(.)/g, '$1') : val;
const JSONBIN_API_KEY = unescapeEnv(process.env.VITE_JSONBIN_API_KEY || process.env.JSONBIN_API_KEY);
const JSONBIN_DATA_BIN_ID = unescapeEnv(process.env.VITE_JSONBIN_DATA_BIN_ID || process.env.JSONBIN_DATA_BIN_ID);

/**
 * Fetch data from JSONBin
 */
async function fetchBinData() {
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${JSONBIN_DATA_BIN_ID}/latest`, {
        headers: { 'X-Access-Key': JSONBIN_API_KEY }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch bin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.record;
}

/**
 * Extract image name from URL or company/institution name
 */
function getImageName(url, fallbackName) {
    if (!url) return null;

    // Try to extract name from URL
    const urlMatch = url.match(/\/([^\/]+)\.(png|jpg|jpeg|gif|webp)$/i);
    if (urlMatch) {
        return urlMatch[1].toLowerCase();
    }

    // Use fallback name (company/institution name)
    return fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Download image from URL
 */
function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        const request = protocol.get(url, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(destPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', reject);
        });

        request.on('error', reject);
    });
}

/**
 * Process an array of items (experiences, education, projects)
 * Returns { items, imports } where items have image as variable reference
 */
async function processItems(items, nameKey) {
    const imports = new Map(); // imageName -> import statement
    const processedItems = [];

    for (const item of items) {
        const processed = { ...item };

        // Remove id if present
        delete processed.id;

        // Skip screenshots
        delete processed.screenshots;

        // Handle image
        if (processed.image && typeof processed.image === 'string' && processed.image.startsWith('http')) {
            const itemName = item[nameKey] || 'unknown';
            const imageName = getImageName(processed.image, itemName);

            if (imageName) {
                const imageFileName = `${imageName}.png`;
                const imagePath = path.join(ASSETS_DIR, imageFileName);

                // Check if image exists, if not download it
                if (!fs.existsSync(imagePath)) {
                    console.log(`   📥 Downloading ${imageFileName}...`);
                    try {
                        await downloadImage(processed.image, imagePath);
                        console.log(`   ✓ Downloaded ${imageFileName}`);
                    } catch (err) {
                        console.log(`   ⚠ Failed to download ${imageFileName}: ${err.message}`);
                    }
                } else {
                    console.log(`   ✓ ${imageFileName} already exists`);
                }

                // Add import
                imports.set(imageName, `import ${imageName} from './assets/${imageFileName}';`);

                // Set image to variable reference (will be handled in code generation)
                processed.image = `__VAR__${imageName}`;
            }
        } else if (!processed.image) {
            delete processed.image;
        }

        processedItems.push(processed);
    }

    return { items: processedItems, imports };
}

/**
 * Generate the fallbackData.js content
 */
function generateFallbackCode(data, allImports) {
    const importStatements = Array.from(allImports.values()).sort().join('\n');

    // Helper to stringify with proper formatting
    const stringify = (obj, indent = 2) => {
        return JSON.stringify(obj, null, 4)
            // Replace "__VAR__name" with just name (variable reference)
            .replace(/"__VAR__(\w+)"/g, '$1')
            // Fix indentation for the outer structure
            .split('\n')
            .map((line, i) => i === 0 ? line : ' '.repeat(indent) + line)
            .join('\n');
    };

    const projectsStr = stringify(data.projects, 4);
    const aboutStr = stringify(data.about, 4);
    const experiencesStr = stringify(data.experiences, 4);
    const educationStr = stringify(data.education, 4);

    return `${importStatements}

export const fallbackData = {
    projects: ${projectsStr},
    about: ${aboutStr},
    experiences: ${experiencesStr},
    education: ${educationStr},
    notes: {},
};
`;
}

async function main() {
    console.log('🔄 Syncing fallback data from JSONBin...\n');

    // Validate config
    if (!JSONBIN_API_KEY || !JSONBIN_DATA_BIN_ID) {
        console.error('❌ Missing JSONBIN_API_KEY or JSONBIN_DATA_BIN_ID');
        process.exit(1);
    }

    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    try {
        // Fetch data from bin
        console.log('📥 Fetching data from JSONBin...');
        const binData = await fetchBinData();
        console.log('   ✓ Data fetched successfully\n');

        const allImports = new Map();

        // Process experiences
        console.log('📦 Processing experiences...');
        const { items: experiences, imports: expImports } = await processItems(
            binData.experiences || [],
            'company'
        );
        expImports.forEach((v, k) => allImports.set(k, v));

        // Process education
        console.log('\n📦 Processing education...');
        const { items: education, imports: eduImports } = await processItems(
            binData.education || [],
            'institution'
        );
        eduImports.forEach((v, k) => allImports.set(k, v));

        // Process projects (no images typically, but handle if present)
        console.log('\n📦 Processing projects...');
        const { items: projects, imports: projImports } = await processItems(
            binData.projects || [],
            'name'
        );
        projImports.forEach((v, k) => allImports.set(k, v));

        // Process about (no images)
        const about = {
            intro: binData.about?.intro || '',
            skills: binData.about?.skills || []
        };

        // Generate the file content
        console.log('\n📝 Generating fallbackData.js...');
        const fallbackCode = generateFallbackCode(
            { projects, about, experiences, education },
            allImports
        );

        // Write the file
        fs.writeFileSync(FALLBACK_FILE, fallbackCode);
        console.log('   ✓ fallbackData.js updated successfully');

        console.log('\n✅ Sync complete!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
