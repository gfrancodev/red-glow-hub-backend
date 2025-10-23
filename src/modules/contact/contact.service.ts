import db from '@/shared/config/db.config';
import { E } from '@/shared/errors';
import type { ContactInputType, ContactResponse } from './contact.schema';

export class ContactService {
  async createContact(
    input: ContactInputType,
    requesterIp?: string,
    userAgent?: string
  ): Promise<ContactResponse> {
    // Verify player exists and is active
    const player = await db.profile.findUnique({
      where: { id: input.player_id },
    });

    if (player?.status !== 'active') {
      throw E.NOT_FOUND({ entity: 'player', player_id: input.player_id });
    }

    // TODO: Implement hCaptcha verification if token provided
    if (input.hcaptcha_token) {
      // Verify hCaptcha token
      // const isValid = await verifyHCaptcha(input.hcaptcha_token);
      // if (!isValid) {
      //   throw E.BAD_REQUEST({ meta: { field: 'hcaptcha_token', message: 'Invalid captcha' } });
      // }
    }

    // Create contact event
    const contactEvent = await db.contact_event.create({
      data: {
        player_id: input.player_id,
        channel: input.channel,
        requester_ip: requesterIp,
        user_agent: userAgent,
        message: input.message,
        status: 'active',
      },
    });

    return {
      success: true,
      data: {
        contact_id: contactEvent.id,
        status: contactEvent.status,
        created_at: contactEvent.created_at.toISOString(),
      },
    };
  }
}
