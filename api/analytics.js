export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const visitData = req.body;

        const now = new Date();

        const formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Toronto",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));

        const timestamp = `${parts.day}-${parts.month}-${parts.year} - ${parts.hour}:${parts.minute}`;

        const newVisit = {
            ...visitData,
            timestamp,
        };

        const binResponse = await fetch(
            `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_VISITS_BIN_ID}/latest`,
            {
                headers: {
                    "X-Master-Key": process.env.JSONBIN_API_KEY,
                },
            }
        );

        if (!binResponse.ok) {
            const text = await binResponse.text();
            console.error("JSONBin error:", binResponse.status, text);
            throw new Error("Failed to fetch analytics bin");
        }

        const result = await binResponse.json();

        const data = result.record || {};

        if (!data.count) {
            data.count = 0;
        }

        if (!data.visits) {
            data.visits = [];
        }

        data.count += 1;
        data.visits.unshift(newVisit);

        const saveResponse = await fetch(
            `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_VISITS_BIN_ID}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": process.env.JSONBIN_API_KEY,
                },
                body: JSON.stringify(data),
            }
        );

        if (!saveResponse.ok) {
            throw new Error("Failed to save analytics");
        }

        return res.status(200).json({
            success: true,
        });

    } catch (error) {
        console.error("Analytics error:", error);

        return res.status(500).json({
            error: "Failed to record visit",
        });
    }
}