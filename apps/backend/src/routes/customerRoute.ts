import express from "express"
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js"

const router = express.Router()
router.get("/", getCustomers)
router.get("/:id", getCustomerById)
router.post("/", createCustomer)
router.put("/:id", updateCustomer)
router.delete("/:id", deleteCustomer)
export default router
