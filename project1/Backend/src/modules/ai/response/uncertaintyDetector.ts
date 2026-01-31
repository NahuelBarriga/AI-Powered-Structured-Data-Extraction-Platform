import type { Order } from "../schemas/order.schema";

export interface UncertaintyFlags {
  hasPlaceholderData: boolean;
  hasGenericResponses: boolean;
  hasEmptyItems: boolean;
  hasSuspiciousPatterns: boolean;
  uncertainFields: string[];
  confidenceScore: number; // 0-100
  warnings: string[];
}

/**
 * Detect potential hallucinations or uncertainty in the extracted data
 */
export function detectUncertainty(order: Order, inputText: string): UncertaintyFlags {
  const flags: UncertaintyFlags = {
    hasPlaceholderData: false,
    hasGenericResponses: false,
    hasEmptyItems: false,
    hasSuspiciousPatterns: false,
    uncertainFields: [],
    confidenceScore: 100,
    warnings: [],
  };

  // Check for placeholder/uncertain item names
  const placeholderPatterns = [
    /unknown/i,
    /n\/a/i,
    /not specified/i,
    /unclear/i,
    /item \d+/i,
    /product \d+/i,
    /^item$/i,
    /^product$/i,
  ];

  order.items.forEach((item, index) => {
    const itemName = item.name.toLowerCase();
    
    // Check for placeholder names
    if (placeholderPatterns.some(pattern => pattern.test(itemName))) {
      flags.hasPlaceholderData = true;
      flags.uncertainFields.push(`items[${index}].name`);
      flags.warnings.push(`Item "${item.name}" appears to be a placeholder`);
      flags.confidenceScore -= 20;
    }

    // Check for suspiciously generic names
    if (itemName.length < 2 || itemName === 'thing' || itemName === 'stuff') {
      flags.hasGenericResponses = true;
      flags.uncertainFields.push(`items[${index}].name`);
      flags.warnings.push(`Item "${item.name}" is too generic`);
      flags.confidenceScore -= 15;
    }

    // Check if quantity is suspicious
    if (item.quantity > 100) {
      flags.hasSuspiciousPatterns = true;
      flags.warnings.push(`Unusually high quantity (${item.quantity}) for "${item.name}"`);
      flags.confidenceScore -= 10;
    }
  });

  // Check if items array is empty (shouldn't happen due to schema validation, but just in case)
  if (order.items.length === 0) {
    flags.hasEmptyItems = true;
    flags.warnings.push("No items were extracted from the input");
    flags.confidenceScore -= 50;
  }

  // Check if input text is very short but extraction is complex
  if (inputText.trim().length < 10 && order.items.length > 0) {
    flags.hasSuspiciousPatterns = true;
    flags.warnings.push("Input text is very short, extraction may be unreliable");
    flags.confidenceScore -= 25;
  }

  // Check for "I don't know" or similar patterns in notes
  if (order.notes) {
    const uncertaintyPhrases = [
      /i don't know/i,
      /not sure/i,
      /unclear/i,
      /insufficient information/i,
      /cannot determine/i,
      /unable to extract/i,
    ];
    
    if (uncertaintyPhrases.some(pattern => pattern.test(order.notes!))) {
      flags.hasGenericResponses = true;
      flags.uncertainFields.push('notes');
      flags.warnings.push("Notes contain uncertainty indicators");
      flags.confidenceScore -= 20;
    }
  }

  // Check if customer name looks like placeholder
  if (order.customer_name) {
    const namePlaceholders = /^(customer|user|person|someone|name)$/i;
    if (namePlaceholders.test(order.customer_name)) {
      flags.hasPlaceholderData = true;
      flags.uncertainFields.push('customer_name');
      flags.warnings.push("Customer name appears to be a placeholder");
      flags.confidenceScore -= 10;
    }
  }

  // Ensure confidence score doesn't go below 0
  flags.confidenceScore = Math.max(0, flags.confidenceScore);

  return flags;
}

/**
 * Get a text description of the confidence level
 */
export function getConfidenceLevel(score: number): {
  level: "high" | "medium" | "low";
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      level: "high",
      color: "green",
      description: "High confidence - extraction appears reliable",
    };
  } else if (score >= 50) {
    return {
      level: "medium",
      color: "yellow",
      description: "Medium confidence - please review carefully",
    };
  } else {
    return {
      level: "low",
      color: "red",
      description: "Low confidence - likely contains errors or hallucinations",
    };
  }
}
