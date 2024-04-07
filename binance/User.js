const { Spot } = require("@binance/connector");
const createClient = (apiKey, apiSecret, test=false) => test?new Spot(apiKey, apiSecret, { baseURL: 'https://testnet.binance.vision'}) : new Spot(apiKey, apiSecret);

const getAssets = async (user) => {
	const client = createClient(user.apiKey, user.apiSecret);
	const response = await client.account();
	let assets = response.data.balances
		.sort((a, b) => parseFloat(b.free) - parseFloat(a.free))
		.filter((a) => parseFloat(a.free) > 0)
		.map((a) => {
			return {
				asset: a.asset,
				free: parseFloat(a.free),
				locked: parseFloat(a.locked),
			};
		});
	return assets;
};

const getTradingPrice = async (user, assets) => {
	const client = createClient(user.apiKey, user.apiSecret);
	let symbols = assets
		.map((a) => a.asset + "USDT")
		.filter((v) => v !== "USDTUSDT" && v!=="SAGAUSDT");
	try {
		const res = await client.ticker24hr((symbol = ""), (symbols = symbols));
		return res.data;
	} catch (e) {
		return [e.message, e.name, e.code, e.response];
	}
};


const getTopCoins = async (user, top = 5) => {
	const client = createClient(user.apiKey, user.apiSecret);
	const res = await client.ticker24hr();
	const sorted = res.data
		.filter((a) => a.symbol.includes("USDT") && !a.symbol.startsWith("USDT") && a.symbol.endsWith("USDT")&& !(a.symbol.replace("USDT", "").includes("USD")))
		.sort(
			(a, b) =>
				parseFloat(b.volume) * parseFloat(b.lastPrice) -
				parseFloat(a.volume) * parseFloat(a.lastPrice)
		)
		.slice(0, top)
	return sorted;
};

const main = async () => {
	const assets = await getAssets();
	// const tp = await getTradingPrice(assets);
	// print(tp.find((obj) => obj.symbol === "FLOKIUSDT"));
	const gainers = await getGainers(20);
	print(gainers);
};

const buyCoin = async (user) => {
	const client = createClient(user.apiKey, user.apiSecret);
	try {
		const res = await client.newOrder("BNBUSDT", "BUY", "LIMIT", {
			price: "600",
			quantity: 1,
			timeInForce: "GTC",
		});
		console.log(res.data);
	} catch (e) {
		console.log(Object.keys(e), Object.keys(e.response),e.response.data, e.message, e.code)
	}
};

module.exports = { getAssets, buyCoin, getTopCoins, getTradingPrice };
