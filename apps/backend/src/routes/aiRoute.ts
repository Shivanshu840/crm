import express from "express"

import { protect } from "../middleware/authCheck"
import { generateCampaignSummary, generateMessageSuggestions, naturalLanguageToRules } from "../controllers/aiController"

const router = express.Router()
// router.use(protect)

router.post("/message-suggestions", generateMessageSuggestions)
router.post("/natural-language-rules", naturalLanguageToRules)
router.get("/campaign-summary/:campaignId", generateCampaignSummary)

export default router
