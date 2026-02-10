import express from 'express';

import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} from '../controllers/route.controller.js';

import {
  createRouteValidator,
  updateRouteValidator,
  routeIdValidator
} from '../validators/route.validator.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = express.Router();



// GET /api/v1/routes
router.get('/', getAllRoutes);
// GET /api/v1/routes/:id
router.get('/:id', routeIdValidator, validateRequest, getRouteById);
// POST /api/v1/routes
router.post('/', createRouteValidator, validateRequest, createRoute);
// PUT /api/v1/routes/:id
router.put('/:id', updateRouteValidator, validateRequest, updateRoute);
// DELETE /api/v1/routes/:id
router.delete('/:id', routeIdValidator, validateRequest, deleteRoute);

export default router;
