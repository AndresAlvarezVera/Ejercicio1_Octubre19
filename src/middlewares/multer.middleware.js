import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dest = path.join(__dirname, '../../public/img');
        if (req.baseUrl.includes('users')) {
            dest = path.join(dest, 'users'); // public/img/users para avatares
        } else if (req.baseUrl.includes('pets')) {
            dest = path.join(dest, 'pets'); // public/img/pets para mascotas
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`; // Renombra las imagenes para evitar colisiones
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

export default upload;
