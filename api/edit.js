import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { password, data } = req.body;

    const hash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    if (hash !== process.env.PASSWORD_HASH) {
        return res.status(401).json({ error: "Wrong password" });
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

    res.json(result);
}