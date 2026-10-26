import express from 'express';
import path from 'path';
import upload from '../middlewares/multer.middleware.js';
import { fileURLToPath } from 'url';
import { readData, writeData } from '../util/file.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

router.get('/:id', async (req, res) => {
    try {
        const pets = await readData(DATA_FILE);
        const pet = pets.find(p => p.id === parseInt(req.params.id));

        if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

        res.status(200).json(pet);
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

router.put('/:id', upload.array('img', 5), async (req, res) => {
    try {
        const pets = await readData(DATA_FILE);
        const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));

        if (petIndex === -1) return res.status(404).json({ error: 'Mascota no encontrada' });

        const { especie, color, edad, sexo } = req.body;

        // Se actualizan los datos generales
        if (especie) pets[petIndex].especie = especie;
        if (color) pets[petIndex].color = color;
        if (edad) pets[petIndex].edad = Number(edad);
        if (sexo) pets[petIndex].sexo = sexo;

        // Se agregan las nuevas imágenes si se envían los archivos
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(f => `/img/pets/${f.filename}`);
            pets[petIndex].img = [...(pets[petIndex].img || []), ...newImages];
        }

        await writeData(DATA_FILE, pets);
        res.status(200).json({ message: 'Mascota actualizada con éxito', pet: pets[petIndex].id });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const pets = await readData(DATA_FILE);
        const filteredPets = pets.filter(p => p.id !== parseInt(req.params.id));

        if (pets.length === filteredPets.length) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        await writeData(DATA_FILE, filteredPets);
        res.status(200).json({ message: 'Mascota eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;