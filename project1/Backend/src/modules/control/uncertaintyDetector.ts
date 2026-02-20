import type { Order } from "../ai/schemas/order.schema";
import type { UncertaintyFlags } from "../../shared/types/ai.types";

/**
 * Detect potential hallucinations or uncertainty in the extracted data
 */
export function detectUncertainty(order: Order, inputText: string, retries: number = 1, tokensIn: number = 0, tokensOut: number = 0): UncertaintyFlags {
  const flags: UncertaintyFlags = {
    hasPlaceholderData: false,
    hasGenericResponses: false,
    hasEmptyItems: false,
    hasSuspiciousPatterns: false,
    uncertainFields: [],
    confidenceScore: 100,
    warnings: [],
    schemaCompliance: 100,
    retryPenalty: 0,
    tokenBehavior: 0,
  };

  // ============ SCHEMA COMPLIANCE SIGNAL ============
  // Penalty for items that are missing required fields or have unusual patterns
  let schemaIssues = 0;
  order.items.forEach((item, index) => {
    if (!item.name || item.name.trim().length === 0) {
      schemaIssues++;
      flags.warnings.push(`Item ${index} has empty name`);
    }
    if (item.quantity <= 0) {
      schemaIssues++;
      flags.warnings.push(`Item ${index} has invalid quantity`);
    }
  });

  if (schemaIssues > 0) {
    flags.schemaCompliance = Math.max(0, 100 - (schemaIssues * 20));
  }

  
  // Multiple retries indicate the LLM struggled to produce valid JSON
  if (retries > 1) { 
    const retryMultiplier = Math.min(30, (retries - 1) * 15); // Each retry costs 15 points, capped at 30
    flags.retryPenalty = retryMultiplier;
    flags.warnings.push(`Extraction required ${retries} attempts (LLM struggled with consistency)`);
  }

  // Analyze token efficiency and response quality
  // If tokens are unusually high relative to input, it might indicate hallucination
  if (tokensIn > 0 && tokensOut > 0) {
    const tokenRatio = tokensOut / tokensIn;
    
    // Healthy range is 0.5x to 2x the input tokens
    if (tokenRatio > 2) {
      flags.tokenBehavior -= 15;
      flags.warnings.push(`Response is significantly longer than input (possible hallucination)`);
    } else if (tokenRatio < 0.2) {
      flags.tokenBehavior -= 10;
      flags.warnings.push(`Response is very short relative to input (possible underfitting)`);
    }
  }

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

  // Combine all signals into final score
  // Base: confidenceScore (content-based)
  // Subtract: schemaCompliance issues
  // Subtract: retry penalty
  // Add: token behavior bonus/penalty
  const finalScore = 
    flags.confidenceScore * 0.5 +           // 50% weight on content quality
    flags.schemaCompliance * 0.25 +          // 25% weight on schema compliance
    (100 - flags.retryPenalty) * 0.15 +      // 15% weight on retry attempts
    (100 + flags.tokenBehavior) * 0.1;       // 10% weight on token efficiency

  flags.confidenceScore = Math.max(0, Math.min(100, finalScore));

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
