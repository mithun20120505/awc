const express = require('express');
const router = express.Router();
const multer = require('multer');
const moment = require('moment');
const XLSX = require('xlsx');
const path = require('path');
const fetch = require('node-fetch');
const Survey = require('../models/AwcData');
const User = require('../models/User');
const Block = require('../models/Block');
const GramPanchayat = require('../models/GramPanchayat');
const Village = require('../models/Village');
const DeviceInfo = require('../models/DeviceInfo');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const os = require("os");
const logger = require('../log/logger');
// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
// Handle Excel file upload
router.post('/upload' , upload.single('file'), async (req, res) => {
  const file = XLSX.readFile(req.file.path);
  // Assuming the data is in the first sheet
      var headers = [];
      const sheetName = file.SheetNames[0];
      const worksheet = file.Sheets[sheetName];
      var range = XLSX.utils.decode_range(worksheet['!ref']);
      var C, R = range.s.r;
      /* start in the first row */
      /* walk every column in the range */
      for (C = range.s.c; C <= range.e.c; ++C) {
          var cell = worksheet[XLSX.utils.encode_cell({c: C, r: R})];
          /* find the cell in the first row */

          var hdr = "UNKNOWN " + C; // <-- replace with your desired default
          if (cell && cell.t) {
              hdr = XLSX.utils.format_cell(cell);
          }
          headers.push(hdr);
      }
      // Convert the sheet data to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("jsonData : "+ jsonData);
      var user = await req.user;
      if (jsonData.length === 0) {
          return res.status(400).send('The uploaded file is empty or not formatted correctly.');
      }
      if (jsonData.length > 0) {
      jsonData.forEach(function (row) {
            // Set empty cell to ''.
            headers.forEach(function (hd) {
                if (row[hd] == undefined) {
                    row[hd] = "";
                }
            });
        });
      }

      try {
        jsonData.forEach(async (data) => {
          let smallBlock = data.block.trim().toLowerCase();
          let block = await Block.findOne({ name: new RegExp(`^${smallBlock}$`, 'i') });
          console.log("before insert block : "+ block);
          if (!block) {
              // block = await Block.create({ name: smallBlock });
              block = await Block.findOneAndUpdate(
                  { name: smallBlock }, // Find by name
                  { $set: { name: smallBlock } }, // Update or set the name
                  { upsert: true, new: true } // Insert if not found, and return the new document
              );
          }

          console.log("block : "+ block);

          let gp;let smallGp = data.gp.trim().toLowerCase();
          try {
            gp = await GramPanchayat.findOne({ name: new RegExp(`^${smallGp}$`, 'i'), blockId: block._id });
            console.log("before insert gp : "+ gp);
            if (!gp) {
                gp = await GramPanchayat.create({ name: smallGp, blockId: block._id });
                await Block.findByIdAndUpdate(block._id, {
                  $push: { gp: gp._id }
                });
            }
            console.log("gp : "+ gp);
          } catch (error) {
            if (error.code === 11000) {
              console.error("Duplicate Gram Panchayat detected:", error.message);
              gp = await GramPanchayat.findOne({ name: smallGp });
              console.log("Retrieved existing Gram Panchayat:", gp);
            } else {
              throw error; // Re-throw other errors
            }
          }

          let smallVillage = data.village.trim().toLowerCase();
          let village;
          try{
                village = await Village.findOne({ name: new RegExp(`^${smallVillage}$`, 'i') });
                console.log("before insert village : "+ village);
              if (!village) {
                village = await Village.create({ name: smallVillage, gramPanchayatId: gp._id });
                await GramPanchayat.findByIdAndUpdate(gp._id, {
                  $push: { villages: village._id }
                });
              }
          }catch(error){
            if (error.code === 11000) {
              console.error("Duplicate village detected:", error.message);
              village = await Village.findOne({ name: smallVillage });
              console.log("Retrieved existing Village:", village);
            } else {
              throw error; // Re-throw other errors
            }
          }

        console.log("village : "+ village);
          const newUser = new Survey({
            scheme: data.scheme == undefined || "" ? "" : data.scheme.trim().toLowerCase(),
            financialYear: data.financialYear == undefined || "" ? "" : data.financialYear.trim().toLowerCase(),
            block: block.id,
            village: village._id,
            typeOfWork:data.typeOfWork,
            sanctionOrder:data.sanctionOrder,
            gp: gp.id,
            village : village.id,
            awc: data.awc == undefined || "" ? "" :data.awc.toLowerCase(),
            WCD: data.WCD == undefined || "" ? "" :data.WCD,
            NREGA: data.NREGA == undefined || "" ? "" :data.NREGA,
            other: data.other == undefined || "" ? "" :data.other,
            total: data.total == undefined || "" ? "" :data.other,
            expenditure: data.expenditure == undefined || "" ? "" :data.expenditure,// TEMP:
            status: data.status == undefined || "" ? "" :data.status.toLowerCase(),
            remark: data.remark == undefined || "" ? "" :data.remark,
            drinkingWater: !data.drinkingWater ? false : ["yes", "y"].includes(data.drinkingWater.toLowerCase()),
            electrification: !data.electrification ? false : ["yes", "y"].includes(data.electrification.toLowerCase()),
            toilet: !data.toilet ? false : ["yes", "y"].includes(data.toilet.toLowerCase())
          });
          console.log("user to upload : " + newUser);
          await newUser.save();
        });
        logger.info('Data uploaded successfully');
        req.session.messages = "Beneficiery Data Uploaded Successfully!";
        req.session.messageType = "success";
      } catch (e) {
        logger.error(e);
        req.session.messages = "Beneficiery Data Not Uploaded Successfully!";
        req.session.messageType = "success";
      }
      res.redirect('/dashboard');
});
// Function to get villages based on logged-in user's Gram Panchayat
async function getUserVillages(userId) {
  try {
    const user = await User.findById(userId).populate({
      path: "gramPanchayat",
      populate: { path: "villages" }
    });
    console.log("villages at getuservillages : "+ user);
    if (!user || !user.gramPanchayat) {
      throw new Error("User or Gram Panchayat not found.");
    }

    return user.gramPanchayat.villages; // List of villages
  } catch (error) {
    console.error("Error fetching villages:", error);
    return [];
  }
}

