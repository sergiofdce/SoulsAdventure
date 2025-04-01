// server.js
const app = require("./app");
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor iniciado en: http://0.0.0.0:${PORT}');
});

// app.listen(PORT, () => {
//   console.log(`Servidor inciado en: http://localhost:${PORT}`);
// });
