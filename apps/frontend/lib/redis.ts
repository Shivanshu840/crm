import { Redis } from "@upstash/redis"

// Create Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
})

// Publisher function
export async function publishMessage(channel: string, message: any) {
  try {
    await redis.publish(channel, JSON.stringify(message))
    return true
  } catch (error) {
    console.error("Error publishing message:", error)
    return false
  }
}

// Subscriber function (to be used in a separate consumer service)
export async function subscribeToChannel(channel: string, callback: (message: any) => void) {
  try {
    const subscription = redis.subscribe(channel, (message) => {
      try {
        const parsedMessage = JSON.parse(message)
        callback(parsedMessage)
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    })

    return subscription
  } catch (error) {
    console.error("Error subscribing to channel:", error)
    return null
  }
}

export { redis }
