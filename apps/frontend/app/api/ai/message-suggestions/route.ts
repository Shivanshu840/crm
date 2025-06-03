import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { authOptionUser } from "@/lib/authoption"

const apiKey = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey!)

export async function POST(req: Request) {
  const session = await getServerSession(authOptionUser)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { segmentName, objective } = body

    if (!segmentName || !objective) {
      return NextResponse.json({ error: "Segment name and objective are required" }, { status: 400 })
    }

    console.log("📤 Generating message suggestions for:", segmentName, objective)

    const suggestions = await generateMessageSuggestions(segmentName, objective)

    if (suggestions.error) {
      return NextResponse.json({ error: suggestions.error }, { status: suggestions.status || 500 })
    }

    return NextResponse.json({
      message: "Message suggestions generated successfully",
      suggestions: suggestions.data,
      aiGenerated: suggestions.aiGenerated,
    })
  } catch (error) {
    console.error("Error generating message suggestions:", error)
    return NextResponse.json(
      {
        error: "Failed to generate message suggestions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function generateMessageSuggestions(segmentName: string, objective: string) {
  try {
    const startTime = Date.now()
    console.log("Starting message generation at:", startTime)

    // Check API key
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is not set")
      return {
        data: createDefaultSuggestions(segmentName, objective),
        aiGenerated: false,
        error: "API key not configured",
      }
    }

    const prompt = `You are a marketing expert. Generate exactly 3 short marketing message templates for a campaign targeting "${segmentName}" segment with the objective to "${objective}".

Requirements:
- Each message must include {name} placeholder for personalization
- Each message must be under 160 characters
- Return ONLY a valid JSON array of strings
- No additional text, explanation, or markdown formatting

Example format: ["Hi {name}, message 1", "Hello {name}, message 2", "{name}, message 3"]

Generate the messages now:`

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text().trim()

      console.log("📥 Gemini Response:", responseText)

      let suggestions

      // Try to parse JSON directly first
      try {
        suggestions = JSON.parse(responseText)
        console.log("✅ Successfully parsed JSON:", suggestions)

        // Validate it's an array
        if (!Array.isArray(suggestions)) {
          throw new Error("Response is not an array")
        }

        // Validate each message has {name} placeholder
        const validMessages = suggestions.filter(
          (msg) => typeof msg === "string" && msg.includes("{name}") && msg.length <= 160,
        )

        if (validMessages.length >= 2) {
          suggestions = validMessages.slice(0, 3)
        } else {
          throw new Error("Not enough valid messages")
        }
      } catch (parseError) {
        console.log("⚠️ JSON parse failed, trying regex extraction...")
        suggestions = parseMessagesFromText(responseText, segmentName, objective)
      }

      // Final validation
      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        console.log("⚠️ Invalid suggestions, using defaults")
        suggestions = createDefaultSuggestions(segmentName, objective)
      }

      console.log("Message generation completed successfully after:", Date.now() - startTime, "ms")
      return { data: suggestions, aiGenerated: true }
    } catch (apiError) {
      console.error("Gemini API Error:", apiError)

      if (apiError instanceof Error) {
        console.error("Error message:", apiError.message)
        console.error("Error stack:", apiError.stack)
      }

      return {
        data: createDefaultSuggestions(segmentName, objective),
        aiGenerated: false,
        error: "AI service unavailable",
      }
    }
  } catch (error) {
    console.error("Unexpected error in generateMessageSuggestions:", error)
    return {
      data: createDefaultSuggestions(segmentName, objective),
      aiGenerated: false,
      error: "Message generation failed",
    }
  }
}

function parseMessagesFromText(text: string, segmentName: string, objective: string): string[] {
  console.log("🔍 Parsing messages from text:", text)

  // Try to extract JSON array from response
  const jsonArrayRegex = /\[[\s\S]*?\]/
  const match = text.match(jsonArrayRegex)

  if (match && match[0]) {
    try {
      const parsed = JSON.parse(match[0])
      if (Array.isArray(parsed)) {
        return parsed.filter((msg) => typeof msg === "string" && msg.includes("{name}")).slice(0, 3)
      }
    } catch {
      // Continue to line parsing
    }
  }

  // Parse line by line
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[0-9.\-*"'[\]]+\s*/, "").trim())
    .map((line) => line.replace(/[",\]]+$/, "").trim())
    .filter((line) => line.includes("{name}") && line.length <= 160)

  console.log("📝 Parsed lines:", lines)

  if (lines.length >= 2) {
    return lines.slice(0, 3)
  }

  return createDefaultSuggestions(segmentName, objective)
}

function createDefaultSuggestions(segmentName: string, objective: string): string[] {
  console.log("🔄 Creating default suggestions for:", segmentName, objective)
  return [
    `Hi {name}, check out our latest offers for ${segmentName} to help you ${objective}!`,
    `{name}, we've selected special deals just for you based on your interests in ${objective}.`,
    `Don't miss out {name}! Limited time offers for our ${segmentName} customers.`,
  ]
}
