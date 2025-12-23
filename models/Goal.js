const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        deadline: { type: Date, default: null },
        targetAmount: { type: Number, required: true },
        savedAmount: { type: Number, default: 0 },
        isAchieved: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);
