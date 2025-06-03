import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@repo/db/clients"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { authOptionUser } from "@/lib/authoption"

const apiKey = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey!)

export async function GET(req: Request, { params }: { params: { campaignId: string } }) {
  const session = await getServerSession(authOptionUser)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { campaignId } = params

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 })
    }

    console.log("📤 Generating campaign summary for:", campaignId)

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        segment: true,
        communicationLogs: true,
      },
    })

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    const summary = await generateCampaignSummary(campaign)

    if (summary.error) {
      return NextResponse.json({ error: summary.error }, { status: summary.status || 500 })
    }

    return NextResponse.json({
      message: "Campaign summary generated successfully",
      summary: summary.data,
      aiGenerated: summary.aiGenerated,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        segment: campaign.segment.name,
      },
    })
  } catch (error) {
    console.error("Error generating campaign summary:", error)
    return NextResponse.json(
      {
        error: "Failed to generate campaign summary",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function generateCampaignSummary(campaign: any) {
  try {
    const startTime = Date.now()
    console.log("Starting campaign summary generation at:", startTime)

    // Check API key
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is not set")
      const defaultSummary = `The "${campaign.name}" campaign targeting the "${campaign.segment.name}" segment reached ${campaign.audienceSize} customers.`
      return {
        data: defaultSummary,
        aiGenerated: false,
        error: "API key not configured",
      }
    }

    const data = {
      name: campaign.name,
      segment: campaign.segment.name,
      audienceSize: campaign.audienceSize,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      deliveryRate: campaign.audienceSize > 0 ? (campaign.sentCount / campaign.audienceSize) * 100 : 0,
    }

    const prompt = `Generate a human-readable summary of the following campaign performance data:

Campaign: ${data.name}
Segment: ${data.segment}
Audience Size: ${data.audienceSize}
Messages Sent: ${data.sentCount}
Messages Failed: ${data.failedCount}
Delivery Rate: ${data.deliveryRate.toFixed(2)}%

The summary should be:
- Concise and insightful (2-3 sentences)
- Written in a conversational tone
- Highlight key metrics and performance
- Include actionable insights if possible

Generate the summary now:`

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const summary = response.text().trim()

      if (!summary) {
        throw new Error("Empty response from Gemini")
      }

      console.log("📥 Gemini Generated Summary:", summary)
      console.log("Campaign summary generation completed successfully after:", Date.now() - startTime, "ms")

      return { data: summary, aiGenerated: true }
    } catch (apiError) {
      console.error("Gemini API Error:", apiError)

      if (apiError instanceof Error) {
        console.error("Error message:", apiError.message)
        console.error("Error stack:", apiError.stack)
      }

      const defaultSummary = `The "${data.name}" campaign targeting the "${data.segment}" segment reached ${data.audienceSize} customers with a ${data.deliveryRate.toFixed(2)}% delivery rate. ${data.sentCount} messages were successfully sent, while ${data.failedCount} failed to deliver.`

      return {
        data: defaultSummary,
        aiGenerated: false,
        error: "AI service unavailable",
      }
    }
  } catch (error) {
    console.error("Unexpected error in generateCampaignSummary:", error)
    return {
      data: "Campaign summary data is currently unavailable.",
      aiGenerated: false,
      error: "Summary generation failed",
    }
  }
}
