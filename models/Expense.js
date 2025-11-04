const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General' },
  type: { type: String, enum: ['expense','income'], required: true },
  recurrence: { type: String, enum: ['none','daily','weekly','monthly'], default: 'none' },
  nextDueDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
