const Goal = require("../models/Goal");
const Notification = require("../models/Notification");

// Add Goal
exports.addGoal = async (req, res) => {
  try {
    const { title, targetAmount } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ message: "Title and targetAmount are required" });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      targetAmount,
      savedAmount: 0,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("❌ Add Goal Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error("❌ Get Goals Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update progress (add saved amount)
exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.savedAmount += amount;

    if (goal.savedAmount >= goal.targetAmount) {
      goal.isAchieved = true;

      await Notification.create({
        user: req.user._id,
        message: `🎯 Goal achieved: "${goal.title}"! Savings reached ₹${goal.targetAmount}.`,
        type: "success",
      });
    }

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error("❌ Update Goal Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
