import { validateToken } from '../../backend/db/controllers/userController';
import { auth } from '../../backend/db/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await auth(req, res, async () => {
      await validateToken(req, res);
    });
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
