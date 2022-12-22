const { save, deposit } = require('../controllers/transaction.controller');

const router = require('express').Router();

router.post('/save',save )
router.post('/deposit', deposit)

module.exports = router;
