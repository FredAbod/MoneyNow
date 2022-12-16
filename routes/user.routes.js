const { SignUp, otp, nameSignUp, passwordSignUp, bvnSignUp, userLogin, forgotPassword, resetPassword, gen_ref_ID } = require('../controllers/user.controllers');

const router = require('express').Router();

router.post("/signup", SignUp)
router.post('/otp', otp)
router.post('/login', userLogin)
router.post('/ref', gen_ref_ID)
router.put('/nameSignUp', nameSignUp)
router.put('/bvnSignUp', bvnSignUp)
router.put('/forgotpassword', forgotPassword)
router.put('/passwordSignUp', passwordSignUp)
router.put('/resetpassword', resetPassword)

module.exports = router;