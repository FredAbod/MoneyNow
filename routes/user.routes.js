const { SignUp, otp, nameSignUp, passwordSignUp, bvnSignUp, userLogin, forgotPassword, resetPassword, gen_ref_ID, resend_code } = require('../controllers/user.controllers');

const router = require('express').Router();

router.post("/signup", SignUp)
router.post('/otp', otp)
router.post('/login', userLogin)
router.put('/forgotpassword', forgotPassword)
router.post('/ref/:id', gen_ref_ID)
router.put('/nameSignUp/:id', nameSignUp)
router.put('/bvnSignUp/:id', bvnSignUp)
router.put('/passwordSignUp/:id', passwordSignUp)
router.put('/resetpassword/:id', resetPassword)
router.put('/resetotp/:id', resend_code)

module.exports = router;