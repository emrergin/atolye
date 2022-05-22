const express = require('express');
const uyeController = require('../controllers/uyeController');

const router = express.Router();

router.get('/', uyeController.uyeMain);
router.put('/yazcam', uyeController.yazToggle);
router.put('/yorumladim/:id', uyeController.yorumToggle1);
router.put('/onayladim/:id', uyeController.yorumToggle2);
router.get('/yetkili', uyeController.yetkiliSayfa);
router.post('/gorev', uyeController.gorevBelirleme);
router.put('/haftaTatili', uyeController.haftaTatili);

module.exports = router;