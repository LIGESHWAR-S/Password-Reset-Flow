const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/password-reset', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`\x1b[32m[Database] MongoDB Connected: ${conn.connection.host}\x1b[0m`);
    return true;
  } catch (error) {
    console.warn(`\x1b[33m[Database] Local MongoDB not reachable (${error.message}). Activating In-Memory Fallback DB Mode.\x1b[0m`);
    return false;
  }
};

module.exports = connectDB;

