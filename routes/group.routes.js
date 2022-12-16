const { create_group, add_participant } = require('../controllers/group.controller');

const router = require('express').Router();

router.post('/create', create_group )
router.put('/add', add_participant)

module.exports = router;
