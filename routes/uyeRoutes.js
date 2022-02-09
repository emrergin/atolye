const express = require('express');
const uyeController = require('../controllers/uyeController');

const router = express.Router();

router.get('/', uyeController.uyeMain);
router.put('/yazcam', uyeController.yazToggle);

module.exports = router;