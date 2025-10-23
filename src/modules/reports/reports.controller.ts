import { asyncHandler } from '@/shared/core/http';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { CreateReportInput } from './reports.schema';
import { ReportsService } from './reports.service';

const router = Router();
const reportsService = new ReportsService();

// POST /reports
router.post(
  '/',
  validate({ body: CreateReportInput }),
  asyncHandler(async (req, res) => {
    const reporterUserId = (req as { user?: { user_id: string } }).user?.user_id;
    const result = await reportsService.createReport(req.body, reporterUserId);
    res.status(201).json(result);
  })
);

export default router;
