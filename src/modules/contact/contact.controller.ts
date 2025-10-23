import db from '@/shared/config/db.config';
import { asyncHandler } from '@/shared/core/http';
import { E } from '@/shared/errors';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import { ContactInput } from './contact.schema';
import { ContactService } from './contact.service';

const router = Router();
const contactService = new ContactService();

// POST /contact/:username
router.post(
  '/:username',
  validate({ body: ContactInput }),
  asyncHandler(async (req, res) => {
    // Find player by username
    const player = await db.profile.findUnique({
      where: { username: req.params.username },
    });

    if (!player) {
      throw E.NOT_FOUND({ entity: 'player', username: req.params.username });
    }

    const result = await contactService.createContact(
      { ...req.body, player_id: player.id },
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json(result);
  })
);

export default router;
