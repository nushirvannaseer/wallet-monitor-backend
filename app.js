const print = (str) => console.log(str);
const express = require("express");
const cron = require("node-cron");
const binanceUser = require("./binance/User")
require("dotenv").config();
const mongoose = require("mongoose");
const uri =
	"mongodb+srv://nushirvan:nushirvannaseer@dca-buyer.uhukz11.mongodb.net/?retryWrites=true&w=majority&appName=dca-buyer";

mongoose
	.connect(uri)
	.then(() => {
		print("Connected to Mongodb");
	})
	.catch((e) => {
		print(e);
	});
	
const User = require("./models/User");
const Asset = require("./models/Asset");
const Log = require('./models/Log');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.send("Running!")
});

app.post("/create-user", async (req, res) => {
	const body = req.body;
	let user = {};
	try {
		user = await User.find({ username: body.username });
	} catch (e) {
		console.error(e);
		res.send(e)
	}
	if (user.length === 0) {
		try {
			user = await User.create({
				name: body.name,
				username: body.username,
				investmentBudget: body.investmentBudget,
				assets: null,
				apiKey: body.apiKey,
				apiSecret: body.apiSecret,
			})
			res.send(user);
		}
		catch (e) {
			res.send(e);
		}
	}
	else {
		res.send("User already exists!");
	}
})

app.get("/update-user-assets/:username/:firstRun", async (req, res) => {
	const params = req.params;
	let user = {};
	try {
		user = await User.findOne({ username: params.username });
	} catch (e) {
		console.error(e);
		res.send(e);
	}
	print(user)
	const assets = await binanceUser.getAssets(user);
	let userAssets = []
	for (let asset of assets) {
		var dbAsset = await Asset.create({
			name: asset.asset,
			lastPrice: params.firstRun ? -1 : 0,
			totalInvested: params.firstRun ? -1 : 0,
			owner: user._id,
		});
		// dbAsset = await dbAsset.save()
		userAssets.push(dbAsset);
	}
	user.assets = userAssets;
	await User.findOneAndUpdate({ username: user.username }, user);
	res.send(assets);
	
})

app.get("/assets/:username", async (req, res) => {
	const user = await User.findOne({ username: req.params.username });
	const assets = await binanceUser.getAssets(user);
	const tradingPrices = await binanceUser.getTradingPrice(user, assets);
	let assetMap = {}
	let result = []
	for (let asset of assets) {
		assetMap[asset.asset] = asset;
		let prices = tradingPrices.find((obj) => obj.symbol === asset.asset + "USDT");
		assetMap[asset.asset] = { ...assetMap[asset.asset], ...prices };
		result.push({...assetMap[asset.asset]})
	}
	res.send(result.sort((a,b)=> ((parseFloat(b.lastPrice) * (b.free+b.locked)) - (parseFloat(a.lastPrice) * (a.free+a.locked)))))})

app.listen(port, () => {
	print(`Example app listening on port ${port}`);
});
