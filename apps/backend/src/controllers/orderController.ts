import prisma from "@repo/db/clients"

// Get all orders
export const getOrders = async (req:any, res:any) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(orders)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Get order by ID
export const getOrderById = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    res.json(order)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Get orders by customer ID
export const getOrdersByCustomerId = async (req:any, res:any) => {
  try {
    const { customerId } = req.params
    const orders = await prisma.order.findMany({
      where: { customerId },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(orders)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Create order
export const createOrder = async (req:any, res:any) => {
  try {
    const { customerId, amount, items, status } = req.body

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        amount,
        items,
        status: status || "completed",
      },
    })

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        totalSpend: { increment: amount },
        lastPurchase: new Date(),
      },
    })

    res.status(201).json(order)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Update order
export const updateOrder = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const { amount, items, status } = req.body

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" })
    }

    if (amount && amount !== existingOrder.amount) {
      const amountDifference = amount - existingOrder.amount
      await prisma.customer.update({
        where: { id: existingOrder.customerId },
        data: {
          totalSpend: { increment: amountDifference },
        },
      })
    }

    
    const order = await prisma.order.update({
      where: { id },
      data: {
        amount,
        items,
        status,
      },
    })

    res.json(order)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete order
export const deleteOrder = async (req:any, res:any) => {
  try {
    const { id } = req.params

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" })
    }

    await prisma.customer.update({
      where: { id: existingOrder.customerId },
      data: {
        totalSpend: { decrement: existingOrder.amount },
      },
    })

    await prisma.order.delete({
      where: { id },
    })

    res.json({ message: "Order deleted successfully" })
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}
