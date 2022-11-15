const express = require('express');
const apiController = require('../controllers/apiController');

var cors = require('cors')

const router = express.Router();

router.get('/oykuler', cors(), apiController.oykuler);
router.get('/oykulerKisa', cors(), apiController.oykulerKisa);
router.get('/haftaBilgisi', cors(), apiController.haftaBilgisi);
router.get('/sessionInfo', cors(), apiController.sessionInfo);
router.get('/taslak/:id', cors(), apiController.draftCall);
router.put('/taslak/:draftId/:userId', cors(), apiController.draftUpdate);

module.exports = router;