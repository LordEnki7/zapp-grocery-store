# NEVER BREAK WORKING FEATURES POLICY

## CRITICAL RULE: NEVER BREAK WORKING FUNCTIONALITY

This policy is established to prevent any future incidents where working features are broken during updates or modifications.

## MANDATORY PROCEDURES

### 1. BEFORE ANY CHANGES
- **ALWAYS** verify what is currently working
- **ALWAYS** test the current functionality before making changes
- **ALWAYS** document what works before modifying anything
- **ALWAYS** create backups of working data/files

### 2. DURING CHANGES
- **NEVER** replace working data with non-existent references
- **NEVER** assume new data will work without verification
- **ALWAYS** verify that referenced files/images/resources exist
- **ALWAYS** test changes incrementally

### 3. AFTER CHANGES
- **ALWAYS** verify that previously working features still work
- **ALWAYS** test the complete user experience
- **ALWAYS** check for broken images, links, or functionality
- **ALWAYS** preview changes before considering them complete

## SPECIFIC RULES FOR PRODUCT DATA

### Image References
- **NEVER** reference images that don't exist in `public/images/products/`
- **ALWAYS** verify image files exist before updating product data
- **ALWAYS** use exact filename matches (case-sensitive)
- **ALWAYS** test image loading in the browser

### Product Data Updates
- **NEVER** replace working product data without verifying new data works
- **ALWAYS** check that all referenced images exist
- **ALWAYS** maintain data consistency across all product files
- **ALWAYS** test featured products display after updates

## VIOLATION CONSEQUENCES

Breaking this policy results in:
1. Immediate rollback of changes
2. Complete restoration of working functionality
3. Mandatory verification of all related features
4. Additional testing requirements for future changes

## EMERGENCY PROCEDURES

If working features are broken:
1. **IMMEDIATELY** stop all other work
2. **IMMEDIATELY** restore working functionality
3. **IMMEDIATELY** verify restoration is complete
4. **IMMEDIATELY** test all related features
5. Only then proceed with proper implementation

## VERIFICATION CHECKLIST

Before any commit or deployment:
- [ ] All previously working features still work
- [ ] All images load correctly
- [ ] All product data displays properly
- [ ] Featured products section works
- [ ] No broken links or references
- [ ] Browser shows no errors
- [ ] User experience is not degraded

## REMEMBER: WORKING FEATURES ARE SACRED

**NEVER BREAK WHAT WORKS. EVER.**

---
*This policy was created after a critical incident where working product data was replaced with non-functional references, breaking the user experience. This must never happen again.*