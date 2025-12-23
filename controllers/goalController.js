const Goal = require("../models/Goal");
const Notification = require("../models/Notification");

// --------------------------------------
// Add Goal
// --------------------------------------
exports.addGoal = async (req, res) => {
  try {
    const { title, description, deadline, targetAmount, savedAmount } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ message: "Title and targetAmount are required" });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description: description || "",
      deadline: deadline || null,
      targetAmount,
      savedAmount: savedAmount || 0,
      isAchieved: savedAmount >= targetAmount,
    });

    // Trigger notification if goal is already reached upon creation
    if (goal.isAchieved) {
      await Notification.create({
        user: req.user._id,
        message: `🎯 Goal achieved: "${goal.title}"! You have already saved ₹${goal.savedAmount}.`,
        type: "success",
      });
    }

    res.status(201).json(goal);
  } catch (err) {
    console.error("❌ Add Goal Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// --------------------------------------
// Get all goals
// --------------------------------------
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error("❌ Get Goals Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// --------------------------------------
// Update progress (add saved amount incrementally)
// --------------------------------------
exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.savedAmount += Number(amount);

    if (goal.savedAmount >= goal.targetAmount && !goal.isAchieved) {
      goal.isAchieved = true;

      await Notification.create({
        user: req.user._id,
        message: `🎉 Congratulations! Goal "${goal.title}" has been achieved.`,
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
// --------------------------------------
// Delete Goal
// --------------------------------------
exports.deleteGoal = async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted)
      return res.status(404).json({ message: "Goal not found" });

    res.json({ message: "Goal deleted successfully" });

  } catch (err) {
    console.error("❌ Delete Goal Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


