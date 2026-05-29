import multer from "multer";
import path from "path";
import fs from "fs";

// Create directories if they don't exist
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
ensureDir('uploads/questions');
ensureDir('uploads/faculty');
ensureDir('uploads/events');
ensureDir('uploads/videos');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'facultyImage' || file.fieldname === 'cv') {
            cb(null, 'uploads/faculty');
        } else if (file.fieldname === 'eventImage') {
            cb(null, 'uploads/events');
        } else if (file.fieldname === 'lectureVideo') {
            cb(null, 'uploads/videos');
        } else {
            cb(null, 'uploads/questions');
        }
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

export default upload;