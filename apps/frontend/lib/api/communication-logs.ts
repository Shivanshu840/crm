// API functions for communication logs

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function getCommunicationLogs() {
  const response = await fetch(`${API_URL}/communication-logs`)
  if (!response.ok) {
    throw new Error("Failed to fetch communication logs")
  }
  return response.json()
}

export async function getCommunicationLogById(id: string) {
  const response = await fetch(`${API_URL}/communication-logs/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch communication log")
  }
  return response.json()
}

export async function getCommunicationLogsByCampaignId(campaignId: string) {
  const response = await fetch(`${API_URL}/communication-logs/campaign/${campaignId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch communication logs for campaign")
  }
  return response.json()
}

export async function getCommunicationLogsByCustomerId(customerId: string) {
  const response = await fetch(`${API_URL}/communication-logs/customer/${customerId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch communication logs for customer")
  }
  return response.json()
}

export async function updateCommunicationLogStatus(messageId: string, status: string) {
  const response = await fetch(`${API_URL}/communication-logs/message/${messageId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update communication log status")
  }

  return response.json()
}
