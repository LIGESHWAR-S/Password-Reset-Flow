const mongoose = require('mongoose');

// Define standard Mongoose Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MongooseUser = mongoose.model('User', userSchema);

// In-Memory Fallback Storage (active when MongoDB daemon is unavailable)
const memoryDb = new Map();

class InMemoryUserInstance {
  constructor(data) {
    this._id = data._id || 'usr_' + Math.random().toString(36).substring(2, 11);
    this.email = data.email ? data.email.toLowerCase().trim() : '';
    this.password = data.password;
    this.resetPasswordToken = data.resetPasswordToken || null;
    this.resetPasswordExpires = data.resetPasswordExpires || null;
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    memoryDb.set(this.email, this);
    return this;
  }
}

class UserAdapter {
  constructor(data) {
    if (mongoose.connection.readyState === 1) {
      return new MongooseUser(data);
    }
    return new InMemoryUserInstance(data);
  }

  static async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.findOne(query);
    }

    // In-Memory Fallback query matching
    for (const [, user] of memoryDb) {
      let matches = true;

      if (query.email && user.email !== query.email.toLowerCase().trim()) {
        matches = false;
      }

      if (query.resetPasswordToken && user.resetPasswordToken !== query.resetPasswordToken) {
        matches = false;
      }

      if (query.resetPasswordExpires) {
        if (query.resetPasswordExpires.$gt) {
          const expiresTime = user.resetPasswordExpires ? new Date(user.resetPasswordExpires).getTime() : 0;
          if (expiresTime <= query.resetPasswordExpires.$gt) {
            matches = false;
          }
        }
      }

      if (matches) {
        return user;
      }
    }
    return null;
  }

  static async deleteOne(query) {
    if (mongoose.connection.readyState === 1) {
      return await MongooseUser.deleteOne(query);
    }
    if (query.email && memoryDb.has(query.email.toLowerCase().trim())) {
      memoryDb.delete(query.email.toLowerCase().trim());
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }
}

module.exports = UserAdapter;

