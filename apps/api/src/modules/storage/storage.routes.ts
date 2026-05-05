import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from '../../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Resolve to apps/api/storage/
const STORAGE_ROOT   = path.join(__dirname, '../../../../storage');
const IMAGES_DIR     = path.join(STORAGE_ROOT, 'images');
const EMAILS_DIR     = path.join(STORAGE_ROOT, 'emails');

// Ensure directories always exist
[IMAGES_DIR, EMAILS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const router = Router();

// All storage routes require admin auth
router.use(requireAuth);

// ─── IMAGES ──────────────────────────────────────────────────────────────────

/** GET /api/admin/storage/images — list all uploaded images */
router.get('/images', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(IMAGES_DIR)
      .filter(f => !f.startsWith('.'))
      .map(filename => {
        const stat = fs.statSync(path.join(IMAGES_DIR, filename));
        return {
          filename,
          url: `/images/${filename}`,
          sizeBytes: stat.size,
          sizeKb: Math.round(stat.size / 1024),
          uploadedAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    res.json({ total: files.length, files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/storage/images/:filename — delete an image */
router.delete('/images/:filename', (req: Request, res: Response) => {
  // Prevent path traversal
  const filename = path.basename(req.params.filename);
  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, deleted: filename });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EMAILS ──────────────────────────────────────────────────────────────────

/** GET /api/admin/storage/emails — list all saved helpdesk email submissions */
router.get('/emails', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(EMAILS_DIR)
      .filter(f => f.endsWith('.json'))
      .map(filename => {
        try {
          const raw  = fs.readFileSync(path.join(EMAILS_DIR, filename), 'utf-8');
          const data = JSON.parse(raw);
          return { id: filename.replace('.json', ''), filename, ...data };
        } catch {
          return { id: filename.replace('.json', ''), filename, error: 'Unreadable' };
        }
      })
      .sort((a, b) => {
        const ta = a.receivedAt ? new Date(a.receivedAt).getTime() : 0;
        const tb = b.receivedAt ? new Date(b.receivedAt).getTime() : 0;
        return tb - ta;
      });

    res.json({ total: files.length, emails: files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/admin/storage/emails/:id — read a single submission */
router.get('/emails/:id', (req: Request, res: Response) => {
  const filename = path.basename(req.params.id) + '.json';
  const filePath = path.join(EMAILS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Email not found' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** DELETE /api/admin/storage/emails/:id — delete a submission */
router.delete('/emails/:id', (req: Request, res: Response) => {
  const filename = path.basename(req.params.id) + '.json';
  const filePath = path.join(EMAILS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Email not found' });
  }
  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, deleted: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Exported helpers ─────────────────────────────────────────────────────────

/**
 * Call this after any helpdesk/contact form submission to persist it as a file.
 * Usage: saveEmailToStorage(formData)
 */
export function saveEmailToStorage(payload: Record<string, any>): void {
  try {
    const id       = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const filename = `${id}.json`;
    const record   = { id, receivedAt: new Date().toISOString(), ...payload };
    fs.writeFileSync(path.join(EMAILS_DIR, filename), JSON.stringify(record, null, 2), 'utf-8');
  } catch (err) {
    console.error('[storage] Failed to save email to disk:', err);
  }
}

/**
 * Get the absolute path for the images storage directory.
 * Used by upload.routes.ts.
 */
export { IMAGES_DIR, EMAILS_DIR, STORAGE_ROOT };

export default router;
