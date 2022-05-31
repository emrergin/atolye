const express = require('express');
const apiController = require('../controllers/apiController');

var cors = require('cors')

const router = express.Router();

router.get('/oykuler', cors(), apiController.oykuler);
router.get('/oykulerKisa', cors(), apiController.oykulerKisa);
router.get('/haftaBilgisi', cors(), apiController.haftaBilgisi);
// router.get('/kelimeGetir/:adet',cors(),apiController.kelimeGetir);

module.exports = router;