import { subscribeToChannel } from "./redis"

const BATCH_SIZE = 100
const BATCH_INTERVAL_MS = 5000

let deliveryReceiptBatch: any[] = []
let batchTimer: NodeJS.Timeout | null = null


async function processSegmentCreation() {
  await subscribeToChannel("segment:created", async (message) => {
    console.log("Processing segment creation:", message.id)

    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(`Segment ${message.id} processed successfully`)
  })
}

// Process campaign creation
async function processCampaignCreation() {
  await subscribeToChannel("campaign:created", async (message) => {
    console.log("Processing campaign creation:", message.id)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log(`Campaign ${message.id} processed successfully`)
  })
}


async function processDeliveryReceipts() {
  startBatchTimer()

  await subscribeToChannel("delivery:receipt", (message) => {
    deliveryReceiptBatch.push(message)
    if (deliveryReceiptBatch.length >= BATCH_SIZE) {
      processBatch()
    }
  })
}

// Process the current batch of delivery receipts
async function processBatch() {
  if (deliveryReceiptBatch.length === 0) return

  const batchToProcess = [...deliveryReceiptBatch]
  deliveryReceiptBatch = []

  console.log(`Processing batch of ${batchToProcess.length} delivery receipts`)
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Batch processed successfully")
  resetBatchTimer()
}

// Start the batch timer
function startBatchTimer() {
  if (batchTimer === null) {
    batchTimer = setTimeout(() => {
      processBatch()
    }, BATCH_INTERVAL_MS)
  }
}

// Reset the batch timer
function resetBatchTimer() {
  if (batchTimer !== null) {
    clearTimeout(batchTimer)
    batchTimer = null
  }
  startBatchTimer()
}

// Start all consumer processes
export async function startConsumerService() {
  try {
    await processSegmentCreation()
    await processCampaignCreation()
    await processDeliveryReceipts()
    console.log("Consumer service started successfully")
  } catch (error) {
    console.error("Error starting consumer service:", error)
  }
}
