const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
	name: String,
	username: String,
	investmentBudget: Number,
	assets: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Asset"
	}],
	apiKey: String,
	apiSecret: String,
})

module.exports = mongoose.model("User", userSchema);