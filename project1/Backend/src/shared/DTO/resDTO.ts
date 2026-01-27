import type { Order } from "../../modules/ai/schemas/order.schema";

export class OrderItemDTO {
  itemName: string;
  qty: number;
  modifiers: string | null;

  constructor(name: string, quantity: number, modifiers: string | null) {
    this.itemName = name;
    this.qty = quantity;
    this.modifiers = modifiers;
  }
}

export class OrderCreateDTO {
  orderType?: "dine_in" | "takeaway" | "delivery" | undefined;
  customerName?: string | undefined;
  paymentMethod?: "cash" | "card" | "unknown" | undefined;
  notes: string | null;
  items: OrderItemDTO[];

  constructor(order: Order) {
    this.orderType = order.order_type;
    this.customerName = order.customer_name;
    this.paymentMethod = order.payment_method;
    this.notes = order.notes;
    this.items = order.items.map(
      (item) => new OrderItemDTO(item.name, item.quantity, item.modifiers)
    );
  }

  toJSON() {
    return {
      orderType: this.orderType,
      customerName: this.customerName,
      paymentMethod: this.paymentMethod,
      notes: this.notes,
      items: this.items,
    };
  }
}

export class SuccessResponseDTO<T> {
  success: true;
  data: T;

  constructor(data: T) {
    this.success = true;
    this.data = data;
  }
}

export class ErrorResponseDTO {
  success: false;
  error: string;
  details?: unknown;

  constructor(error: string, details?: unknown) {
    this.success = false;
    this.error = error;
    this.details = details;
  }
}
