import express from 'express';
import path from 'path';
import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';

const app = express();
const PORT = 3000; // Puerto del servidor

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servidor de Archivos Estáticos (RE-01)
app.use(express.static(path.join(__dirname, '../public'))); // Exponer directorio public

// Rutas
app.use('/api/users', usersRouter); // Prefijo para usuarios
app.use('/api/pets', petsRouter); // Prefijo para mascotas

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});