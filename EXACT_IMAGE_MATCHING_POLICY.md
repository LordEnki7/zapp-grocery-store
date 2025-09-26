# EXACT IMAGE MATCHING POLICY

## Policy Statement
When a user provides specific images with exact product names, the system MUST prioritize exact name matches over similarity algorithms or fuzzy matching.

## Core Principles

### 1. Exact Match Priority
- **ALWAYS** check for exact name matches first (case-insensitive)
- Only use similarity algorithms if no exact matches are found
- Never override an exact match with a "better" similarity score

### 2. User Intent Recognition
- When a user says "I gave you the exact image" or similar phrases, this indicates:
  - They have provided images with specific names
  - They expect those exact names to be matched to products
  - Similarity matching should be secondary

### 3. Matching Hierarchy
1. **Exact Match** (score: 1.0) - Product name exactly matches image filename
2. **High Confidence Partial** (score: 0.8+) - All words from product name found in image name
3. **Medium Confidence Partial** (score: 0.6+) - Most words match with high relevance
4. **Low Confidence Partial** (score: 0.4+) - Some words match but uncertain
5. **No Match** (score: <0.4) - Skip this pairing

## Implementation Requirements

### Script Behavior
- Always scan for exact matches first before any similarity calculations
- Log exact matches prominently with "EXACT MATCH" prefix
- Report unused exact matches as high-priority items
- Create separate sections in reports for exact vs. partial matches

### Error Prevention
- Never skip an exact match due to algorithm preferences
- Always validate that provided image directory exists and is accessible
- Warn user if exact match images exist but weren't used

### User Communication
- Clearly distinguish between exact and partial matches in reports
- Highlight when exact matches are available but not used
- Provide specific feedback about which images matched exactly

## Quality Assurance

### Before Execution
- Verify image directory path is correct
- Confirm images are accessible and in supported formats
- Check that product names in database match expected format

### After Execution
- Verify all exact matches were applied
- Report any exact matches that were skipped
- Confirm no similarity matches overrode exact matches

## Examples

### Good Behavior ✅
```
Product: "Apple Cider Vinegar"
Image: "Apple Cider Vinegar.jpg"
Result: EXACT MATCH (score: 1.0) ✅
```

### Bad Behavior ❌
```
Product: "Apple Cider Vinegar"
Available: "Apple Cider Vinegar.jpg"
Used: "Organic Herbal Tea.webp" (similarity score: 0.3)
Result: WRONG - Should use exact match ❌
```

## Enforcement
- All image matching scripts must follow this policy
- Any deviation requires explicit user approval
- Regular audits of matching results to ensure compliance

## Policy Updates
- This policy takes precedence over previous matching algorithms
- Updates require user notification and approval
- Version control all policy changes

---
**Created**: 2025-09-24
**Version**: 1.0
**Status**: Active