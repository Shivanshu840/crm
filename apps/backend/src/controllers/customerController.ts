import prisma from "@repo/db/clients"

// Get all customers
export const getCustomers = async (req:any, res:any) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    res.json(customers)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Get customer by ID
export const getCustomerById = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: true,
        communicationLogs: true,
      },
    })

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    res.json(customer)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Create customer
export const createCustomer = async (req:any, res:any) => {
  try {
    const { name, email, phone } = req.body

    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    })

    if (existingCustomer) {
      return res.status(400).json({ error: "Customer with this email already exists" })
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
      },
    })

    res.status(201).json(customer)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Update customer
export const updateCustomer = async (req:any, res:any) => {
  try {
    const { id } = req.params
    const { name, email, phone, totalSpend, lastPurchase, visitCount } = req.body

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    if (email && email !== existingCustomer.email) {
      const emailExists = await prisma.customer.findUnique({
        where: { email },
      })

      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" })
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        totalSpend,
        lastPurchase,
        visitCount,
      },
    })

    res.json(customer)
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}

// Delete customer
export const deleteCustomer = async (req:any, res:any) => {
  try {
    const { id } = req.params

   
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    
    await prisma.customer.delete({
      where: { id },
    })

    res.json({ message: "Customer deleted successfully" })
  } catch (error:any) {
    res.status(500).json({ error: error.message })
  }
}
