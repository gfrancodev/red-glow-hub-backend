import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import type { CreateReportInputType, CreateReportResponse } from './reports.schema';

export class ReportsService {
  async createReport(
    input: CreateReportInputType,
    reporterUserId?: string
  ): Promise<CreateReportResponse> {
    // Verify target exists
    let targetExists = false;

    if (input.target_type === 'media') {
      const media = await db.media.findUnique({
        where: { id: input.target_id },
      });
      targetExists = !!media;
    } else if (input.target_type === 'profile') {
      const profile = await db.profile.findUnique({
        where: { id: input.target_id },
      });
      targetExists = !!profile;
    } else {
      const user = await db.user.findUnique({
        where: { id: input.target_id },
      });
      targetExists = !!user;
    }

    if (!targetExists) {
      throw E.NOT_FOUND({ entity: input.target_type, target_id: input.target_id });
    }

    // TODO: Implement hCaptcha verification if token provided
    if (input.hcaptcha_token) {
      // Verify hCaptcha token
      // const isValid = await verifyHCaptcha(input.hcaptcha_token);
      // if (!isValid) {
      //   throw E.BAD_REQUEST({ meta: { field: 'hcaptcha_token', message: 'Invalid captcha' } });
      // }
    }

    // Create report
    const report = await db.report.create({
      data: {
        reporter_user_id: reporterUserId,
        target_type: input.target_type,
        target_id: input.target_id,
        reason: input.reason,
        details: input.details,
        status: 'open',
        severity: 'low',
      },
    });

    return {
      success: true,
      data: {
        report_id: report.id,
        status: report.status,
        created_at: report.created_at.toISOString(),
      },
    };
  }
}
