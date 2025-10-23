import { asyncHandler } from '@/shared/core/http';
import { validate } from '@/shared/middleware/validate';
import { Router } from 'express';
import {
  ListPlayersQuery,
  SearchQuery,
  TrendingQuery,
  type ListPlayersQueryType,
  type SearchQueryType,
  type TrendingQueryType,
} from './players.schema';
import { PlayersService } from './players.service';

const router = Router();
const playersService = new PlayersService();

// GET /players
router.get(
  '/',
  validate({ query: ListPlayersQuery }),
  asyncHandler(async (req, res) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await playersService.listPlayers(query as unknown as ListPlayersQueryType);
    res.json(result);
  })
);

// GET /players/search
router.get(
  '/search',
  validate({ query: SearchQuery }),
  asyncHandler(async (req, res) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await playersService.search(query as unknown as SearchQueryType);
    res.json(result);
  })
);

// GET /players/trending
router.get(
  '/trending',
  validate({ query: TrendingQuery }),
  asyncHandler(async (req, res) => {
    const query = (req as any).validatedQuery || req.query;
    const result = await playersService.getTrending(query as unknown as TrendingQueryType);
    res.json(result);
  })
);

// GET /players/:username
router.get(
  '/:username',
  asyncHandler(async (req, res) => {
    const result = await playersService.getPlayerByUsername(req.params.username as string);
    res.json({ success: true, data: result });
  })
);

// GET /players/:username/media
router.get(
  '/:username/media',
  asyncHandler(async (req, res) => {
    const result = await playersService.getPlayerMedia(req.params.username as string, {
      type: req.query.type as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      cursor: req.query.cursor as string,
    });
    res.json({ success: true, data: result });
  })
);

export default router;
