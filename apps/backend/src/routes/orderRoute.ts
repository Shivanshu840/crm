import express from "express"
import {
  getOrders,
  getOrderById,
  getOrdersByCustomerId,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js"

const router = express.Router()


router.get("/", getOrders)
router.get("/:id", getOrderById)
router.get("/customer/:customerId", getOrdersByCustomerId)
router.post("/", createOrder)
router.put("/:id", updateOrder)
router.delete("/:id", deleteOrder)

export default router
