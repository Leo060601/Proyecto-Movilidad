import { body, param } from 'express-validator';

export const createRouteValidator = [
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  body('city').notEmpty().withMessage('La ciudad es obligatoria'),
  body('waypoints').isObject().withMessage('Waypoints debe ser un objeto GeoJSON válido'),
  body('waypoints.coordinates').isArray({ min: 2 }).withMessage('Waypoints debe tener al menos dos coordenadas'),
  body('schedule').optional().isArray(),
  body('telemetry').optional().isArray(),
];

export const updateRouteValidator = [
  param('id').isMongoId().withMessage('ID inválido'),
  ...createRouteValidator
];

export const routeIdValidator = [
  param('id').isMongoId().withMessage('ID inválido')
];
