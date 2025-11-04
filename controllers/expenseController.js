const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

// ➤ Create Expense / Income
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, type, recurrence, nextDueDate } = req.body;

    if (!title || !amount || !category || !type) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Create expense entry
    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      type,
      recurrence: recurrence || 'none',
      nextDueDate: nextDueDate || null
    });

    // Update budget and trigger notification if limit nearing
    if (type === 'expense') {
      const budget = await Budget.findOne({ user: req.user._id, category });
      if (budget) {
        budget.spent += amount;
        await budget.save();

        if (budget.spent >= 0.8 * budget.limit) {
          await Notification.create({
            user: req.user._id,
            message: `⚠️ Budget Alert: You've spent ₹${budget.spent} of your ₹${budget.limit} ${category} budget.`,
            type: 'warning'
          });
        }
      }
    }

    return res.status(201).json({
      message: `${type === 'income' ? 'Income' : 'Expense'} added successfully`,
      expense
    });
  } catch (err) {
    console.error('Create Expense Error:', err);
    res.status(500).json({ message: 'Server error while creating expense' });
  }
};

// ➤ Get All Expenses for Logged-In User
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ count: expenses.length, expenses });
  } catch (err) {
    console.error('Get Expenses Error:', err);
    res.status(500).json({ message: 'Failed to retrieve expenses' });
  }
};

// ➤ Get Single Expense by ID
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expense' });
  }
};

// ➤ Update Expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

// ➤ Delete Expense
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};
