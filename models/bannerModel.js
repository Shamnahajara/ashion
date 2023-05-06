const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  mainHeading: {
    type: String,
    required: true,
  },
  subHeading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    default: 0
  },
  bannerImage: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Banner", bannerSchema);