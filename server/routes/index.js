import express from 'express';
import universities from './universities.js';
import credentials from './login-register.js';
import rsos from './rsos.js';
import notifications from './notifications.js';
import comments from './comments.js'
import users from './users.js';
import events from './events.js';
import admin from './admin.js';

const router = express.Router();

import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, join(__dirname, '..', 'public', 'images'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Create multer middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5 MB
    }
});

// Define route for file upload
router.post('/upload', upload.single('image'), (req, res) => {
    // File has been uploaded, do something with it here
    res.send({ success: 'File uploaded successfully', filename: req.file.filename});
});

router.use('/universities', universities);
router.use('/users', users);
router.use('/rsos', rsos);
router.use('/notifications', notifications);
router.use('/comments', comments)
router.use('/events', events);
router.use('/admin', admin)
router.use('/', credentials);

export default router;
