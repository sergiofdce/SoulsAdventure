// Adaptación para Vercel Serverless Function
import { register } from '../../backend/db/controllers/userController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await register(req, res);
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
