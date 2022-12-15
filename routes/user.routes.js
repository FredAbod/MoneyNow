const { SignUp, otp, nameSignUp, passwordSignUp, bvnSignUp, userLogin, forgotPassword, resetPassword } = require('../controllers/user.controllers');

const router = require('express').Router();

router.post("/signup", SignUp)
router.post('/otp', otp)
router.post('/login', userLogin)
router.put('/nameSignUp', nameSignUp)
router.put('/bvnSignUp', bvnSignUp)
router.put('/forgotpassword', forgotPassword)
router.put('/passwordSignUp', passwordSignUp)
router.put('/resetpassword', resetPassword)

module.exports = router;