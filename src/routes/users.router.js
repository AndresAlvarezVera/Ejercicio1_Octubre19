import express from 'express';
import path from 'path';
import { upload } from '../middlewares/multer.middleware.js';
import { hashPassword } from '../util/crypto.js';
import { readData, writeData } from '../util/file.util.js';

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
        res.status(500).json({ error: 'Internal Server Error' }); // 500 para fallos
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
            password: hashPassword(password), // Encriptación
            avatar: req.file ? `/img/users/${req.file.filename}` : null
        };

        users.push(newUser);
        await writeData(DATA_FILE, users);
        res.status(201).json({ message: 'Usuario creado', id: newUser.id }); // 201 Created
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;