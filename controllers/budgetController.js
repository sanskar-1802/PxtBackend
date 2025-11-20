const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");

// ✅ Add new budget
exports.addBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      spent: 0,
    });

    res.status(201).json(budget);
  } catch (err) {
    console.error("❌ Add Budget Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all budgets for logged-in user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ budgets });
  } catch (err) {
    console.error("❌ Get Budgets Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Budget analytics report
exports.getBudgetStatus = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    const report = await Promise.all(
      budgets.map(async (b) => {
        const totalSpent = await Expense.aggregate([
          {
            $match: {
              user: b.user,
              category: b.category,
              type: "expense",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent = totalSpent[0]?.total || 0;
        const remaining = b.limit - spent;

        // 🔔 Auto Notification when spent exceeds limit
        if (spent > b.limit) {
          await Notification.create({
            user: b.user,
            message: `⚠️ Budget exceeded for ${b.category}! You spent ₹${spent} (Limit ₹${b.limit}).`,
            type: "warning",
          });
        }

        return {
          category: b.category,
          limit: b.limit,
          spent,
          remaining,
          exceeded: spent > b.limit,
        };
      })
    );

    res.json(report);
  } catch (err) {
    console.error("❌ Budget Status Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
