const Expense = require("../models/expense");

exports.getExpenses = (req) => {
  return Expense.findAll({ where: { userId: req.user.id } });
};