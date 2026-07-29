import formidable from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed",
        });
    }

    try {
        const form = formidable();

        const [, files] = await form.parse(req);

        const image = files.image?.[0];

        if (!image) {
            return res.status(400).json({
                error: "No image provided",
            });
        }

        const buffer = await fs.promises.readFile(image.filepath);

        const formData = new FormData();

        formData.append(
            "image",
            new Blob([buffer]),
            image.originalFilename
        );

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                method: "POST",
                body: formData,
            }
        );

        const result = await response.json();

        if (!result.success) {
            return res.status(500).json({
                error: "ImgBB upload failed",
            });
        }

        return res.status(200).json({
            url: result.data.url,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to upload image",
        });
    }
}