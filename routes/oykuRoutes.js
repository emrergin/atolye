const express = require('express');
const storyController = require('../controllers/oykuController');

const router = express.Router();

router.get('/oykuler/sayfa/:sayfa', storyController.storyWithPages);
router.get('/oykuler', storyController.storyWithPages);
router.get('/hafta/:hafta/sayfa/:hafta', storyController.weekWithPages);
router.get('/hafta/:hafta', storyController.weekWithPages);
router.get('/yazar/:yazar/sayfa/:sayfa', storyController.authorWithPages);
router.get('/yazar/:yazar', storyController.authorWithPages);
router.post('/oykuler/', storyController.newStory);


module.exports = router;