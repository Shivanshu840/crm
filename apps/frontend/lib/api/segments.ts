const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function getSegments() {
  const response = await fetch(`${API_URL}/segments`)
  if (!response.ok) {
    throw new Error("Failed to fetch segments")
  }
  return response.json()
}

export async function getSegmentById(id: string) {
  const response = await fetch(`${API_URL}/segments/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch segment")
  }
  return response.json()
}

export async function createSegment(data: any) {
  const response = await fetch(`${API_URL}/segments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create segment")
  }

  return response.json()
}

export async function updateSegment(id: string, data: any) {
  const response = await fetch(`${API_URL}/segments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update segment")
  }

  return response.json()
}

export async function deleteSegment(id: string) {
  const response = await fetch(`${API_URL}/segments/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete segment")
  }

  return response.json()
}

export async function previewAudience(rules: any) {
  const response = await fetch(`${API_URL}/segments/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rules }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to preview audience")
  }

  return response.json()
}
