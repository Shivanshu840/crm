const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function getMessageSuggestions(segmentName: string, objective: string) {
  const response = await fetch(`${API_URL}/ai/message-suggestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ segmentName, objective }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get message suggestions")
  }

  return response.json()
}

export async function convertNaturalLanguageToRules(query: string) {
  const response = await fetch(`${API_URL}/ai/natural-language-rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to convert natural language to rules")
  }

  return response.json()
}

export async function getCampaignSummary(campaignId: string) {
  const response = await fetch(`${API_URL}/ai/campaign-summary/${campaignId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get campaign summary")
  }

  return response.json()
}
