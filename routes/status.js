const express = require("express");
const fs = require("fs");
const db = require("../configs/db");
const statusRouter  =  express.Router(); 
statusRouter.get("/", async (req, res) => {
    const { request_id } = req.query;

    if (!request_id) {
        return res.status(400).json({ error: "Missing request_id" });
    }

    try {
        // Fetch request status
        const request = await db("requests").where({ id: request_id }).first();

        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        // If processing is completed, return output image paths
        if (request.status === "completed") {
            const images = await db("images")
                .where({ request_id })
                .select("serial_number", "product_name", "input_image_path", "output_image_path");
                // slef cleraing storeage
                setTimeout(() => {
                    fs.rm("processed_images", { recursive: true, force: true }, (err) => {
                        if (err) console.error("Error deleting folder:", err);
                        else console.log("Processed images folder deleted.");
                    });
                }, 60000);
            return res.json({
                request_id,
                status: request.status,
                images,
            });
        }
      
        // If still pending/processing, return status only
        res.json({
            request_id,
            status: request.status,
        });
    } catch (error) {
        console.error("Error fetching request status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = statusRouter