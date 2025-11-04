const mongoose = require('mongoose');

const refreshSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  token: { type: String, required: true },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', refreshSchema);
