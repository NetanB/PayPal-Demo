require("dotenv").config()

const express = require("express")
const app = express()
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.json())

const paypal = require("@paypal/checkout-server-sdk")
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.SandboxEnvironment
    : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)
//let scoopAmount = document.getElementByName('scoopAmount');
//let "USD" = document.getElementByName('currency');

const storeItems = new Map([
  [1, { price: 10, name: "One Scoop Ice Cream" }],
  [2, { price: 20, name: "Two Scoop Ice Cream" }],
])

app.get("/", (req, res) => {
  res.render("index", {
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
  })
})

app.post("/create-order", async (req, res) => {
  const request = new paypal.orders.OrdersCreateRequest()
  const total = req.body.items.reduce((sum, item) => {
    return (sum + storeItems.get(item.id).price * item.quantity)
  }, 0)
  request.prefer("return=representation")
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: total,
            },
          },
        },
        items: req.body.items.map(item => {
          const storeItem = storeItems.get(item.id)
          return {
            name: storeItem.name,
            unit_amount: {
              currency_code: "USD",
              value: storeItem.price,
            },
            quantity: item.quantity,
          }
        }),
      },
    ],
  })

  try {
    const order = await paypalClient.execute(request)
    res.json({ id: order.result.id })
    console.log(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000)