import { asyncHandler } from '@/shared/core/http';
import { Router } from 'express';
import { LocationsService } from './locations.service';

const router = Router();
const locationsService = new LocationsService();

// GET /locations/states
router.get(
  '/states',
  asyncHandler(async (req, res) => {
    const result = await locationsService.getStates();
    res.json(result);
  })
);

// GET /locations/:uf/cities
router.get(
  '/:uf/cities',
  asyncHandler(async (req, res) => {
    const result = await locationsService.getCitiesByState(req.params.uf as string);
    res.json(result);
  })
);

// GET /locations/:uf/:city/players
router.get(
  '/:uf/:city/players',
  asyncHandler(async (req, res) => {
    const result = await locationsService.getPlayersByLocation(
      req.params.uf as string,
      req.params.city as string,
      {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        cursor: req.query.cursor as string | undefined,
      }
    );
    res.json(result);
  })
);

export default router;
