const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');

const app = express();

// Import controllers and routes
const errController = require("./controllers/error");
const userRouter = require("./routes/user");
const expenseRouter = require("./routes/expense"); 
const purchaseRouter = require("./routes/purchase");
const premiumRouter = require("./routes/premium");
const passwordRouter = require("./routes/password");

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Database models
const sequelize = require("./util/database");
const Expense = require("./models/expense");
const User = require("./models/user");
const Order = require("./models/order");
const ForgotPassword = require("./models/forgotPassword");

// Authentication middleware
const userAuth = require("./middleware/auth");

// Routes
app.use("/user", userRouter);
app.use("/expense", userAuth.authenticate, expenseRouter);
app.use("/purchase", userAuth.authenticate, purchaseRouter);
app.use("/premium", premiumRouter);
app.use("/password", passwordRouter);

// Error handling
app.use(errController.error404);

// Associations
User.hasMany(Expense); // Relation between User and Expense
Expense.belongsTo(User);

User.hasMany(Order); // Relation between User and Order
Order.belongsTo(User);

User.hasMany(ForgotPassword); // Relation between User and ForgotPassword
ForgotPassword.belongsTo(User);

// Sync database and start server
sequelize
  .sync()
  .then(() => {
    console.log("Database Connected Successfully");
    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err); // Use console.error for errors
  });
