import { asyncHandler } from '@/shared/core/http';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import {
  getPlayersByTagParamsSchema,
  getPlayersByTagQuerySchema,
  listTagsQuerySchema
} from './tags.schema';
import { TagsService } from './tags.service';

const router = Router();
const tagsService = new TagsService();

// GET /tags
router.get(
  '/',
  validate({ query: listTagsQuerySchema }),
  asyncHandler(async (req, res) => {
    const result = await tagsService.listTags();
    res.json(result);
  })
);

// GET /tags/:slug/players
router.get(
  '/:slug/players',
  validate({ 
    params: getPlayersByTagParamsSchema, 
    query: getPlayersByTagQuerySchema 
  }),
  asyncHandler(async (req, res) => {
    const validatedParams = (req as any).validatedParams;
    const validatedQuery = (req as any).validatedQuery;
    
    const result = await tagsService.getPlayersByTag(validatedParams.slug, {
      limit: validatedQuery.limit,
      cursor: validatedQuery.cursor,
    });
    res.json(result);
  })
);

export default router;
