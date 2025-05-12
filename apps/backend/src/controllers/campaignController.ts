
import { sendEmail } from "../services/emailService.js"
import { v4 as uuidv4 } from "uuid"
import prisma from "@repo/db/clients"

export const getCampaigns = async (req:any, res:any) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        segment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(campaigns)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

export const getCampaignById = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        segment: true,
        communicationLogs: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    res.json(campaign)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Create campaign
export const createCampaign = async (req:any, res:any) => {
  try {
    const { name, segmentId, messageTemplate } = req.body

    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
    })

    if (!segment) {
      return res.status(404).json({ error: "Segment not found" })
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        segmentId,
        messageTemplate,
        audienceSize: segment.audienceSize,
      },
    })

    res.status(201).json(campaign)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateCampaign = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const { name, messageTemplate, status } = req.body

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!existingCampaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    if (existingCampaign.status === "completed" || existingCampaign.status === "in_progress") {
      return res.status(400).json({ error: "Cannot update campaign that is already in progress or completed" })
    }

    // Update campaign
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name,
        messageTemplate,
        status,
      },
    })

    res.json(campaign)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete campaign
export const deleteCampaign = async (req:any, res:any) => {
  try {
    const { id } = req.params

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!existingCampaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    if (existingCampaign.status === "completed" || existingCampaign.status === "in_progress") {
      return res.status(400).json({ error: "Cannot delete campaign that is already in progress or completed" })
    }

    await prisma.campaign.delete({
      where: { id },
    })

    res.json({ message: "Campaign deleted successfully" })
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Execute campaign
export const executeCampaign = async (req:any, res:any) => {
  try {
    const { id } = req.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        segment: true,
      },
    })

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

   
    if (campaign.status === "completed" || campaign.status === "in_progress") {
      return res.status(400).json({ error: "Campaign is already in progress or completed" })
    }

    // Update campaign status to in_progress
    await prisma.campaign.update({
      where: { id },
      data: {
        status: "in_progress",
        startedAt: new Date(),
      },
    })

    const customers = await getCustomersForSegment(campaign.segment.rules)


    const emailPromises = customers.map(async (customer: { name: string; id: string; email: string }) => {
      try {
        const personalizedMessage = campaign.messageTemplate.replace(/{name}/g, customer.name)
        const messageId = uuidv4()

       
        await prisma.communicationLog.create({
          data: {
            campaignId: campaign.id,
            customerId: customer.id,
            messageId,
            content: personalizedMessage,
            status: "PENDING",
          },
        })

        
        const emailResult = await sendEmail({
          to: customer.email,
          subject: `${campaign.name}`,
          text: personalizedMessage,
          messageId,
        })

        
        await prisma.communicationLog.update({
          where: { messageId },
          data: {
            status: emailResult.success ? "SENT" : "FAILED",
            statusUpdatedAt: new Date(),
          },
        })

        return {
          customerId: customer.id,
          success: emailResult.success,
        }
      } catch (error) {
        console.error(`Error sending email to customer ${customer.id}:`, error)

       
        await prisma.communicationLog.updateMany({
          where: {
              campaignId: campaign.id,
              customerId: customer.id,
          },
          data: {
            status: "FAILED",
            statusUpdatedAt: new Date(),
          },
        })

        return {
          customerId: customer.id,
          success: false,
        }
      }
    })

    
    const results = await Promise.all(emailPromises)

    const sentCount = results.filter((r) => r.success).length
    const failedCount = results.filter((r) => !r.success).length

   
    await prisma.campaign.update({
      where: { id },
      data: {
        status: "completed",
        sentCount,
        failedCount,
        completedAt: new Date(),
      },
    })

    res.json({
      message: "Campaign executed successfully",
      audienceSize: customers.length,
      sentCount,
      failedCount,
    })
  } catch (error:any) {

    await prisma.campaign.update({
      where: { id: req.params.id },
      data: {
        status: "failed",
      },
    })

    res.status(500).json({ error: error.message })
  }
}


async function getCustomersForSegment(rules: any) {
  const query = buildPrismaQueryFromRules(rules)

  return await prisma.customer.findMany({
    where: query,
  })
}


function buildPrismaQueryFromRules(rules:any) {
  const { conditions, logicType } = rules


  if (!conditions || conditions.length === 0) {
    return {}
  }

  // Map conditions to Prisma query format
  const queries = conditions.map((condition:any) => {
    const { type, operator, value } = condition

    switch (type) {
      case "minimum spent":
        return {
          totalSpend: getOperatorQuery(operator, Number.parseFloat(value)),
        }
      case "total orders":
        return {
          orders: {
            some: {},
            _count: getOperatorQuery(operator, Number.parseInt(value)),
          },
        }
      case "days since last order":
        const date = new Date()
        date.setDate(date.getDate() - Number.parseInt(value))
        return {
          lastPurchase: getDateOperatorQuery(operator, date),
        }
      case "visit count":
        return {
          visitCount: getOperatorQuery(operator, Number.parseInt(value)),
        }
      default:
        return {}
    }
  })

  // Combine queries based on logic type (AND/OR)
  if (logicType === "All") {
    return { AND: queries }
  } else {
    return { OR: queries }
  }
}

// Helper function to get Prisma operator query
function getOperatorQuery(operator: any, value: string | number | any[]) {
  switch (operator) {
    case "is":
      return { equals: value }
    case "greater than":
      return { gt: value }
    case "less than":
      return { lt: value }
    case "between":
      if (Array.isArray(value) && value.length === 2) {
        return { gte: value[0], lte: value[1] }
      }
      return {}
    default:
      return {}
  }
}

// Helper function to get Prisma date operator query
function getDateOperatorQuery(operator: any, date: Date) {
  switch (operator) {
    case "is":
      return { equals: date }
    case "greater than":
      return { lt: date } 
      return { gt: date } 
    default:
      return {}
  }
}
