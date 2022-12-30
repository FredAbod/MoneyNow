const { save, deposit, withdraw } = require('../controllers/transaction.controller');

const router = require('express').Router();

router.post('/save',save )
router.post('/deposit', deposit)
router.post('/withdraw', withdraw)

module.exports = router;
