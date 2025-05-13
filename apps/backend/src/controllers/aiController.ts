import prisma from "@repo/db/clients"
import { InferenceClient } from "@huggingface/inference"

const apiKey = process.env.HUGGINGFACE_API_KEY
const client = new InferenceClient(apiKey)


const CHAT_MODEL = "mistralai/Mistral-7B-Instruct-v0.3"
const PROVIDER = "together"

export const generateMessageSuggestions = async (req: any, res: any) => {
  try {
    const { segmentName, objective } = req.body

    if (!segmentName || !objective) {
      return res.status(400).json({ error: "Segment name and objective are required" })
    }

    const prompt = `Generate 3 short marketing message templates for a campaign targeting "${segmentName}" segment with the objective to "${objective}". Each message should be personalized with {name} placeholder and be under 160 characters. Format the response as a JSON array of strings.`

    try {
      const chatCompletion = await client.chatCompletion({
        provider: PROVIDER,
        model: CHAT_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const responseText = chatCompletion.choices[0].message.content.trim()

      let suggestions
      try {
        
        suggestions = JSON.parse(responseText)
      } catch (error) {
        
        const regex = /\[([\s\S]*?)\]/
        const match = responseText.match(regex)
        if (match && match[0]) {
          try {
            suggestions = JSON.parse(match[0])
          } catch {
            suggestions = createDefaultSuggestions(segmentName, objective)
          }
        } else {
          
          const lines = responseText
            .split("\n")
            .filter((line: string | string[]) => line.includes("{name}"))
            .map((line: string) => line.replace(/^[0-9.\-*]+\s*/, "").trim())
            .filter((line: string | any[]) => line.length > 0)

          if (lines.length >= 2) {
            suggestions = lines.slice(0, 3)
          } else {
            suggestions = createDefaultSuggestions(segmentName, objective)
          }
        }
      }

      res.json({ suggestions })
    } catch (error) {
      console.error("Error with chat completion API:", error)
      
      const suggestions = createDefaultSuggestions(segmentName, objective)
      res.json({ suggestions })
    }
  } catch (error) {
    console.error("Error generating message suggestions:", error)
    res.status(500).json({
      error: "Failed to generate message suggestions",
      suggestions: createDefaultSuggestions("customers", "engage"),
    })
  }
}

function createDefaultSuggestions(segmentName: string, objective: string) {
  return [
    `Hi {name}, check out our latest offers for ${segmentName} to help you ${objective}!`,
    `{name}, we've selected special deals just for you based on your interests in ${objective}.`,
    `Don't miss out {name}! Limited time offers for our ${segmentName} customers.`,
  ]
}

export const naturalLanguageToRules = async (req: any, res: any) => {
  try {
    const { query } = req.body

    if (!query) {
      return res.status(400).json({ error: "Query is required" })
    }

    const prompt = `Convert the following natural language query into a structured segment rule for a CRM system: "${query}". The response should be a JSON object with the following structure:
    {
      "conditions": [
        {
          "id": "unique-id",
          "type": "condition-type", // one of: minimum spent, total orders, days since last order, visit count
          "operator": "operator", // one of: is, greater than, less than, between
          "value": "value"
        }
      ],
      "logicType": "All or Any"
    }`

    try {
      const chatCompletion = await client.chatCompletion({
        provider: PROVIDER,
        model: CHAT_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const responseText = chatCompletion.choices[0].message.content.trim()

      let rules
      try {
        rules = JSON.parse(responseText)
      } catch (error) {
        
        const jsonRegex = /{[\s\S]*?}/
        const match = responseText.match(jsonRegex)
        if (match && match[0]) {
          try {
            rules = JSON.parse(match[0])
          } catch {
            rules = createDefaultRules(query)
          }
        } else {
          rules = createDefaultRules(query)
        }
      }
      res.json({ rules })
    } catch (error) {
      console.error("Error with chat completion API:", error)
      res.json({ rules: createDefaultRules(query) })
    }
  } catch (error) {
    console.error("Error converting natural language to rules:", error)
    res.status(500).json({
      error: "Failed to convert natural language to rules",
      rules: createDefaultRules("active customers"),
    })
  }
}

function createDefaultRules(query: string) {
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

export const generateCampaignSummary = async (req: any, res: any) => {
  try {
    const { campaignId } = req.params

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        segment: true,
        communicationLogs: true,
      },
    })

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
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
    
    The summary should be concise, insightful, and highlight key metrics. It should be written in a conversational tone.`

    try {
      const chatCompletion = await client.chatCompletion({
        provider: PROVIDER,
        model: CHAT_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      })

      const summary = chatCompletion.choices[0].message.content.trim()
      res.json({ summary })
    } catch (error) {
      console.error("Error with chat completion API:", error)

      
      const defaultSummary = `The "${data.name}" campaign targeting the "${data.segment}" segment reached ${data.audienceSize} customers with a ${data.deliveryRate.toFixed(2)}% delivery rate. ${data.sentCount} messages were successfully sent, while ${data.failedCount} failed to deliver.`

      res.json({ summary: defaultSummary })
    }
  } catch (error) {
    console.error("Error generating campaign summary:", error)
    res.status(500).json({
      error: "Failed to generate campaign summary",
      summary: "Campaign summary data is currently unavailable.",
    })
  }
}
