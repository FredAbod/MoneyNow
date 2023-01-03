const { SignUp, otp, nameSignUp, passwordSignUp, bvnSignUp, userLogin, forgotPassword, resetPassword, gen_ref_ID, resend_code } = require('../controllers/user.controllers');
const isAuthenticated = require("../middleware/auth");

const router = require('express').Router();

router.post("/signup", SignUp)
router.post('/otp', otp)
router.post('/login', userLogin)
router.post('/ref/:id', gen_ref_ID)
router.put('/forgotpassword', forgotPassword)
router.put('/nameSignUp', nameSignUp)
router.put('/bvnSignUp', bvnSignUp)
router.put('/passwordSignUp', passwordSignUp)
router.put('/resetpassword', resetPassword)
router.put('/resetotp/:id', resend_code)

module.exports = router;