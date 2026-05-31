import prisma from "./prisma";
import dayjs from "dayjs";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz", 10);

/**
 * Generate a unique USDT amount for the given product * quantity
 * by appending an incrementing suffix to avoid collisions.
 */
export async function generateUniqueAmount(
  product: any,
  quantity: number,
  depth: number = 0
): Promise<string> {
  if (depth > 20) {
    throw new Error("Amount generation failed after too many attempts, try again later");
  }

  const currentHour = dayjs().format("YYYYMMDDHH");
  let no = 1;

  if (product.currentHour === currentHour) {
    no = product.currentNo + 1;
  }
  // Avoid trailing zero
  if (no % 10 === 0) no += 1;

  await prisma.product.update({
    where: { id: product.id },
    data: { currentNo: no, currentHour: currentHour },
  });

  // Amount = price * quantity + unique suffix
  const basePrice = product.price * quantity;
  const amount = `${basePrice.toFixed(2)}${no}`;

  // Check for collision within 30 minutes
  const existing = await prisma.order.findFirst({
    where: {
      amount,
      createdAt: { gt: dayjs().subtract(30, "minute").toDate() },
    },
  });

  if (existing) {
    return generateUniqueAmount(product, quantity, depth + 1);
  }

  return amount;
}

/**
 * Create a new order
 */
export async function createOrder(productId: number, email: string, quantity: number = 1) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");
  if (!product.show) throw new Error("Product is not available");

  // Check stock
  if (product.autoDeliver) {
    const availableCards = await prisma.card.count({
      where: { productId, sold: false },
    });
    if (availableCards < quantity) throw new Error("Insufficient stock");
  }

  const amount = await generateUniqueAmount(product, quantity);
  const address = process.env.BSC_WALLET || "";

  const order = await prisma.order.create({
    data: {
      orderNo: nanoid(),
      email,
      productId,
      quantity,
      amount,
      address,
      status: "pending",
    },
  });

  return order;
}

/**
 * Deliver cards for a paid order (with transaction for atomicity)
 */
export async function deliverCards(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, cards: true },
  });

  if (!order || order.status !== "paid") return null;
  if (order.cards.length > 0) return order; // Already delivered
  if (!order.product.autoDeliver) return order;

  // Use transaction to prevent race conditions
  try {
    await prisma.$transaction(async (tx) => {
      const cards = await tx.card.findMany({
        where: { productId: order.productId, sold: false },
        take: order.quantity,
      });

      if (cards.length < order.quantity) {
        throw new Error("Insufficient cards for delivery");
      }

      await tx.card.updateMany({
        where: { id: { in: cards.map((c) => c.id) } },
        data: { sold: true, orderId: order.id },
      });
    });
  } catch (err) {
    console.error("Card delivery failed:", err);
    return null;
  }

  return await prisma.order.findUnique({
    where: { id: orderId },
    include: { cards: true, product: true },
  });
}
