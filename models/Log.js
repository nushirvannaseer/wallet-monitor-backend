const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
	time: Number,
	coinName: String,
	amountSpent: Number,
	buyingPrice: Number,
});

module.exports = mongoose.model("Log", logSchema)
