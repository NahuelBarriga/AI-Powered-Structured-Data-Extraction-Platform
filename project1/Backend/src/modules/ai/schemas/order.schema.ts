import { z } from "zod";

export const OrderItemSchema = z.object({
  name: z.string().describe("Name of the item ordered."),
  quantity: z.number().int().min(1).describe("Quantity of the item."),
  modifiers: z.array(z.string()).optional().describe("Customizations or modifiers for the item (e.g. no sugar, extra milk)."),
});

export const OrderSchema = z.object({
  order_type: z.enum(["dine_in", "takeaway", "delivery"]).optional().describe("How the order will be fulfilled."),
  items: z.array(OrderItemSchema).min(1).describe("List of ordered items."),
  payment_method: z.enum(["cash", "card", "unknown"]).optional().describe("Payment method if mentioned."),
  customer_name: z.string().optional().describe("Name of the customer if provided."),
  notes: z.string().optional().describe("Additional order notes or instructions."),
});

export type Order = z.infer<typeof OrderSchema>;
