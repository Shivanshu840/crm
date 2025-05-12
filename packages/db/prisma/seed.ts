import { PrismaClient, Customer, Order, Segment, Campaign, CommunicationLog } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const customers: Customer[] = [];
  for (let i = 1; i <= 50; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        totalSpend: Math.floor(Math.random() * 10000),
        lastPurchase: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
        visitCount: Math.floor(Math.random() * 20),
      },
    });
    customers.push(customer);
  }

  const orders: Order[] = [];
  for (const customer of customers) {
    const count = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < count; i++) {
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          amount: Math.floor(Math.random() * 1000) + 100,
          items: ["Product A", "Product B", "Product C"].slice(0, Math.floor(Math.random() * 3) + 1),
          status: Math.random() > 0.1 ? "completed" : "pending",
        },
      });
      orders.push(order);
    }
  }

  const highValueSegment = await prisma.segment.create({
    data: {
      name: "High Value Customers",
      description: "Customers who have spent more than $5000",
      rules: {
        conditions: [
          {
            id: uuidv4(),
            type: "minimum spent",
            operator: "greater than",
            value: "5000",
          },
        ],
        logicType: "All",
      },
      audienceSize: customers.filter(c => c.totalSpend > 5000).length,
    },
  });

  const inactiveSegment = await prisma.segment.create({
    data: {
      name: "Inactive Customers",
      description: "Customers who haven't purchased in the last 30 days",
      rules: {
        conditions: [
          {
            id: uuidv4(),
            type: "days since last order",
            operator: "greater than",
            value: "30",
          },
        ],
        logicType: "All",
      },
      audienceSize: customers.filter(c => {
        if (!c.lastPurchase) return false;
        const days = Math.floor((Date.now() - c.lastPurchase.getTime()) / (24 * 60 * 60 * 1000));
        return days > 30;
      }).length,
    },
  });

  const frequentVisitorsSegment = await prisma.segment.create({
    data: {
      name: "Frequent Visitors",
      description: "Customers who have visited more than 10 times",
      rules: {
        conditions: [
          {
            id: uuidv4(),
            type: "visit count",
            operator: "greater than",
            value: "10",
          },
        ],
        logicType: "All",
      },
      audienceSize: customers.filter(c => c.visitCount > 10).length,
    },
  });

  const winBackCampaign = await prisma.campaign.create({
    data: {
      name: "Win-back Campaign",
      segmentId: inactiveSegment.id,
      messageTemplate: "Hi {name}, we miss you! Come back and get 10% off your next order.",
      status: "completed",
      audienceSize: inactiveSegment.audienceSize,
      sentCount: Math.floor(inactiveSegment.audienceSize * 0.9),
      failedCount: Math.floor(inactiveSegment.audienceSize * 0.1),
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
  });

  const vipCampaign = await prisma.campaign.create({
    data: {
      name: "VIP Exclusive Offer",
      segmentId: highValueSegment.id,
      messageTemplate: "Hi {name}, as a valued customer, here's an exclusive 20% discount on our premium collection!",
      status: "scheduled",
      audienceSize: highValueSegment.audienceSize,
      sentCount: 0,
      failedCount: 0,
    },
  });

  const inactiveCustomers = customers.filter(c => {
    if (!c.lastPurchase) return false;
    const days = Math.floor((Date.now() - c.lastPurchase.getTime()) / (24 * 60 * 60 * 1000));
    return days > 30;
  });

  for (const customer of inactiveCustomers) {
    await prisma.communicationLog.create({
      data: {
        campaignId: winBackCampaign.id,
        customerId: customer.id,
        messageId: uuidv4(),
        content: `Hi ${customer.name}, we miss you! Come back and get 10% off your next order.`,
        status: Math.random() > 0.1 ? "SENT" : "FAILED",
        statusUpdatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
