import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { requireAuth } from '../../middlewares/auth.js';
import { IMAGES_DIR } from '../storage/storage.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IMAGES_DIR is managed by storage.routes.ts (apps/api/storage/images/)
// Ensure it exists (storage.routes already does this on import, but belt-and-braces)
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const router = Router();

// Multer: save raw upload with a 'raw-' prefix, then we compress and rename
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGES_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `raw-${uniqueSuffix}${ext}`);
  }
});

// Accept any image/* mimetype OR common image extension
const ACCEPTED_IMAGE_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif',
  '.svg', '.bmp', '.tiff', '.tif', '.heic', '.heif', '.ico'
]);

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const mimeOk = file.mimetype.startsWith('image/');
  const extOk  = ACCEPTED_IMAGE_EXTS.has(path.extname(file.originalname).toLowerCase());
  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload an image file.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB raw limit before compression
});

// ─── Compression helper ───────────────────────────────────────────────────────
async function compressImage(rawPath: string, outPath: string, isSvg: boolean): Promise<void> {
  if (isSvg) {
    // SVGs are already vector — copy through unchanged
    fs.copyFileSync(rawPath, outPath);
    return;
  }

  await sharp(rawPath)
    .rotate()                           // auto-rotate from EXIF orientation tag
    .resize({
      width: 1920,
      withoutEnlargement: true,         // never upscale small images
      fit: 'inside',
    })
    .webp({ quality: 82, effort: 4 })   // WebP: great compression, universal browser support
    .withMetadata({ exif: {} })         // strip EXIF for privacy + smaller file
    .toFile(outPath);
}

// ─── Upload route ─────────────────────────────────────────────────────────────
router.post(
  '/upload',
  requireAuth,
  upload.single('image'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const rawPath  = req.file.path;
    const isSvg   = path.extname(req.file.originalname).toLowerCase() === '.svg';
    const outExt  = isSvg ? '.svg' : '.webp';
    const baseName = path.basename(rawPath, path.extname(rawPath));
    const outName  = `${baseName}${outExt}`;
    const outPath  = path.join(IMAGES_DIR, outName);

    try {
      const originalSize = req.file.size;
      await compressImage(rawPath, outPath, isSvg);
      const compressedSize = fs.statSync(outPath).size;

      // Delete the raw file after successful compression
      fs.unlinkSync(rawPath);

      const saving = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
      console.log(
        `[upload] Compressed ${req.file.originalname}: ` +
        `${(originalSize / 1024).toFixed(0)} KB → ${(compressedSize / 1024).toFixed(0)} KB (${saving}% saved)`
      );

      const url = `/images/${outName}`;
      return res.json({
        url,
        filename: outName,
        mimetype: isSvg ? 'image/svg+xml' : 'image/webp',
        originalSize,
        compressedSize,
        savingPercent: parseFloat(saving),
      });
    } catch (err: any) {
      // Clean up partial files on failure
      if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      console.error('[upload] Compression failed:', err.message);
      return res.status(500).json({ error: 'Image processing failed: ' + err.message });
    }
  }
);

// ─── Multer error handler ─────────────────────────────────────────────────────
router.use((err: any, _req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError || err?.message?.startsWith('Unsupported')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

export default router;
