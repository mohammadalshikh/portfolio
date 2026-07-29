#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_DIR = path.join(__dirname, './', 'src', 'fallback');
const ASSETS_DIR = path.join(FALLBACK_DIR, 'assets');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'fallbackData.js');

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

try {
    const dotenv = await import('dotenv');
    dotenv.config();
} catch {
    // dotenv not installed
}

const unescapeEnv = (val) => val ? val.replace(/\\(.)/g, '$1') : val;
const JSONBIN_API_KEY = unescapeEnv(process.env.JSONBIN_API_KEY);
const JSONBIN_MAIN_BIN_ID = unescapeEnv(process.env.JSONBIN_MAIN_BIN_ID);

async function fetchBinData() {
    const response = await fetch(`${JSONBIN_BASE_URL}/b/${JSONBIN_MAIN_BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch bin: ${response.statusText}`);
    }

    const result = await response.json();
    return result.record;
}

function getImageName(url, fallbackName) {
    if (!url) return null;

    const urlMatch = url.match(/\/([^\/]+)\.(png|jpg|jpeg|gif|webp)$/i);
    if (urlMatch) {
        return urlMatch[1].toLowerCase();
    }

    return fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '');
}
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

async function processItems(items, nameKey) {
    const imports = new Map(); // imageName -> import statement
    const processedItems = [];

    for (const item of items) {
        const processed = { ...item };

        delete processed.id;

        delete processed.screenshots;

        if (processed.image && typeof processed.image === 'string' && processed.image.startsWith('http')) {
            const itemName = item[nameKey] || 'unknown';
            const imageName = getImageName(processed.image, itemName);

            if (imageName) {
                const imageFileName = `${imageName}.png`;
                const imagePath = path.join(ASSETS_DIR, imageFileName);

                if (!fs.existsSync(imagePath)) {
                    try {
                        await downloadImage(processed.image, imagePath);
                    } catch (err) {
                        console.error(`Failed to download image for ${itemName}:`, err.message);
                    }
                }

                imports.set(imageName, `import ${imageName} from './assets/${imageFileName}';`);

                processed.image = `__VAR__${imageName}`;
            }
        } else if (!processed.image) {
            delete processed.image;
        }

        processedItems.push(processed);
    }

    return { items: processedItems, imports };
}

function generateFallbackCode(data, allImports) {
    const importStatements = Array.from(allImports.values()).sort().join('\n');

    const stringify = (obj, indent = 2) => {
        return JSON.stringify(obj, null, 4)
            .replace(/"__VAR__(\w+)"/g, '$1')
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

    if (!JSONBIN_API_KEY || !JSONBIN_MAIN_BIN_ID) {
        process.exit(1);
    }

    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    try {
        const binData = await fetchBinData();
        const allImports = new Map();
        const { items: experiences, imports: expImports } = await processItems(
            binData.experiences || [],
            'company'
        );
        expImports.forEach((v, k) => allImports.set(k, v));

        const { items: education, imports: eduImports } = await processItems(
            binData.education || [],
            'institution'
        );
        eduImports.forEach((v, k) => allImports.set(k, v));

        const { items: projects, imports: projImports } = await processItems(
            binData.projects || [],
            'name'
        );
        projImports.forEach((v, k) => allImports.set(k, v));

        const about = {
            intro: binData.about?.intro || '',
            skills: binData.about?.skills || []
        };

        const fallbackCode = generateFallbackCode(
            { projects, about, experiences, education },
            allImports
        );

        fs.writeFileSync(FALLBACK_FILE, fallbackCode);
    } catch (error) {
        console.error('\nError:', error.message);
        process.exit(1);
    }
}

main();
