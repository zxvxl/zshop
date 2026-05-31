import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@zshop.com" },
    update: {},
    create: {
      email: "admin@zshop.com",
      password: adminPassword,
      nickname: "Admin",
      role: "admin",
    },
  });

  // Create categories
  const cat1 = await prisma.category.create({
    data: { name: "AI 会员", nameEn: "AI Membership", sort: 1 },
  });
  const cat2 = await prisma.category.create({
    data: { name: "开发工具", nameEn: "Dev Tools", sort: 2 },
  });

  // Create products
  const p1 = await prisma.product.create({
    data: {
      title: "ChatGPT Plus 月卡",
      titleEn: "ChatGPT Plus Monthly",
      description: "ChatGPT Plus 独享账号，质保30天",
      descEn: "ChatGPT Plus exclusive account, 30-day warranty",
      price: 25.00,
      categoryId: cat1.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      title: "Claude Pro 月卡",
      titleEn: "Claude Pro Monthly",
      description: "Claude Pro 独享，支持 Opus 模型",
      descEn: "Claude Pro exclusive, Opus model supported",
      price: 30.00,
      categoryId: cat1.id,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      title: "Cursor Pro 月卡",
      titleEn: "Cursor Pro Monthly",
      description: "Cursor Pro 成品号",
      descEn: "Cursor Pro ready-to-use account",
      price: 20.00,
      categoryId: cat2.id,
    },
  });

  // Add demo cards
  for (let i = 1; i <= 5; i++) {
    await prisma.card.create({ data: { productId: p1.id, content: `chatgpt-plus-${i}@demo.com | pass${i}` } });
    await prisma.card.create({ data: { productId: p2.id, content: `claude-pro-${i}@demo.com | pass${i}` } });
    await prisma.card.create({ data: { productId: p3.id, content: `cursor-pro-${i}@demo.com | pass${i}` } });
  }

  console.log("Seed completed!");
}

main().finally(() => prisma.$disconnect());
