export interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
}

export interface Order {
  order_type?: "dine_in" | "takeaway" | "delivery";
  items: OrderItem[];
  payment_method?: "cash" | "card" | "unknown";
  customer_name?: string;
  notes?: string;
}

export interface ExtractionResponse {
  sessionId: string;
  extractionId: string;
  data: Order;
  confidence?: "low" | "medium" | "high";
}
