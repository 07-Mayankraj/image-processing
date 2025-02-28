const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");
const db = require("../configs/db");

const OUTPUT_DIR = path.join(__dirname, "..", "processed_images");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to download an image from a URL
async function downloadImage(imageUrl, localPath) {
    const writer = fs.createWriteStream(localPath);
    const response = await axios({ url: imageUrl, responseType: "stream" });

    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
    });
}

// Function to process images
async function processImages(requestId) {
    console.log(`Processing images for request: ${requestId}`);

    const images = await db("images").where({ request_id: requestId });

    for (const image of images) {
        const inputPath = path.join(OUTPUT_DIR, `input_${image.id}.jpg`);
        const outputPath = path.join(OUTPUT_DIR, `output_${image.id}.jpg`);

        try {
            // Download image if it's a URL
            if (image.input_image_path.startsWith("http")) {
                await downloadImage(image.input_image_path, inputPath);
            } else {
                // If it's already a local file path
                fs.copyFileSync(image.input_image_path, inputPath);
            }

            // Compress image using Sharp (reduce quality by 50%)
            await sharp(inputPath).jpeg({ quality: 20 }).toFile(outputPath);

            // Update database with output image path
            await db("images")
                .where({ id: image.id })
                .update({ output_image_path: outputPath });

            console.log(`Processed image saved: ${outputPath}`);
        } catch (error) {
            console.error(`Error processing image ${image.input_image_path}:`, error);
        }
    }

    // Update request status to "completed"
    await db("requests").where({ id: requestId }).update({ status: "completed" });
}

module.exports = { processImages };
