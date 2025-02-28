# Image Processing API

## Overview
This project is a backend system that processes images from a CSV file asynchronously. It allows users to:
- Upload a CSV containing product names and image URLs.
- Compress images by 50% and store them locally.
- Track processing status via an API.

---

## Features
✅ CSV Upload API

✅ Image Compression (Sharp)

✅ PostgreSQL Database (Render)

✅ Status Check API

---

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Hosted on Render)
- **Image Processing:** Sharp
- **File Uploads:** Multer

---

## Setup Instructions

### 1️⃣ Clone the Repository
```sh
 git clone <repository-url>
 cd image-processing
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file and add the following:
```env
PORT=8080
DATABASE_URL=<your_postgres_connection_url>
```
- testing porpose
  
```env 
DATABASE_URL = postgresql://expensetracker_o6lh_user:5J1JfPkVLOF2GilQCmZvMHKVwkm7uTZE@dpg-cv0ck9l2ng1s73el50rg-a.oregon-postgres.render.com/expensetracker_o6lh
PORT = 8080
```


### 5️⃣ Start the Server
```sh
node index.js
```

---

## API Documentation

### **1️⃣ Upload CSV File**
**Endpoint:** `POST /upload`

**Request:**
```sh
curl -X POST http://localhost:8080/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample.csv" \
  -F "webhook_url=https://example.com/webhook"
```

**Response:**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### **2️⃣ Check Processing Status**
**Endpoint:** `GET /status?request_id=<request_id>`

**Request:**
```sh
curl -X GET "http://localhost:8080/status?request_id=123e4567-e89b-12d3-a456-426614174000"
```

**Response (Processing Incomplete):**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "processing"
}
```

**Response (Processing Completed):**
```json
{
  "request_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "images": [
    {
      "serial_number": 1,
      "product_name": "SKU1",
      "input_image_path": "/uploads/image1.jpg",
      "output_image_path": "/processed_images/output_image1.jpg"
    }
  ]
}
```

---

## Future Improvements
- AWS S3 Support for Image Storage
- Rate Limiting & Authentication
- UI Dashboard for Monitoring Requests

---



