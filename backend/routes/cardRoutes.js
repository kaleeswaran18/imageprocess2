const express = require('express');
const multer = require('multer');
const { uploadCard, getCards } = require('../controllers/cardController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadCard);
router.get('/cards', getCards);

module.exports = router;
