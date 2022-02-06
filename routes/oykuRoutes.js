const express = require('express');
const oykuController = require('../controllers/oykuController');

const router = express.Router();

// router.get('/create', blogController.oyku_yeni);
router.get('/oykuler', oykuController.oyku_index);
router.get('/hafta/:hafta', oykuController.hafta_index);
router.get('/yazar/:yazar', oykuController.yazar_index);
router.get('/rastgele', oykuController.rastgele_oyku);
// router.post('/', blogController.blog_create_post);
router.post('/oykuler', oykuController.oyku_yeni);
router.post('/', oykuController.oyku_gecici);
// router.get('/:id', blogController.blog_details);
// router.delete('/:id', blogController.blog_delete);

module.exports = router;