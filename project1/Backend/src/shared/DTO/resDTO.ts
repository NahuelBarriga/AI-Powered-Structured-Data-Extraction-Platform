import type { JsonObject } from "@prisma/client/runtime/library";
import type { Order } from "../../modules/ai/schemas/order.schema";
import type { UncertaintyFlags } from "../types/ai.types";

/**
 * Data Transfer Object for a single order item.
 * Represents one line item in an order with quantity and optional modifiers.
 */
export class OrderItemDTO {
  itemName: string;
  qty: number;
  modifiers?: (string | null)[] | null | undefined;

  /**
   * Creates a new order item DTO.
   * @param name - Item/product name
   * @param quantity - Quantity ordered
   * @param modifiers - Optional list of modifications/customizations
   */
  constructor(name: string, quantity: number, modifiers?: (string | null)[] | null) {
    this.itemName = name;
    this.qty = quantity;
    this.modifiers = modifiers;
  }
}

/**
 * Data Transfer Object for complete order creation.
 * Transforms Order schema object into flattened structure for API response.
 */
export class OrderCreateDTO {
  orderType?: "dine_in" | "takeaway" | "delivery" | undefined;
  customerName?: string | undefined;
  paymentMethod?: "cash" | "card" | "unknown" | undefined;
  notes: string | undefined;
  items: OrderItemDTO[];

  /**
   * Creates a new order creation DTO from extracted Order data.
   * @param order - Order object from LLM extraction
   */
  constructor(order: Order) {
    this.orderType = order.order_type;
    this.customerName = order.customer_name;
    this.paymentMethod = order.payment_method;
    this.notes = order.notes;
    this.items = order.items.map(
      (item) => new OrderItemDTO(item.name, item.quantity, item.modifiers)
    );
  }

  /**
   * Converts DTO to plain JavaScript object for JSON serialization.
   * @returns Plain object representation
   */
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

/**
 * Success response DTO for extraction operations.
 * Contains extracted order data, metadata, and confidence information.
 */
export class SuccessResponseDTO<T> {
  success: true;
  data: {
    result: JsonObject,
    sessionId: string,
    model: string,
    timestamp: string,
    version: number,
    id: string,
    uncertainty?: UncertaintyFlags
  };

  /**
   * Creates a success response.
   * @param result - Extracted order data
   * @param sessionId - Session ID for tracking
   * @param model - LLM model name used
   * @param timestamp - When extraction completed
   * @param version - Extraction version/attempt
   * @param id - Extraction ID in database
   * @param uncertainty - Confidence/uncertainty data
   */
  constructor(
    result: JsonObject, 
    sessionId?: string, 
    model?: string, 
    timestamp?: string, 
    version?: number, 
    id?: string,
    uncertainty?: UncertaintyFlags
  ) {
    this.success = true;
    this.data = {
      result: result,
      sessionId: sessionId || "",
      model: model || "",
      timestamp: timestamp || "",
      version: version || 1,
      id: id || "",
      ...(uncertainty && { uncertainty })
    };
  };
}

/**
 * Error response DTO for failed operations.
 * Provides error message and optional detailed debugging information.
 */
export class ErrorResponseDTO {
  success: false;
  error: string;
  details?: unknown;

  /**
   * Creates an error response.
   * @param error - Error message for user
   * @param details - Optional debugging details
   */
  constructor(error: string, details?: unknown) {
    this.success = false;
    this.error = error;
    this.details = details;
  }
}
