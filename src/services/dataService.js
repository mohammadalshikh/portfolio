import axios from 'axios';

const JSONBIN_API_KEY = import.meta.env.JSONBIN_API_KEY;
const JSONBIN_DATA_BIN_ID = import.meta.env.JSONBIN_DATA_BIN_ID;
const JSONBIN_NOTES_BIN_ID = import.meta.env.JSONBIN_NOTES_BIN_ID;
const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
const IMGBB_BASE_URL = 'https://api.imgbb.com/1/upload';

/**
 * Fetch main data from JSONBin (excluding notes)
 * 
 * @returns {Promise<{data: object, success: boolean}>} Data and
 * success status
 */
export const fetchData = async () => {
    try {
        const response = await axios.get(
            `${JSONBIN_BASE_URL}/b/${JSONBIN_DATA_BIN_ID}/latest`,
            {
                headers: {
                    'X-Access-Key': JSONBIN_API_KEY,
                },
            }
        );
        return { data: response.data.record, success: true };
    } catch {
        return { data: getDefaultData(), success: false };
    }
};

/**
 * Fetch notes data from separate JSONBin
 * 
 * @returns {Promise<{notes: object, success: boolean}>} Notes and success status
 */
export const fetchNotes = async () => {
    if (!JSONBIN_NOTES_BIN_ID) {
        return { notes: {}, success: false };
    }
    try {
        const response = await axios.get(
            `${JSONBIN_BASE_URL}/b/${JSONBIN_NOTES_BIN_ID}/latest`,
            {
                headers: {
                    'X-Access-Key': JSONBIN_API_KEY,
                },
            }
        );
        return { notes: response.data.record.notes || {}, success: true };
    } catch {
        return { notes: {}, success: false };
    }
};

/**
 * Save main data to JSONBin (excluding notes)
 */
export const saveData = async (data) => {
    // Separate notes from main data
    const { notes, ...mainData } = data;

    // Save main data
    const response = await axios.put(
        `${JSONBIN_BASE_URL}/b/${JSONBIN_DATA_BIN_ID}`,
        mainData,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Key': JSONBIN_API_KEY,
            },
        }
    );

    // Save notes separately if bin is configured
    if (JSONBIN_NOTES_BIN_ID && notes !== undefined) {
        await axios.put(
            `${JSONBIN_BASE_URL}/b/${JSONBIN_NOTES_BIN_ID}`,
            { notes },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': JSONBIN_API_KEY,
                },
            }
        );
    }

    return response.data;
};

/**
 * Upload image to ImgBB
 * 
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} URL of uploaded image
 */
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await axios.post(
        IMGBB_BASE_URL,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data.data.url;
};

/**
 * Default data structure (fallback)
 */
const getDefaultData = () => ({
    experiences: [],
    education: [],
    projects: [],
    about: {
        intro: '',
        skills: [],
    },
});

/**
 * Validate environment variables
 */
export const validateConfig = () => {
    const missingVars = [];

    if (!JSONBIN_API_KEY || JSONBIN_API_KEY === 'JSONBIN_API_KEY') {
        missingVars.push('JSONBIN_API_KEY');
    }
    if (!JSONBIN_DATA_BIN_ID || JSONBIN_DATA_BIN_ID === 'JSONBIN_DATA_BIN_ID') {
        missingVars.push('JSONBIN_DATA_BIN_ID');
    }
    if (!IMGBB_API_KEY || IMGBB_API_KEY === 'IMGBB_API_KEY') {
        missingVars.push('IMGBB_API_KEY');
    }

    if (missingVars.length > 0) {
        return false;
    }

    return true;
};
