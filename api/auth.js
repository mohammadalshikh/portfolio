import crypto from "crypto";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { password } = req.body;

    const hash = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");

    if (hash !== process.env.PASSWORD_HASH) {
        return res.status(401).json({ error: "Wrong password" });
    }

    return res.status(200).json({ success: true });
}