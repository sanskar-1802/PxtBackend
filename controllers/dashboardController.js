// const Expense = require('../models/Expense');
// const Goal = require('../models/Goal');
// const Budget = require('../models/Budget');
// const Notification = require('../models/Notification');

// exports.summary = async (req, res) => {
//   const user = req.user._id;
//   const incomeAgg = await Expense.aggregate([
//     { $match: { user, type: 'income' } },
//     { $group: { _id: null, total: { $sum: '$amount' } } }
//   ]);
//   const expenseAgg = await Expense.aggregate([
//     { $match: { user, type: 'expense' } },
//     { $group: { _id: null, total: { $sum: '$amount' } } }
//   ]);
//   const goals = await Goal.find({ user, status: 'active' });
//   const budgets = await Budget.find({ user });
//   const unread = await Notification.countDocuments({ user, isRead: false });

//   const totalIncome = incomeAgg[0]?.total || 0;
//   const totalExpense = expenseAgg[0]?.total || 0;
//   const savings = totalIncome - totalExpense;

//   res.json({
//     totalIncome, totalExpense, savings,
//     activeGoals: goals.length,
//     budgetOverview: budgets.map(b => ({ category: b.category, limit: b.limit, spent: b.spent, remaining: b.limit - b.spent })),
//     unreadNotifications: unread
//   });
// };
const Expense = require('../models/Expense');
const Goal = require('../models/Goal');
const Budget = require('../models/Budget');
const Notification = require('../models/Notification');

exports.summary = async (req, res) => {
  try {
    const user = req.user._id;

    // --- Income and Expense aggregation ---
    const incomeAgg = await Expense.aggregate([
      { $match: { user, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: { user, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    const savings = totalIncome - totalExpense;

      // 2️⃣ Goals (Update + Fetch)
    const goals = await Goal.find({ user });

    // Update each goal’s progress dynamically
    for (const goal of goals) {
      const newProgress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
      let newStatus = goal.status;

      if (newProgress >= 100 && goal.status !== 'completed') {
        newStatus = 'completed';
      } else if (goal.status === 'completed' && newProgress < 100) {
        newStatus = 'active';
      }

      if (goal.progress !== newProgress || goal.status !== newStatus) {
        goal.progress = newProgress;
        goal.status = newStatus;
        await goal.save();
      }
    }


    // --- Budgets ---
    const budgets = await Budget.find({ user });
    const updatedBudgets = [];

    for (const b of budgets) {
      // Calculate actual spending per category
      const totalSpentAgg = await Expense.aggregate([
        { $match: { user, category: b.category, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const spent = totalSpentAgg[0]?.total || 0;
      const remaining = b.limit - spent;

      // If budget exceeded, notify once
      if (spent > b.limit && !b.exceededNotified) {
        await Notification.create({
          user,
          message: `⚠️ Budget exceeded for ${b.category}! You spent ₹${spent} (Limit ₹${b.limit}).`,
          type: 'warning'
        });
        b.exceededNotified = true;
        await b.save();
      }

      updatedBudgets.push({
        category: b.category,
        limit: b.limit,
        spent,
        remaining,
        exceeded: spent > b.limit
      });
    }

    // --- Notifications count ---
    const unread = await Notification.countDocuments({ user, isRead: false });

    // --- Final summary response ---
    res.json({
      totalIncome,
      totalExpense,
      savings,
      activeGoals: goals.length,
      totalBudgets: budgets.length,
      budgetOverview: updatedBudgets,
      unreadNotifications: unread,
      message: 'Dashboard summary with smart alerts generated successfully'
    });
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
};

//pie  chart (which is for spending by catagory)
exports.categoryStats = async (req, res) => {
  try {
    const user = req.user._id;

    const data = await require('../models/Expense').aggregate([
      { $match: { user, type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]);

    const formatted = data.map(d => ({
      category: d._id,
      total: d.total
    }));

    res.json({
      chartType: 'pie',
      title: 'Spending by Category',
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ error: 'Error generating category stats', details: err.message });
  }
};

//line/bar chart  (which shows Monthly income vs expenses)
exports.monthlyTrends = async (req, res) => {
  try {
    const user = req.user._id;

    const data = await require('../models/Expense').aggregate([
      { $match: { user } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Convert to frontend-friendly format
    const monthly = {};

    data.forEach(d => {
      const key = `${d._id.year}-${String(d._id.month).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { month: key, income: 0, expense: 0 };
      monthly[key][d._id.type] = d.total;
    });

    res.json({
      chartType: 'bar',
      title: 'Monthly Income vs Expense',
      data: Object.values(monthly)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error generating monthly trends', details: err.message });
  }
};


//Radial/Progress Chart  (Which is Goal Achievement Percentage)
exports.goalProgress = async (req, res) => {
  try {
    const user = req.user._id;

    const goals = await require('../models/Goal').find({ user });

    const formatted = goals.map(g => ({
      title: g.title,
      targetAmount: g.targetAmount,
      savedAmount: g.savedAmount,
      percentage: Math.min(((g.savedAmount / g.targetAmount) * 100).toFixed(2), 100)
    }));

    res.json({
      chartType: 'progress',
      title: 'Goal Progress Overview',
      data: formatted
    });
  } catch (err) {
    res.status(500).json({ error: 'Error generating goal progress data', details: err.message });
  }
};


