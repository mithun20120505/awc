const mongoose = require('mongoose');

const AwcDataSchema = new mongoose.Schema({
  images: { type: [String] },
  scheme: String,
  financialYear: String,
  block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  // village: String,
  // ward: String,
  typeOfWork: String,
  sanctionOrder: String,
  gp: { type: mongoose.Schema.Types.ObjectId, ref: 'GramPanchayat' },
  village: { type: mongoose.Schema.Types.ObjectId, ref: 'Village' },
  awc: String,
  WCD: String,
  NREGA: String,
  other:String,
  total : String,
  expenditure: String,// TEMP:
  status: String,
  remark: String,
  drinkingWater: Boolean,
  electrification: Boolean,
  toilet: Boolean
});

module.exports = mongoose.model('AwcData', AwcDataSchema);
