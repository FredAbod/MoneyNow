const { SignUp, otp, nameSignUp, passwordSignUp, bvnSignUp, userLogin, forgotPassword, resetPassword, gen_ref_ID, resend_code, userName, one, userBalance } = require('../controllers/user.controllers');
const { isAuthenticated, validateAdmin } = require('../middleware/auth');

const router = require('express').Router();

// router.get('/user/one', one)
router.post("/signup", SignUp)
router.post('/otp', otp)
router.post('/login', userLogin)
router.put('/forgotpassword/user', forgotPassword)
router.put('/nameSignUp', nameSignUp)
router.put('/bvnSignUp', bvnSignUp)
router.get('/username', userName)
router.get('/userbalance',isAuthenticated, userBalance)
router.put('/passwordSignUp', passwordSignUp)
router.put('/resetpassword', resetPassword)
router.put('/resetotp/:id', resend_code)
router.post('/ref/:id', gen_ref_ID)

module.exports = router;