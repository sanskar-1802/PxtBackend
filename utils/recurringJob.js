const Expense = require('../models/Expense');
const Notification = require('../models/Notification');

function getNextDate(recurrence, fromDate) {
  const date = new Date(fromDate || Date.now());
  if (recurrence === 'daily') date.setDate(date.getDate() + 1);
  if (recurrence === 'weekly') date.setDate(date.getDate() + 7);
  if (recurrence === 'monthly') date.setMonth(date.getMonth() + 1);
  return date;
}

module.exports = async function recurringJob() {
  const now = new Date();
  const due = await Expense.find({ recurrence: { $ne: 'none' }, nextDueDate: { $lte: now } });
  for (const e of due) {
    const created = new Expense({
      user: e.user,
      title: e.title,
      amount: e.amount,
      category: e.category,
      type: e.type,
      recurrence: e.recurrence,
      nextDueDate: getNextDate(e.recurrence, e.nextDueDate || now)
    });
    await created.save();
    await Notification.create({
      user: e.user,
      message: `Recurring ${e.type} '${e.title}' auto-created.`,
      type: 'info'
    });
    // update original's nextDueDate to next
    e.nextDueDate = getNextDate(e.recurrence, e.nextDueDate || now);
    await e.save();
  }
};
