const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GramPanchayat' }],
});
BlockSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
module.exports = mongoose.model('Block', BlockSchema);
