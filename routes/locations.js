const express = require('express');
const router = express.Router();
const Block = require('../models/Block');
const GramPanchayat = require('../models/GramPanchayat');
const Village = require('../models/Village');


router.post('/add-block', async (req, res) => {
  try {
    const block = new Block({ name: req.body.name });
    await block.save();
    res.redirect('/locations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding Gram Panchayat');
  }
});
// Add Gram Panchayat
router.post('/add-gram-panchayat', async (req, res) => {
  try {
    const gramPanchayat = new GramPanchayat({
      name: req.body.name,
      blockId: req.body.blockId
     });
    await gramPanchayat.save();
    await Block.findByIdAndUpdate(req.body.blockId, {
      $push: { gp: gramPanchayat._id }
    });
    res.redirect('/locations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding Gram Panchayat');
  }
});

// Add Village
router.post('/add-village', async (req, res) => {
  try {
    const village = new Village({
      name: req.body.name,
      gramPanchayatId: req.body.gramPanchayatId
    });
    await village.save();

    await GramPanchayat.findByIdAndUpdate(req.body.gramPanchayatId, {
      $push: { villages: village._id }
    });

    res.redirect('/locations');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding Village');
  }
});


router.get('/gramPanchayat/:blockId', async (req, res) => {
  try {
    const gramPanchayats = await GramPanchayat.find({ blockId: req.params.blockId }).sort({ name: 1 });
console.log(" gps : " + gramPanchayats);
    res.json(gramPanchayats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching villages' });
  }
});
// Fetch Villages based on Gram Panchayat
router.get('/villages/:gramPanchayatId', async (req, res) => {
  try {
    const villages = await Village.find({ gramPanchayatId: req.params.gramPanchayatId }).sort({ name: 1 });
    res.json(villages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching villages' });
  }
});


router.get('/', async (req, res) => {
  const blocks = await Block.find().sort({ name: 1 }); // Fetch all GPs
  console.log("blocks :" + blocks);
  res.render('manage', { blocks });
});
module.exports = router;
