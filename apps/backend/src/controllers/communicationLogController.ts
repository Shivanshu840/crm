import prisma from "@repo/db/clients"

//Get all communication log
export const getCommunicationLogs = async (req:any, res:any) => {
  try {
    const logs = await prisma.communicationLog.findMany({
      include: {
        campaign: true,
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(logs)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Get communication log by ID
export const getCommunicationLogById = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const log = await prisma.communicationLog.findUnique({
      where: { id },
      include: {
        campaign: true,
        customer: true,
      },
    })

    if (!log) {
      return res.status(404).json({ error: "Communication log not found" })
    }

    res.json(log)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Get communication logs by campaign ID
export const getCommunicationLogsByCampaignId = async (req:any, res:any) => {
  try {
    const { campaignId } = req.params
    const logs = await prisma.communicationLog.findMany({
      where: { campaignId },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(logs)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Get communication logs by customer ID
export const getCommunicationLogsByCustomerId = async (req:any, res:any) => {
  try {
    const { customerId } = req.params
    const logs = await prisma.communicationLog.findMany({
      where: { customerId },
      include: {
        campaign: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(logs)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Update communication log status (delivery receipt)
export const updateCommunicationLogStatus = async (req:any, res:any) => {
  try {
    const { messageId } = req.params
    const { status } = req.body


    const existingLog = await prisma.communicationLog.findUnique({
      where: { messageId },
    })

    if (!existingLog) {
      return res.status(404).json({ error: "Communication log not found" })
    }

    const log = await prisma.communicationLog.update({
      where: { messageId },
      data: {
        status,
        statusUpdatedAt: new Date(),
      },
    })

   
    const campaign = await prisma.campaign.findUnique({
      where: { id: existingLog.campaignId },
    })

    if (campaign) {
      if (existingLog.status === "PENDING" && status === "SENT") {
        await prisma.campaign.update({
          where: { id: existingLog.campaignId },
          data: {
            sentCount: { increment: 1 },
          },
        })
      }
     
      else if (existingLog.status === "PENDING" && status === "FAILED") {
        await prisma.campaign.update({
          where: { id: existingLog.campaignId },
          data: {
            failedCount: { increment: 1 },
          },
        })
      }
     
      else if (existingLog.status === "SENT" && status === "FAILED") {
        await prisma.campaign.update({
          where: { id: existingLog.campaignId },
          data: {
            sentCount: { decrement: 1 },
            failedCount: { increment: 1 },
          },
        })
      }
  
      else if (existingLog.status === "FAILED" && status === "SENT") {
        await prisma.campaign.update({
          where: { id: existingLog.campaignId },
          data: {
            sentCount: { increment: 1 },
            failedCount: { decrement: 1 },
          },
        })
      }
    }

    res.json(log)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}
