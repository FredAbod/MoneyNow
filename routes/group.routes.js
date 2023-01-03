const { create_group, add_participant, allGroups } = require('../controllers/group.controller');
const { isAuthenticated, validateAdmin } = require('../middleware/auth');

const router = require('express').Router();

router.post('/create',isAuthenticated,validateAdmin, create_group )
router.put('/add',isAuthenticated, add_participant)
router.get('/allgroups',isAuthenticated, allGroups)

module.exports = router;
