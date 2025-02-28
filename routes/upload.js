const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const db = require("../configs/db");
const { processImages } = require("../workers/imageProcessor");

const uploadRouter = express.Router();
const upload = multer({ dest: "uploads/" }); // Temp storage for CSV files

// Upload CSV API
uploadRouter.post("/", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "..", req.file.path);
    const requestId = await db("requests").insert({ status: "pending" }).returning("id");

    const images = [];

    fs.createReadStream(filePath)
    .pipe(csvParser({ headers: true, skipEmptyLines: true, trim: true }))
    .on("data", (row) => {
        console.log("Parsed Row:", row); // Debugging

        const serialNumber = row['_0'];
        const productName = row['_1'];
        const imageUrlsArray = Object.values(row).slice(2); // Capture all image columns dynamically
        console.log({imageUrlsArray});
        if (serialNumber && productName && imageUrlsArray.length > 0) {
            imageUrlsArray.forEach((imageUrl) => {
                if (imageUrl && imageUrl.trim() !== "") {
                    images.push({
                        request_id: requestId[0].id,
                        serial_number: parseInt(serialNumber, 10) || 0, // Ensure valid integer
                        product_name: productName,
                        input_image_path: imageUrl.trim(),
                    });
                }
            });
        } else {
            console.warn("Invalid row format after fix:", row);
        }
    })
    .on("end", async () => {
        if (images.length === 0) {
            return res.status(400).json({ error: "No valid images found in CSV" });
        }

        await db("images").insert(images);
        fs.unlinkSync(filePath);

        // Process all images asynchronously
        processImages(requestId[0].id);

        res.json({ request_id: requestId[0].id });
    })
    .on("error", (err) => {
        console.error("CSV Parsing Error:", err);
        res.status(500).json({ error: "Error processing CSV file" });
    });

});


module.exports = uploadRouter;
