const mongoose = require("mongoose");

const totalPostsSchema = new mongoose.Schema({
  PL: {
    type: Number,
    default: 0,
    required: true,
  },
  POO: {
    type: Number,
    default: 0,
    required: true,
  },
  BD: {
    type: Number,
    default: 0,
    required: true,
  },
  RET: {
    type: Number,
    default: 0,
    required: true,
  },
});

module.exports = mongoose.model("totalposts", totalPostsSchema);
