// Simple Express server to accept an image upload, compress it (keeping same extension),
// and return compressed image data and stats.
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Use memory storage so we can process the buffer directly
const upload = multer({ storage: multer.memoryStorage() });

// Helper to format bytes nicely
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

app.post('/compress', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const originalBuffer = req.file.buffer;
    const originalSize = originalBuffer.length;

    // Use sharp to read metadata and preserve format
    const image = sharp(originalBuffer);
    const meta = await image.metadata();
    const format = (meta.format || '').toLowerCase();

    // Only support common image formats in this demo
    if (!['jpeg', 'jpg', 'png', 'webp'].includes(format)) {
      return res.status(400).json({ error: 'Unsupported image format. Please upload JPG/PNG/WebP.' });
    }

    let compressedBuffer;

    // Choose compression strategy by format, but ensure output format remains the same
    if (format === 'jpeg' || format === 'jpg') {
      // Re-encode JPEG with lower quality (lossy) to reduce size
      compressedBuffer = await image.jpeg({ quality: 70, mozjpeg: true }).toBuffer();
    } else if (format === 'png') {
      // For PNG, use palette (quantize) + high compression level for smaller files while keeping .png
      // palette: true produces an 8-bit paletted PNG (can be much smaller for photos with limited colors)
      compressedBuffer = await image.png({ compressionLevel: 9, palette: true }).toBuffer();
    } else if (format === 'webp') {
      // For WebP, reduce quality
      compressedBuffer = await image.webp({ quality: 70 }).toBuffer();
    }

    const compressedSize = compressedBuffer.length;

    // Compression ratio as Original / Compressed
    const ratio = compressedSize > 0 ? (originalSize / compressedSize) : null;

    // Prepare a data URL for preview/download on the frontend
    const mime = req.file.mimetype; // keep original mimetype
    const base64 = compressedBuffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;

    // Send JSON response with stats and data URL
    res.json({
      filename: req.file.originalname,
      mime,
      originalSize,
      compressedSize,
      ratio: ratio ? Number(ratio.toFixed(3)) : null,
      originalSizeHuman: formatBytes(originalSize),
      compressedSizeHuman: formatBytes(compressedSize),
      dataUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Compression failed', details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Image compressor demo running on http://localhost:${port}`);
});
