const express = require('express');
const apiController = require('../controllers/apiController');

var cors = require('cors')

const router = express.Router();

router.get('/oykuler', cors(), apiController.oykuler);
router.get('/oykulerKisa', cors(), apiController.oykulerKisa);
// router.put('/yazcam', uyeController.yazToggle);

module.exports = router;