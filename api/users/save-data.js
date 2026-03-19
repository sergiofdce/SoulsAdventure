import { savePlayerData } from '../../backend/db/controllers/userController';
import { auth } from '../../backend/db/middleware/auth';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await auth(req, res, async () => {
      await savePlayerData(req, res);
    });
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
