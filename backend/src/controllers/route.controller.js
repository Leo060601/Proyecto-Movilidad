import Route from '../models/Route.js';

// Obtener todas las rutas
export const getAllRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    next(err);
  }
};

// Obtener una ruta por ID
export const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(route);
  } catch (err) {
    next(err);
  }
};

// Crear una nueva ruta
export const createRoute = async (req, res, next) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
};

// Actualizar una ruta
export const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(route);
  } catch (err) {
    next(err);
  }
};

// Eliminar una ruta
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json({ message: 'Ruta eliminada' });
  } catch (err) {
    next(err);
  }
};
