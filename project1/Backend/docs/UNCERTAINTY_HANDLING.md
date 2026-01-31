# Hallucination and Uncertainty Handling

This document describes how the system handles AI hallucinations and uncertainty in extractions.

## Overview

The system implements a comprehensive uncertainty detection system that:
1. Analyzes extracted data for signs of hallucinations or low confidence
2. Calculates a confidence score (0-100%)
3. Provides specific warnings about potential issues
4. Displays visual indicators to users
5. Suggests corrective actions

## Backend Implementation

### Uncertainty Detector (`uncertaintyDetector.ts`)

The detector analyzes extracted data for:

#### Placeholder Detection
- Checks for generic names like "Unknown", "Item 1", "Product"
- Flags customer names that are placeholders ("Customer", "User")
- Detects uncertainty phrases in notes ("I don't know", "not sure")

#### Generic Response Detection
- Identifies overly generic item names
- Flags items with names shorter than 2 characters
- Detects vague descriptions

#### Suspicious Pattern Detection
- Flags unusually high quantities (>100)
- Detects mismatches between input length and extraction complexity
- Identifies incomplete or empty extractions

#### Confidence Scoring
- Starts at 100% confidence
- Deducts points for each issue found:
  - Placeholder data: -20 points
  - Generic responses: -15 points
  - Suspicious patterns: -10 to -25 points
  - Empty items: -50 points

### Integration Points

1. **AI Service** (`ai.service.ts`)
   - Calls `detectUncertainty()` after successful extraction
   - Includes uncertainty data in the result
   - Logs warnings when confidence < 80%

2. **Input Service** (`input.service.ts`)
   - Passes uncertainty data through to the response
   - Stores it with extraction results

3. **Response DTO** (`resDTO.ts`)
   - Extended to include optional `uncertainty` field
   - Sent to frontend with extraction data

## Frontend Implementation

### ConfidenceBadge Component

Visual indicator showing:
- **High Confidence (80-100%)**: Green badge with checkmark
- **Medium Confidence (50-79%)**: Yellow badge with lightning bolt
- **Low Confidence (0-49%)**: Red badge with warning icon

Features:
- Progress bar showing confidence percentage
- List of specific warnings/issues
- Helpful tips for improvement (shown when confidence < 80%)

### ExtractionDisplay Component

Updated to:
- Show confidence badge at the top
- Highlight uncertain data visually
- Display warnings inline with results

## User Experience

### High Confidence (≥80%)
✅ Green badge: "High Confidence - extraction appears reliable"
- User can proceed with confidence
- No additional warnings shown

### Medium Confidence (50-79%)
⚡ Yellow badge: "Medium confidence - please review carefully"
- Shows specific warnings
- Suggests using "Refine" feature
- User should verify data before using

### Low Confidence (<50%)
⚠️ Red badge: "Low confidence - likely contains errors or hallucinations"
- Clear warning message
- Detailed list of issues
- Strong recommendation to refine or retry
- User should not trust data without verification

## Example Scenarios

### Scenario 1: Placeholder Detection
**Input**: "da"
**Output**: 
```json
{
  "items": [{"name": "Item 1", "quantity": 1}]
}
```
**Result**: 
- Confidence: 60%
- Warning: "Item 'Item 1' appears to be a placeholder"
- Recommendation: Add more descriptive text

### Scenario 2: Vague Input
**Input**: "something"
**Output**: 
```json
{
  "items": [{"name": "thing", "quantity": 1}]
}
```
**Result**:
- Confidence: 45%
- Warnings: "Item 'thing' is too generic", "Input text is very short"
- Recommendation: Provide detailed order information

### Scenario 3: Uncertainty in Notes
**Input**: "coffee but I don't know what type"
**Output**:
```json
{
  "items": [{"name": "Coffee", "quantity": 1}],
  "notes": "Type not specified - unclear from input"
}
```
**Result**:
- Confidence: 70%
- Warning: "Notes contain uncertainty indicators"
- Recommendation: Clarify the coffee type

## Best Practices

### For Users
1. Provide clear, detailed input text
2. Review medium/low confidence extractions carefully
3. Use "Refine" feature to add clarifying information
4. Use "Retry" if extraction seems completely wrong

### For Developers
1. Tune confidence thresholds based on real-world usage
2. Add new detection patterns as hallucinations are discovered
3. Monitor logs for low-confidence extractions
4. Consider adding more specific validation rules

## Future Enhancements

Potential improvements:
1. Machine learning-based confidence scoring
2. Field-level confidence indicators
3. Historical accuracy tracking per user
4. Automatic retry for very low confidence
5. A/B testing different LLM prompts for uncertain cases
6. User feedback loop to improve detection
