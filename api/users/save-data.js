const { savePlayerData } = require('../../backend/db/controllers/userController');
const { auth } = require('../../backend/db/middleware/auth');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await auth(req, res, async () => {
      await savePlayerData(req, res);
    });
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
};
