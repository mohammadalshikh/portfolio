import crypto from "crypto";

export default async function handler(req, res) {

    if (req.method === "GET") {
        try {
            const response = await fetch(
                `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_MAIN_BIN_ID}/latest`
            );

            const result = await response.json();

            return res.status(200).json({
                data: result.record,
            });
        } catch {
            return res.status(500).json({
                error: "Failed to fetch main data",
            });
        }
    }

    if (req.method === "PATCH") {
        try {
            const { password, data } = req.body;

            const hash = crypto
                .createHash("sha256")
                .update(password)
                .digest("hex");

            if (hash !== process.env.PASSWORD_HASH) {
                return res.status(401).json({
                    error: "Wrong password",
                });
            }

            const response = await fetch(
                `https://api.jsonbin.io/v3/b/${process.env.JSONBIN_MAIN_BIN_ID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Master-Key": process.env.JSONBIN_API_KEY,
                    },
                    body: JSON.stringify(data),
                }
            );

            const result = await response.json();

            return res.status(200).json(result);

        } catch (error) {
            console.error("PATCH /main error:", error);

            return res.status(500).json({
                error: "Failed to save main data",
            });
        }
    }

    return res.status(405).json({
        error: "Method not allowed",
    });
}