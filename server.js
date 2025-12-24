require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cron = require('node-cron');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const recurringJob = require('./utils/recurringJob');
const cors = require("cors");

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budgets');
const goalRoutes = require('./routes/goals');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: ["http://localhost:5173",
  "https://pxt-frontend.vercel.app/"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  });

  // schedule daily cron to run recurring job at 00:05
  cron.schedule('5 0 * * *', async () => {
    logger.info('Running recurring transactions job');
    try {
      await recurringJob();
      logger.info('Recurring job finished');
    } catch (err) {
      logger.error('Recurring job error', err);
    }
  });
});
