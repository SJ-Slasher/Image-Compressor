# Image Compressor (simple demo)

This is a small web application that demonstrates compressing uploaded images while preserving the original file extension (e.g., .jpg -> .jpg). It's intended for academic/demo use and supports JPG, PNG and WebP images.

Features
- Upload an image (JPG/PNG/WebP)
- The server re-encodes the image to reduce size while keeping the same extension
- Shows original size, compressed size, and compression ratio (Original / Compressed)
- Preview the compressed image and download it

Run / Deploy

1. Install dependencies

```bash
cd /home/suprim/Desktop/image-compressor
npm install
```

2. Start the server

```bash
npm start
```

3. Open a browser and go to

http://localhost:3000

Notes and constraints
- The demo intentionally re-encodes images (lossy for JPEG/WebP, palette quantized for PNG) to reduce size.
- The compressed file preserves the same file extension as the uploaded file.
- This demo does not use ZIP/archive formats.
- Only JPG/PNG/WebP are supported in this simple demo. Other file types will return an error.

Small implementation notes
- Server: Express + Multer (memory storage)
- Image processing: Sharp

License: MIT
# Image-Compressor
