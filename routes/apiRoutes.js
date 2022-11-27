const express = require('express');
const apiController = require('../controllers/apiController');

var cors = require('cors')

const router = express.Router();

router.get('/oykuler/sayfa/:sayfa', cors(), apiController.storiesWithPagination);
router.get('/oykuler', cors(), apiController.oykuler);
router.get('/oykulerKisa', cors(), apiController.oykulerKisa);
router.get('/haftaBilgisi', cors(), apiController.haftaBilgisi);
router.get('/taslak/:id', cors(), apiController.draftCall);
router.put('/taslak/:id', cors(), apiController.draftUpdate);
router.get('/rastgele', cors(), apiController.randomStory);

module.exports = router;