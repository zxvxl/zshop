import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nickname: z.string().max(50).optional().default(""),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const createOrderSchema = z.object({
  productId: z.number().int().positive("Invalid product"),
  email: z.string().email("Invalid email format"),
  quantity: z.number().int().min(1).max(100).optional().default(1),
  channelId: z.number().int().positive().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const orderQuerySchema = z.object({
  email: z.string().email("Invalid email"),
  orderNo: z.string().min(5, "Order number too short"),
});

export const orderCheckSchema = z.object({
  orderNo: z.string().min(8, "Invalid order number"),
});
