const Binance = require('binance-api-node').default;
const client = Binance({
  apiKey: '',
  apiSecret: ''
});

const TARGET_COINS = ['BTC', 'ETH']
const BUY_THRESHOLD = -0.04
const SELL_THRESHOLD = 0.03
const SPEND_AMOUNT = 3

let lastPrices = {}
let balances = {}

async function trade() {
  console.log('Bot is running...')
  const prices = await client.prices()
  for (const coin of TARGET_COINS) {
    const symbol = `${coin}USDT`
    const currentPrice = parseFloat(prices[symbol])
    if (!lastPrices[coin]) {
      lastPrices[coin] = currentPrice
      continue
    }
    const priceChange = (currentPrice - lastPrices[coin]) / lastPrices[coin]
    if (priceChange <= BUY_THRESHOLD) {
      const quantity = SPEND_AMOUNT / currentPrice
      console.log(`Buying ${quantity} ${coin} at ${currentPrice}`)
      await client.order({
        symbol,
        side: 'BUY',
        type: 'MARKET',
        quantity,
      })
      balances[coin] = (balances[coin] || 0) + quantity
    } else if (priceChange >= SELL_THRESHOLD) {
      const quantity = balances[coin] || 0
      if (quantity > 0) {
        console.log(`Selling ${quantity} ${coin} at ${currentPrice}`)
        await client.order({
          symbol,
          side: 'SELL',
          type: 'MARKET',
          quantity,
        })
        balances[coin] = 0
      }
    }
    lastPrices[coin] = currentPrice
  }
}

setInterval(trade, 86400 * 1000)