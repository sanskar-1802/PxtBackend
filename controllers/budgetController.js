const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

// Add new budget
exports.addBudget = async (req, res) => {
  const { category, limit, startDate, endDate } = req.body;
  const budget = await Budget.create({
    user: req.user._id,
    category,
    limit,
    startDate,
    endDate
  });
  res.status(201).json(budget);
};

// Get all budgets for a user
exports.getBudgets = async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(budgets);
};

// Check spending against budget (optional analytic)
exports.getBudgetStatus = async (req, res) => {
  const budgets = await Budget.find({ user: req.user._id });

  const report = await Promise.all(budgets.map(async (b) => {
    const totalSpent = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          category: b.category,
          createdAt: { $gte: b.startDate, $lte: b.endDate },
          type: 'expense'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const spent = totalSpent[0]?.total || 0;
    const remaining = b.limit - spent;

    // 🔔 Auto-create notification if limit exceeded
    if (spent > b.limit) {
      await Notification.create({
        user: req.user._id,
        message: `⚠️ Budget exceeded for ${b.category}! You spent ₹${spent} (Limit ₹${b.limit}).`,
        type: 'warning'
      });
    }

    return {
      category: b.category,
      limit: b.limit,
      spent,
      remaining,
      exceeded: spent > b.limit
    };
  }));

  res.json(report);
};

