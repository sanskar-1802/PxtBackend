const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/budgetController');

router.use(protect);

router.post('/', ctrl.addBudget);
router.get('/', ctrl.getBudgets);
router.get('/status', ctrl.getBudgetStatus);
router.delete('/:id', ctrl.deleteBudget);

module.exports = router;
