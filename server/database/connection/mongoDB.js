const mongoose = require('mongoose');
// const DB_URI = 'mongodb+srv://camiloandresfrancoduran:1095791057@atlascluster.awgtpav.mongodb.net/CineCampus';
const DB_URI = 'mongodb://admin:123456@viaduct.proxy.rlwy.net:47991/CamiloDb';

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

module.exports = connectDB;