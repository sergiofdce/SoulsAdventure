// Adaptación para Vercel Serverless Function (CommonJS)
const { register } = require('../../backend/db/controllers/userController');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await register(req, res);
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
};
