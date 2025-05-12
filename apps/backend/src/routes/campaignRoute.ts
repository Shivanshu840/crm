import express from "express"
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  executeCampaign,
} from "../controllers/campaignController.js"

const router = express.Router()
router.get("/", getCampaigns)
router.get("/:id", getCampaignById)
router.post("/", createCampaign)
router.put("/:id", updateCampaign)
router.delete("/:id", deleteCampaign)
router.post("/:id/execute", executeCampaign)

export default router
