const express        = require('express');
const router         = express.Router();
const ctrl           = require('../controllers/groupController');
const { check }      = require('../middlewares/isAuthenticated');

router.use(check);

router.get   ('/:id', ctrl.getOne);
router.post  ('/',    ctrl.create);
router.put   ('/:id', ctrl.update);
router.delete('/:id', ctrl.remove); // fixed: was ctrl.delete — controller exports ctrl.remove

module.exports = router;
