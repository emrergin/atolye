const express = require('express');
const uyeController = require('../controllers/uyeController');

const router = express.Router();

router.get('/', uyeController.uyeMain);
router.put('/yazcam', uyeController.yazToggle);
router.get('/yetkili', uyeController.yetkiliSayfa);

module.exports = router;