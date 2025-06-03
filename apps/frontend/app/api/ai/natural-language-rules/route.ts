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
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    console.log("📤 Converting natural language to rules:", query)

    const rules = await convertNaturalLanguageToRules(query)

    if (rules.error) {
      return NextResponse.json({ error: rules.error }, { status: rules.status || 500 })
    }

    return NextResponse.json({
      message: "Rules generated successfully",
      rules: rules.data,
      aiGenerated: rules.aiGenerated,
    })
  } catch (error) {
    console.error("Error converting natural language to rules:", error)
    return NextResponse.json(
      {
        error: "Failed to convert natural language to rules",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

async function convertNaturalLanguageToRules(query: string) {
  try {
    const startTime = Date.now()
    console.log("Starting rule conversion at:", startTime)

    // Check API key
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is not set")
      return {
        data: createDefaultRules(query),
        aiGenerated: false,
        error: "API key not configured",
      }
    }

    const prompt = `Convert the following natural language query into a structured segment rule for a CRM system: "${query}"

The response should be a JSON object with this exact structure:
{
  "conditions": [
    {
      "id": "unique-id",
      "type": "condition-type",
      "operator": "operator",
      "value": "value"
    }
  ],
  "logicType": "All"
}

Valid condition types: "minimum spent", "total orders", "days since last order", "visit count"
Valid operators: "is", "greater than", "less than", "between"

Return ONLY valid JSON, no additional text or explanation.`

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text().trim()

      console.log("📥 Gemini Response for rules:", responseText)

      let rules
      try {
        rules = JSON.parse(responseText)
        console.log("✅ Successfully parsed rules JSON:", rules)
      } catch (parseError) {
        console.log("⚠️ JSON parse failed, trying regex extraction...")

        const jsonRegex = /{[\s\S]*?}/
        const match = responseText.match(jsonRegex)
        if (match && match[0]) {
          try {
            rules = JSON.parse(match[0])
            console.log("✅ Extracted rules JSON from response:", rules)
          } catch {
            console.log("❌ Regex extraction failed, using defaults")
            rules = createDefaultRules(query)
          }
        } else {
          console.log("❌ No JSON object found, using defaults")
          rules = createDefaultRules(query)
        }
      }

      // Validate the rules structure
      if (!rules || !rules.conditions || !Array.isArray(rules.conditions)) {
        console.log("⚠️ Invalid rules structure, using defaults")
        rules = createDefaultRules(query)
      }

      console.log("Rule conversion completed successfully after:", Date.now() - startTime, "ms")
      return { data: rules, aiGenerated: true }
    } catch (apiError) {
      console.error("Gemini API Error:", apiError)

      if (apiError instanceof Error) {
        console.error("Error message:", apiError.message)
        console.error("Error stack:", apiError.stack)
      }

      return {
        data: createDefaultRules(query),
        aiGenerated: false,
        error: "AI service unavailable",
      }
    }
  } catch (error) {
    console.error("Unexpected error in convertNaturalLanguageToRules:", error)
    return {
      data: createDefaultRules(query),
      aiGenerated: false,
      error: "Rule conversion failed",
    }
  }
}

function createDefaultRules(query: string) {
  console.log("🔄 Creating default rules for:", query)
  return {
    conditions: [
      {
        id: "default-condition",
        type: "total orders",
        operator: "greater than",
        value: "0",
      },
    ],
    logicType: "All",
  }
}
