const mongoose = require('mongoose');

const GramPanchayatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
  villages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Village' }],
});
GramPanchayatSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
module.exports = mongoose.model('GramPanchayat', GramPanchayatSchema);
