import express from 'express';
import path from 'path';
import { upload } from '../middlewares/multer.middleware.js';
import { readData, writeData } from '../util/file.util.js';

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/pets.json');

router.get('/', async (req, res) => {
    try {
        const pets = await readData(DATA_FILE);
        res.status(200).json(pets);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', upload.array('img', 5), async (req, res) => {
    try {
        const { especie, color, edad, sexo } = req.body;
        const pets = await readData(DATA_FILE);

        const filePaths = req.files ? req.files.map(f => `/img/pets/${f.filename}`) : [];

        const newPet = {
            id: pets.length > 0 ? pets[pets.length - 1].id + 1 : 1,
            especie,
            color,
            edad: Number(edad),
            sexo,
            img: filePaths // Array con las rutas de las imágenes subidas
        };

        pets.push(newPet);
        await writeData(DATA_FILE, pets);
        res.status(201).json({ message: 'Mascota creada', id: newPet.id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;