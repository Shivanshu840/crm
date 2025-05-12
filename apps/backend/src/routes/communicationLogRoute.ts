import express from "express"
import {
  getCommunicationLogs,
  getCommunicationLogById,
  getCommunicationLogsByCampaignId,
  getCommunicationLogsByCustomerId,
  updateCommunicationLogStatus,
} from "../controllers/communicationLogController.js"

const router = express.Router()
router.get("/", getCommunicationLogs)
router.get("/:id", getCommunicationLogById)
router.get("/campaign/:campaignId", getCommunicationLogsByCampaignId)
router.get("/customer/:customerId", getCommunicationLogsByCustomerId)
router.put("/message/:messageId", updateCommunicationLogStatus)

export default router
