import axios from 'axios';

const JSONBIN_API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
const JSONBIN_VISITS_BIN_ID = import.meta.env.VITE_JSONBIN_VISITS_BIN_ID;
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';
const IPAPI_BASE_URL = 'https://ipapi.co/json/';

/**
 * Get browser information
 */
const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edg') > -1) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
        browserName = 'Opera';
        browserVersion = ua.match(/OPR\/(\d+\.\d+)/)?.[1] || 'Unknown';
    }

    return { browserName, browserVersion };
};

/**
 * Get device information
 */
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = 'Desktop';

    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        if (/iPad|Tablet/i.test(ua)) {
            device = 'Tablet';
        } else {
            device = 'Mobile';
        }
    }

    return device;
};

/**
 * Get operating system information
 */
const getOSInfo = () => {
    const ua = navigator.userAgent;
    let os = 'Unknown';

    if (ua.indexOf('Win') > -1) {
        os = 'Windows';
    } else if (ua.indexOf('Mac') > -1) {
        os = 'macOS';
    } else if (ua.indexOf('Linux') > -1) {
        os = 'Linux';
    } else if (ua.indexOf('Android') > -1) {
        os = 'Android';
    } else if (ua.indexOf('like Mac') > -1) {
        os = 'iOS';
    }

    return os;
};

/**
 * Get location information using ipapi.co
 */
const getLocationInfo = async () => {
    try {
        const response = await axios.get(IPAPI_BASE_URL);
        return {
            country: response.data.country_name || 'Unknown',
            city: response.data.city || 'Unknown',
            referrer: document.referrer || 'Direct'
        };
    } catch {
        return {
            country: 'Unknown',
            city: 'Unknown',
            referrer: document.referrer || 'Direct'
        };
    }
};

/**
 * Format date in EST timezone as DD-MM-YYYY HH:mm
 */
const getESTTimestamp = () => {
    const date = new Date();
    const options = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const estDate = new Date(date.toLocaleString('en-US', options));

    const day = String(estDate.getDate()).padStart(2, '0');
    const month = String(estDate.getMonth() + 1).padStart(2, '0');
    const year = estDate.getFullYear();
    const hours = String(estDate.getHours()).padStart(2, '0');
    const minutes = String(estDate.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
};

/**
 * Get browser language
 */
const getBrowserLanguage = () => {
    return navigator.language || navigator.userLanguage || 'Unknown';
};

/**
 * Track visit analytics and increment count
 */
export const recordVisit = async () => {
    try {
        const { browserName, browserVersion } = getBrowserInfo();
        const device = getDeviceInfo();
        const os = getOSInfo();
        const windowSize = `${window.innerWidth}x${window.innerHeight}`;
        const browserLanguage = getBrowserLanguage();
        const timestamp = getESTTimestamp();

        const locationInfo = await getLocationInfo();

        const visitData = {
            device,
            windowSize,
            browserName,
            browserVersion,
            timestamp,
            os,
            country: locationInfo.country,
            city: locationInfo.city,
            referrer: locationInfo.referrer,
            browserLanguage
        };

        const response = await axios.get(
            `${JSONBIN_BASE_URL}/b/${JSONBIN_VISITS_BIN_ID}/latest`,
            {
                headers: {
                    'X-Access-Key': JSONBIN_API_KEY,
                },
            }
        );

        const data = response.data.record;

        if (!data.count) {
            data.count = 0;
        }
        if (!data.visits) {
            data.visits = [];
        }

        data.count += 1;
        data.visits.push(visitData);

        await axios.put(
            `${JSONBIN_BASE_URL}/b/${JSONBIN_VISITS_BIN_ID}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': JSONBIN_API_KEY,
                },
            }
        );

        return true;
    } catch (error) {
        console.error('Failed to track visit:', error);
        return false;
    }
};
