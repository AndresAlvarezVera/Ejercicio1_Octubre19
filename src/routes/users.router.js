import express from 'express';
import path from 'path';
import upload from '../middlewares/multer.middleware.js';
import { hashPassword } from '../util/crypto.js';
import { fileURLToPath } from 'url';
import { readData, writeData } from '../util/file.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/users.json');

router.get('/', async (req, res) => {
    try {
        const users = await readData(DATA_FILE);
        const safeUsers = users.map(u => {
            const { password, ...safeUser } = u; // Omitir campo password
            return safeUser;
        });
        res.status(200).json(safeUsers); // 200 OK
    } catch (error) {
        console.error("Error detallado al crear usuario:", error);
        res.status(500).json({ error: 'Internal Server Error' }); // 500 para fallos
    }
});

router.get('/:id', async (req, res) => {
    try {
        const users = await readData(DATA_FILE);
        const user = users.find(u => u.id === parseInt(req.params.id));

        if (!user)
            return res.status(404).json({ error: 'Usuario no encontrado' });
        const { password, ...safeUser } = user; // Omite la contraseña
        res.status(200).json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', upload.single('avatar'), async (req, res) => {
    try {
        const { firstname, lastname, username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Campos faltantes' }); // 400 Bad request
        }

        const users = await readData(DATA_FILE);
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            firstname,
            lastname,
            username,
            password: hashPassword(password), // Encriptación de la contraseña
            avatar: req.file ? `/img/users/${req.file.filename}` : null
        };

        users.push(newUser);
        await writeData(DATA_FILE, users);
        res.status(201).json({ message: 'Usuario creado', id: newUser.id }); // 201 Created
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', upload.single('avatar'), async (req, res) => {
    try {
        const users = await readData(DATA_FILE);
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

        if (userIndex === -1)
            return res.status(404).json({ error: 'Usuario no encontrado' });

        const { firstname, lastname, username, password } = req.body;

        // Actualiza los campos si vienen en la petición
        if (firstname) users[userIndex].firstname = firstname;
        if (lastname) users[userIndex].lastname = lastname;
        if (username) users[userIndex].username = username;

        // Re-encripta la contraseña si se envía una nueva contraseña
        if (password) {
            users[userIndex].password = hashPassword(password);
        }

        // Reemplaza el avatar si se sube un nuevo archivo
        if (req.file) {
            users[userIndex].avatar = `/img/users/${req.file.filename}`;
        }

        await writeData(DATA_FILE, users);
        res.status(200).json({ message: 'Usuario actualizado con éxito', user: users[userIndex].id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const users = await readData(DATA_FILE);
        const filteredUsers = users.filter(u => u.id !== parseInt(req.params.id));

        if (users.length === filteredUsers.length) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        await writeData(DATA_FILE, filteredUsers);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;