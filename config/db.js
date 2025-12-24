// const mongoose = require('mongoose');
// const logger = require('../utils/logger');

// module.exports = async function connectDB() {
//   const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
//   try {
//     await mongoose.connect(uri, { dbName: 'expenseDB' });
//     logger.info('MongoDB connected');
//   } catch (err) {
//     logger.error('MongoDB connection error', err);
//     process.exit(1);
//   }
// };

const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection error', err);
    process.exit(1);
  }
};
