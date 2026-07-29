export const authenticate = async (password) => {
    try {
        const response = await fetch("/api/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        });

        const body = await response.json();

        return {
            success: response.ok,
            error: body.error || null,
        };
    } catch {
        return {
            success: false,
            error: "Authentication failed",
        };
    }
};

export const fetchMain = async () => {
    try {
        const response = await fetch("/api/main");

        const body = await response.json();

        return {
            success: response.ok,
            error: body.error || null,
            data: body.data || null,
        };
    } catch {
        return {
            success: false,
            error: "Failed to fetch main data",
            data: null,
        };
    }
};

export const saveMain = async (data, password) => {
    try {
        const response = await fetch("/api/main", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password,
                data,
            }),
        });

        const body = await response.json();

        return {
            success: response.ok,
            error: body.error || null,
            data: body,
        };
    } catch {
        return {
            success: false,
            error: "Failed to save main data",
            data: null,
        };
    }
};

export const uploadImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/images", {
            method: "POST",
            body: formData,
        });

        const body = await response.json();
        if (!response.ok) {
            throw new Error(body.error || "Image upload failed");
        }

        return body.url;
    } catch (error) {
        throw new Error(error.message || "Image upload failed");
    }
};

export const recordVisit = async () => {
    try {
        const visitData = {
            device: getDeviceInfo(),
            windowSize: `${window.innerWidth}x${window.innerHeight}`,
            ...getBrowserInfo(),
            os: getOSInfo(),
            browserLanguage: getBrowserLanguage(),
            referrer: document.referrer || 'Direct',
        };

        const response = await fetch("/api/analytics", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(visitData),
        });

        return response.ok;

    } catch (error) {
        console.error("Failed to track visit:", error);
        return false;
    }
};

const getBrowserInfo = () => {
    const ua = navigator.userAgent;

    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.includes('Firefox')) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edg')) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Chrome')) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari')) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
    }

    return {
        browserName,
        browserVersion,
    };
};

const getDeviceInfo = () => {
    const ua = navigator.userAgent;

    if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
        return /iPad|Tablet/i.test(ua)
            ? "Tablet"
            : "Mobile";
    }

    return "Desktop";
};

const getOSInfo = () => {
    const ua = navigator.userAgent;

    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("like Mac")) return "iOS";

    return "Unknown";
};

const getBrowserLanguage = () => {
    return navigator.language || navigator.userLanguage || "Unknown";
};