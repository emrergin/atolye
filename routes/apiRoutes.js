const express = require('express');
const apiController = require('../controllers/apiController');

const router = express.Router();

router.get('/oykuler', apiController.oykuler);
// router.put('/yazcam', uyeController.yazToggle);

module.exports = router;