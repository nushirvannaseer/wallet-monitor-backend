const mongoose = require("mongoose");

const assetSchema = mongoose.Schema({
	name: String,
	lastPrice: Number,
	amount: Number,
	totalInvested: Number,
	owner: {
		type: mongoose.Schema.ObjectId,
		ref:"User"
	}
})

module.exports = mongoose.model("Asset", assetSchema);