router.get('/dashboard',ensureAuthenticated, async (req, res) => {
    const users = await Survey.find()
    .populate({ path: 'block', select: 'name' })
    .populate({ path: 'gp', select: 'name' })
    .populate({ path: 'village', select: 'name' }).exec();

    const user = await req.user;
    console.log("awc details : "+ users);
    const userVillages = await Block.find();
      var messageType = req.session.messageType;
      var message = req.session.messages;
      req.session.messageType = null;
      req.session.messages = null;
    res.render('dashboard', { users, user: user, blocks: userVillages,
      messageType: messageType, message: message
     });
});
router.post('/update/:id', async (req, res) => {
  try {
    console.log("request at body : "+ req.body);
        const updatedUser = await Survey.findByIdAndUpdate(req.params.id, {
            $set: {
              'scheme': req.body.scheme,
              'financialYear': req.body.financialYear,
              'block':req.body.block,
              'typeOfWork': req.body.typeOfWork,
              'sanctionOrder': req.body.sanctionOrder,
              'gp':req.body.gramPanchayat,
              'village':req.body.village,
              'awc': req.body.awc,
              'WCD': req.body.WCD,
              'NREGA': req.body.NREGA,
              'other': req.body.other,
              'total': req.body.total,
              'expenditure':req.body.expenditure,
              'status': req.body.status,
              'remark': req.body.remark,
              'drinkingWater': req.body.drinkingWater === 'yes' ? true : false,
              'electrification': req.body.electrification === 'yes' ? true : false,
              'toilet': req.body.toilet === 'yes' ? true : false,
            }
        }, { new: true });

        if (!updatedUser) {
            // return res.status(404).json({ message: 'User not found' });
            logger.info("AWC Not Found for ", req.params.id);
            req.session.messages = "AWC Not Found";
            req.session.messageType = "error";
        }else {
          logger.info("AWC Is Updated for ", req.params.id);
          req.session.messages = "AWC Data Updated Successfully!";
          req.session.messageType = "success";
        }
    } catch (error) {
        logger.error('Error updating user:', error)
        req.session.messages = "AWC Data Not Updated Successfully!";
        req.session.messageType = "error";
    }
    res.redirect('/dashboard');
});

