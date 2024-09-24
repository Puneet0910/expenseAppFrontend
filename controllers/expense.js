const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

const UserServices = require("../services/userservices");
const S3Services = require("../services/S3services");

const Items_Per_Page = 5;

exports.getExpenses = async (req, res, next) => {
  const userId = req.user.id; // Get the current user's ID
  const page = +req.query.page || 1;
  let totalItems;

  try {
    totalItems = await Expense.count({ where: { userId: userId } }); // Count only the current user's expenses

    const expenses = await Expense.findAll({
      where: { userId: userId }, // Filter expenses by user ID
      offset: (page - 1) * Items_Per_Page,
      limit: Items_Per_Page,
    });

    res.status(200).json({
      success: true,
      userDetails: await User.findByPk(userId),
      expenses,
      currentPage: page,
      hasNextPage: Items_Per_Page * page < totalItems,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previosPage: page - 1,
      lastPage: Math.ceil(totalItems / Items_Per_Page),
      total: totalItems,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.downloadExpense = async (req, res, next) => {
  try {
    // Fetch expenses and convert to plain objects
    const expenses = await UserServices.getExpenses(req);
    const plainExpenses = expenses.map(expense => expense.get({ plain: true }));

    // Convert plain objects to CSV format
    const csvData = convertToCSV(plainExpenses);

    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date().toISOString().slice(0, 10)}_expenses.csv`; // Use date format for filename

    const fileUrl = await S3Services.uploadToS3(csvData, filename);
    res.status(200).json({ fileUrl, success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ fileUrl: "", success: false });
  }
};

// Helper function to convert JSON to CSV
function convertToCSV(jsonData) {
  const csvRows = [];
  
  // Get the headers
  const headers = Object.keys(jsonData[0]);
  csvRows.push(headers.join(',')); // Join headers with commas
  
  // Format each row
  for (const row of jsonData) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"'); // Escape double quotes
      return `"${escaped}"`; // Wrap each value in double quotes
    });
    csvRows.push(values.join(',')); // Join values with commas
  }
  
  return csvRows.join('\n'); // Join all rows with new line characters
}


exports.addExpense = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  const { amount, description, category } = req.body;

  if (
    amount === undefined ||
    description === undefined ||
    category === undefined
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Parameters missing" });
  }

  Expense.create(
    { amount, description, category, userId: req.user.id },
    { transaction: transaction }
  )

    .then(async (expense) => {
      await transaction.commit();
      return res.status(201).json({ expense, success: true });
    })
    .catch(async (err) => {
      await transaction.rollback();
      return res.status(500).json({ success: false, error: err });
    });
};

exports.deleteExpense = (req, res, next) => {
  const exId = req.params.id;

  Expense.destroy({ where: { id: exId } })
    .then((response) => {
      res.status(203).json({ success: true, message: "Deleted Successfully" });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
};
