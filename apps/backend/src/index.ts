import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import customerRoutes from "./routes/customerRoute"
import orderRoutes from "./routes/orderRoute"
import segmentRoutes from "./routes/segmentRoute"
import campaignRoutes from "./routes/campaignRoute"
import communicationLogRoutes from "./routes/communicationLogRoute"
dotenv.config()

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 5000
app.use(cors())

app.use("/api/customers", customerRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/segments", segmentRoutes)
app.use("/api/campaigns", campaignRoutes)
app.use("/api/communication-logs", communicationLogRoutes)


app.get("/", (req, res) => {
  res.send("welcome to my application")
})


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
