const mongoose = require('mongoose');

const DeviceInfoSchema = new mongoose.Schema({
  userName: String,
  userAgent: String,
  deviceType: String,
  deviceName:String,
  deviceUserName:String,
  os: String,
  location: {
    city: String,
    state: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeviceInfo', DeviceInfoSchema);
