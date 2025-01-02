const mongoose = require('mongoose');

const VillageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gramPanchayatId: { type: mongoose.Schema.Types.ObjectId, ref: 'GramPanchayat', required: true }
});
VillageSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
module.exports = mongoose.model('Village', VillageSchema);
