import prisma from "@repo/db/clients"

// Get all segments
export const getSegments = async (req: any, res: any) => {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(segments)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Get segment by ID
export const getSegmentById = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const segment = await prisma.segment.findUnique({
      where: { id },
      include: {
        campaigns: true,
      },
    })

    if (!segment) {
      return res.status(404).json({ error: "Segment not found" })
    }

    res.json(segment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Create segment
export const createSegment = async (req: any, res: any) => {
  try {
    const { name, description, rules } = req.body

    const audienceSize = await calculateAudienceSize(rules)

    const segment = await prisma.segment.create({
      data: {
        name,
        description,
        rules,
        audienceSize,
      },
    })

    res.status(201).json(segment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Update segment
export const updateSegment = async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { name, description, rules } = req.body

    const existingSegment = await prisma.segment.findUnique({
      where: { id },
    })

    if (!existingSegment) {
      return res.status(404).json({ error: "Segment not found" })
    }

    let audienceSize = existingSegment.audienceSize
    if (rules && JSON.stringify(rules) !== JSON.stringify(existingSegment.rules)) {
      audienceSize = await calculateAudienceSize(rules)
    }

    const segment = await prisma.segment.update({
      where: { id },
      data: {
        name,
        description,
        rules,
        audienceSize,
      },
    })

    res.json(segment)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete segment
export const deleteSegment = async (req: any, res: any) => {
  try {
    const { id } = req.params

    const existingSegment = await prisma.segment.findUnique({
      where: { id },
    })

    if (!existingSegment) {
      return res.status(404).json({ error: "Segment not found" })
    }

    const campaignsUsingSegment = await prisma.campaign.findMany({
      where: { segmentId: id },
    })

    if (campaignsUsingSegment.length > 0) {
      return res.status(400).json({
        error: "Cannot delete segment as it is used in campaigns",
        campaigns: campaignsUsingSegment,
      })
    }

    await prisma.segment.delete({
      where: { id },
    })

    res.json({ message: "Segment deleted successfully" })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Preview audience for a segment
export const previewAudience = async (req: any, res: any) => {
  try {
    const { rules } = req.body
    const audienceSize = await calculateAudienceSize(rules)

    // Get sample customers (limit to 10)
    
    const customers = await getCustomersForSegment(rules, 10)

    res.json({
      audienceSize,
      sampleCustomers: customers,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

// Helper function to calculate audience size based on rules
async function calculateAudienceSize(rules: any) {
  try {
    const customers = await getCustomersForSegment(rules)
    return customers.length
  } catch (error) {
    console.error("Error calculating audience size:", error)
    return 0
  }
}

// Helper function to get customers that match segment rules
async function getCustomersForSegment(rules: any, limit: number | null = null) {
  const query = buildPrismaQueryFromRules(rules)

  const options: any = {
    where: query,
  }

  if (limit) {
    options.take = limit // ensure 'take' property is used correctly
  }

  return await prisma.customer.findMany(options)
}

// Helper function to build Prisma query from segment rules
function buildPrismaQueryFromRules(rules: any) {
  const { conditions, logicType } = rules

  if (!conditions || conditions.length === 0) {
    return {}
  }

  // Map conditions to Prisma query format
  const queries = conditions.map((condition: any) => {
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

  if (logicType === "All") {
    return { AND: queries }
  } else {
    return { OR: queries }
  }
}

function getOperatorQuery(operator: any, value: any) {
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
function getDateOperatorQuery(operator: any, date: any) {
  switch (operator) {
    case "is":
      return { equals: date }
    case "greater than":
      return { lt: date }
    case "less than":
      return { gt: date }
    default:
      return {}
  }
}
