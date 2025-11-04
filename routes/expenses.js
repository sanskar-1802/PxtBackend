const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const expenseCtrl = require('../controllers/expenseController');

// All expense routes require authentication
router.use(protect);

// Create a new expense/income
router.post('/add', expenseCtrl.createExpense);

// Get all user expenses
router.get('/all', expenseCtrl.getExpenses);

// Get a single expense by ID
router.get('/:id', expenseCtrl.getExpense);

// Update expense
router.put('/:id', expenseCtrl.updateExpense);

// Delete expense
router.delete('/:id', expenseCtrl.deleteExpense);

module.exports = router;