// Search functionality
router.post('/search', async (req, res) => {
  // const searchQuery = req.body.searchQuery;
  const { awcName, block, gramPanchayat, village } = req.query;
  console.log("awcName : "+ awcName);
  console.log("block : "+ block);
  console.log("gramPanchayat : "+ gramPanchayat);
  console.log("village : "+ village);
  // Create query object dynamically based on non-empty search parameters
    const searchQuery = {};
    if (awcName) {
      searchQuery.awcName = { $regex: awcName, $options: 'i' }; // Case-insensitive search
    }

    if (block) {
      searchQuery.block = block;
    }
    if (gramPanchayat) {
      searchQuery.gramPanchayat = gramPanchayat;
    }

    if (village) {
      searchQuery.village = { $regex: village, $options: 'i' }; // Case-insensitive search
    }
    const user = await req.user;
    const users = await Survey.find(searchQuery);
    console.log(" users search at post: " + users);
  res.render('dashboard', { users, user: user, awcName: awcName, block: block, gramPanchayat: gramPanchayat, village:village });
});
router.get('/search', async (req, res) => {
  try {
    const { awcName, block, gramPanchayat, village } = req.query;
    console.log("block query: "+ block);
      console.log("gramPanchayat query : "+ gramPanchayat);
        console.log("village query: "+ village);
    const searchQuery = {};
    if (block) searchQuery.block = block;
    if (gramPanchayat) searchQuery.gp = gramPanchayat;
    if (village) searchQuery.village = village; //{ $regex: village, $options: 'i' };
    if (awcName) searchQuery.awcName = { $regex: awcName, $options: 'i' };
    const users = await Survey.find(searchQuery)
      .populate({ path: 'block', select: 'name' })
      .populate({ path: 'gp', select: 'name' })
      .populate({ path: 'village', select: 'name' }).exec();
    console.log("users at search get : "+ users);
    // Render only the search results (no layout)
    const user = await req.user;
    const userVillages = await Block.find();
    const messageType = req.session.messageType || ""; // Default to empty string if undefined
    const message = req.session.message || "";
   res.render('dashboard', { users, user : user, blocks: userVillages,
   messageType: messageType, message: message });
 } catch (err) {
   res.status(500).send('Server Error');
   logger.error(err);
 }
});
// Delete user route
router.get('/delete/:id', async (req, res) => {
  try {
    await Survey.findByIdAndDelete(req.params.id);
    logger.info("Beneficiery is deleted for ", req.params.id);
    req.session.messages = "Beneficiery is Deleted successfully!";
    req.session.messageType = "success";
  } catch (e) {
    logger.error(e);
    req.session.messages = "Beneficiery is not deleted successfully!";
    req.session.messageType = "error";
  }
  res.redirect('/dashboard');
});
// Edit user route
router.get('/edit/:id', async (req, res) => {
  const users = await Survey.findById(req.params.id)
    .populate({ path: 'block', select: 'name' })
    .populate({ path: 'gp', select: 'gramPanchayat' })
    .populate({ path: 'village', select: 'name' });
  const user = await req.user;
  const blocks = await Block.find();
  res.render('editUser', { users, user:user, blocks: blocks});
});
router.get('/addMember/:id', async (req, res) => {
  const users = await Survey.findById(req.params.id)
  .populate({ path: 'block', select: 'name' })
  .populate({ path: 'gramPanchayat', select: 'gramPanchayat' })
  .populate({ path: 'village', select: 'name' }) // Populate `village` name
  .populate({ path: 'ward', select: 'name' });
  console.log("user at addMember : "+users);
  const user = await req.user;
  const userVillages = await getUserVillages(user._id);
  res.render('addMember', { users, user:user, villages: userVillages });
});
router.post('/submit', async (req, res) => {
  console.log('Received data:', req.body);
  try {
    const newUser = new Survey({
      scheme: req.body.scheme,
      financialYear: req.body.financialYear,
      block:req.body.block,
      typeOfWork: req.body.typeOfWork,
      sanctionOrder: req.body.sanctionOrder,
      gp:req.body.gramPanchayat,
      village:req.body.village,
      awc: req.body.awc,
      WCD: req.body.WCD,
      NREGA: req.body.NREGA,
      other: req.body.other,
      total: req.body.total,
      expenditure:req.body.expenditure,
      status: req.body.status,
      remark: req.body.remark,
      drinkingWater: req.body.drinkingWater=== 'yes',
      electrification: req.body.electrification === 'yes',
      toilet: req.body.toilet === 'yes'
    });


    await newUser.save();
    logger.info("New AWC Data Is Added For ", req.body.userName);
    req.session.messages = "New AWC Data Saved Successfully!";
    req.session.messageType = "success";
  } catch (e) {
    logger.error(e)
    req.session.messages = "New AWC Data Not Saved Successfully!";
    req.session.messageType = "error";
  }
  res.redirect('/dashboard');
});
// router.get("/get-device-details", (req, res) => {
//   res.json({
//     deviceName: os.hostname(),
//     username: os.userInfo().username,
//   });
// });
router.get('/get-ip-info', async (req, res) => {
    try {
      const response = await fetch('https://ipinfo.io/json?token=5adbf4df51c5c8');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
router.post('/api/device-info', async (req, res) => {
  const user = await req.user;
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send("No data received");
    }
    const deviceInfo = new DeviceInfo({
      userName: user.username,
      userAgent : req.body.userAgent,
      deviceType : req.body.deviceType,
      deviceName : os.hostname(),
      deviceUserName : os.userInfo().username,
      os : req.body.os,
      location: {
        city: req.body.location.city,
        state: req.body.location.state,
        country: req.body.location.country,
        latitude: req.body.location.latitude,
        longitude: req.body.location.longitude
      }
    });
    deviceInfo.save()
        .then(() =>
        {
          logger.info("Device info saved successfully");
          req.session.messages = "Device info saved successfully";
          req.session.messageType = "success";
        });
  } catch (error) {
    console.error('Error saving device info:', error);
    res.status(500).send({ message: 'Error saving device info.' });
  }
});
// Fetch villages based on Gram Panchayat selection
async function getVillagesByGramPanchayat(req, res) {
  const gpId = req.params.gpId;
  const gramPanchayat = await GramPanchayat.findById(gpId).populate('villages');
  res.json(gramPanchayat.villages);
}

// Fetch wards based on Village selection
async function getGpsByBlock(req, res) {
  try {
       const blockId = await req.params.blockId;
       const block = await Block.findById(blockId).populate('gp');
       if (!block) return res.status(404).json({ error: 'block not found' });
       res.json(block.gp); // Return the wards array
   } catch (err) {
       res.status(500).json({ error: 'Server error' });
   }
}

router.get("/villages/:gpId", getVillagesByGramPanchayat);
router.get("/gps/:blockId", getGpsByBlock);
module.exports = router;