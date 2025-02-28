require("dotenv").config();
const express = require("express");
const db = require("./configs/db");
const uploadRouter = require("./routes/upload");
const fs = require("fs");
const statusRouter = require("./routes/status");
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Image Processing API is running!");
});

app.use('/status' , statusRouter)
app.use('/upload' , uploadRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    try {
        db;
        console.log(`Server running on port ${PORT}`)
    } catch (error) {
        console.log({error : error});
    }
});
