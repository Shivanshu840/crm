const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function getCampaigns() {
  const response = await fetch(`${API_URL}/campaigns`)
  if (!response.ok) {
    throw new Error("Failed to fetch campaigns")
  }
  return response.json()
}

export async function getCampaignById(id: string) {
  const response = await fetch(`${API_URL}/campaigns/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch campaign")
  }
  return response.json()
}

export async function createCampaign(data: any) {
  const response = await fetch(`${API_URL}/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create campaign")
  }

  return response.json()
}

export async function updateCampaign(id: string, data: any) {
  const response = await fetch(`${API_URL}/campaigns/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update campaign")
  }

  return response.json()
}

export async function deleteCampaign(id: string) {
  const response = await fetch(`${API_URL}/campaigns/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete campaign")
  }

  return response.json()
}

export async function executeCampaign(id: string) {
  const response = await fetch(`${API_URL}/campaigns/${id}/execute`, {
    method: "POST",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to execute campaign")
  }

  return response.json()
}
