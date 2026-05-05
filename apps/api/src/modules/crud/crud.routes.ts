import { Router, Request, Response } from 'express';
import db from '../../config/db.js';
import { requireAuth } from '../../middlewares/auth.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();

const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Too many form submissions, please try again later' },
});

export const setupCrudRoute = (path: string, zodSchema?: any, protectPost = false) => {
  const table = path.replace(/-/g, '_');

  router.get(`/${path}`, async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const items = await db(table)
        .orderBy('created_at', 'desc')
        .offset(skip)
        .limit(limit);
      
      const [{ count }] = await db(table).count('id as count');
      const total = parseInt(count as string);

      const mappedItems = items.map((it: any) => ({ ...it, _id: it.id }));

      res.json({
        items: mappedItems,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  const postHandlers: any[] = [];
  if (protectPost) postHandlers.push(requireAuth);
  if (['helpline', 'corporate-enrollments', 'applications'].includes(path)) {
    postHandlers.push(formLimiter);
  }

  router.post(`/${path}`, ...postHandlers, async (req: any, res: Response) => {
    try {
      const validatedData = zodSchema ? zodSchema.parse(req.body) : req.body;
      const [newId] = await db(table).insert(validatedData).returning('id');
      const item = await db(table).where('id', newId).first();

      res.json({ ...item, _id: item.id });
    } catch (err: any) {
      console.error(`CRUD POST Error [${path}]:`, err);
      res.status(400).json({ error: err.errors || err.message });
    }
  });
};

setupCrudRoute('news', null, true);
setupCrudRoute('products', null, true);
setupCrudRoute('bulk-listings', null, true);
setupCrudRoute('partners', null); 
setupCrudRoute('corporate-enrollments', null); 
setupCrudRoute('buyer-needs', null); 
setupCrudRoute('helpline', null);
setupCrudRoute('schemes', null, true);
setupCrudRoute('applications', null);
setupCrudRoute('market-prices', null);

export default router;
