const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 }, // ✅ no deadline anymore
    isAchieved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
