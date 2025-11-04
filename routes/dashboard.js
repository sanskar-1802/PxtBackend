const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.use(protect);
router.get('/summary', ctrl.summary);

// New analytics endpoints
router.get('/category-stats', ctrl.categoryStats);
router.get('/monthly-trends', ctrl.monthlyTrends);
router.get('/goal-progress', ctrl.goalProgress);


module.exports = router;
