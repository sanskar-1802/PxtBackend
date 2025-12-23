const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/goalController');

router.use(protect);

router.post('/', ctrl.addGoal);
router.get('/', ctrl.getGoals);
router.patch('/:id/progress', ctrl.updateGoalProgress);
router.delete('/:id', ctrl.deleteGoal);

module.exports = router;
