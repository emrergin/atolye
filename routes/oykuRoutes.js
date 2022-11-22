const express = require('express');
const storyController = require('../controllers/oykuController');

const router = express.Router();

router.get('/oykuler', storyController.storyIndex);
router.get('/hafta/:hafta', storyController.weekIndex);
router.get('/yazar/:yazar', storyController.authorIndex);
router.get('/rastgele', storyController.randomStory);
router.post('/oykuler/', storyController.newStory);

module.exports = router;