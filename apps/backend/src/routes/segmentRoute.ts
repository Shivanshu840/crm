import express from "express"
import {
  getSegments,
  getSegmentById,
  createSegment,
  updateSegment,
  deleteSegment,
  previewAudience,
} from "../controllers/segmentController.js"

const router = express.Router()


router.get("/", getSegments)
router.get("/:id", getSegmentById)
router.post("/", createSegment)
router.put("/:id", updateSegment)
router.delete("/:id", deleteSegment)
router.post("/preview", previewAudience)

export default router
