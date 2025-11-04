const Goal = require('../models/Goal');
const Notification = require('../models/Notification');

exports.addGoal = async (req, res) => {
  const { title, targetAmount, deadline } = req.body;
  const goal = await Goal.create({
    user: req.user._id,
    title,
    targetAmount,
    deadline
  });
  res.status(201).json(goal);
};

exports.getGoals = async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(goals);
};

exports.updateGoalProgress = async (req, res) => {
  const { amount } = req.body;
  const goal = await Goal.findById(req.params.id);
  if (!goal) return res.status(404).json({ message: 'Goal not found' });

  goal.savedAmount += amount;

  if (goal.savedAmount >= goal.targetAmount) {
    goal.isAchieved = true;

    // 🎉 Send notification
    await Notification.create({
      user: req.user._id,
      message: `🎯 Goal achieved: "${goal.title}"! Congratulations on saving ₹${goal.targetAmount}.`,
      type: 'success'
    });
  }

  await goal.save();
  res.json(goal);
};
