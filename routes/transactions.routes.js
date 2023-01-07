const { save, deposit, withdraw, userTransactions } = require('../controllers/transaction.controller');
const { isAuthenticated, validateAdmin } = require('../middleware/auth');
const router = require('express').Router();

router.post('/save',isAuthenticated, save )
router.post('/deposit', deposit)
router.get('/usertransaction',isAuthenticated, userTransactions)
router.post('/withdraw', withdraw)
 
module.exports = router;
