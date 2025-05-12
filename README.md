# 🗡️ SoulsAdventure

**Souls Adventure** es un juego de rol por turnos ambientado en un mundo de fantasía oscura. Tu misión será salvar a tu pueblo de una maldición que ha generado diversos enemigos. Deberás encender las hogueras encargadas de proteger el pueblo con sus llamas.

---

## ⚔️ Características Principales

- Combates por turnos con mecánicas estratégicas.
- Mundo abierto explorable con diferentes áreas.
- Sistema de progresión basado en almas.
- Hogueras para guardar progreso y viajar rápidamente.
- Inventario y equipamiento con diversos objetos y armas.
- Jefes finales desafiantes con mecánicas únicas.

---

## 🔧 Requisitos Técnicos

- Node.js (v14.x o superior)
- MongoDB Atlas
- Navegador web moderno (Chrome, Firefox, Edge)

---

## 🛠️ Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/SoulsAdventure.git
   cd SoulsAdventure
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:

   - Crea un archivo `.env` en la raíz del proyecto.
   - Añade la URL de conexión a MongoDB Atlas:

     ```env
     MONGODB_URL=tu_url_de_conexion_mongodb_atlas
     BASE_API=http://localhost:3000
     ```

---

## 🚀 Iniciar el Juego

1. Inicia el servidor:
   ```bash
   node backend/server.js
   ```

2. Abre en tu navegador:
   ```
   http://localhost:3000
   ```

3. Crea un nuevo personaje y ¡comienza tu aventura!

---

## 💾 Base de Datos

El juego utiliza **MongoDB Atlas** para almacenar:

- Datos de los personajes
- Progreso del jugador
- Inventario y estadísticas

> Asegúrate de configurar correctamente la URL de conexión en el archivo `.env` antes de iniciar el servidor.
