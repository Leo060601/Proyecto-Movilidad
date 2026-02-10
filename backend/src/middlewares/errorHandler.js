// Middleware global para manejo de errores
export default function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}
