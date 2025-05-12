import prisma from "@repo/db/clients";
import { huggingface } from "../services/huggingFace";

export const generateMessageSuggestions = async (req:any, res:any) => {
  try {
    const { segmentName, objective } = req.body;

    if (!segmentName || !objective) {
      return res.status(400).json({ error: "Segment name and objective are required" });
    }

    const prompt = `Generate 3 short marketing message templates for a campaign targeting "${segmentName}" segment with the objective to "${objective}". Each message should be personalized with {name} placeholder and be under 160 characters. Format the response as a JSON array of strings.`;

    const response = await huggingface.chat({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: prompt }],
    });

    const suggestions = JSON.parse(response.message.trim());
    res.json({ suggestions });
  } catch (error) {
    console.error("Error generating message suggestions:", error);
    res.status(500).json({ error: "Failed to generate message suggestions" });
  }
};

export const naturalLanguageToRules = async (req:any, res: any) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
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
    }`;

    const response = await huggingface.chat({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: prompt }],
    });

    const rules = JSON.parse(response.message.trim());
    res.json({ rules });
  } catch (error) {
    console.error("Error converting natural language to rules:", error);
    res.status(500).json({ error: "Failed to convert natural language to rules" });
  }
};

export const generateCampaignSummary = async (req: any, res: any) => {
  try {
    const { campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        segment: true,
        communicationLogs: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const data = {
      name: campaign.name,
      segment: campaign.segment.name,
      audienceSize: campaign.audienceSize,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      deliveryRate: campaign.audienceSize > 0
        ? (campaign.sentCount / campaign.audienceSize) * 100
        : 0,
    };

    const prompt = `Generate a human-readable summary of the following campaign performance data:
    Campaign: ${data.name}
    Segment: ${data.segment}
    Audience Size: ${data.audienceSize}
    Messages Sent: ${data.sentCount}
    Messages Failed: ${data.failedCount}
    Delivery Rate: ${data.deliveryRate.toFixed(2)}%
    
    The summary should be concise, insightful, and highlight key metrics. It should be written in a conversational tone.`;

    const response = await huggingface.chat({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = response.message.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error generating campaign summary:", error);
    res.status(500).json({ error: "Failed to generate campaign summary" });
  }
};
