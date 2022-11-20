const express = require('express');
const oykuController = require('../controllers/oykuController');

const router = express.Router();

router.get('/oykuler', oykuController.oyku_index);
router.get('/hafta/:hafta', oykuController.hafta_index);
router.get('/yazar/:yazar', oykuController.yazar_index);
router.get('/rastgele', oykuController.rastgele_oyku);
router.post('/oykuler/', oykuController.oyku_yeni);

module.exports = router;