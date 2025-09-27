# Translation Management Guidelines

This document outlines the best practices and automated systems in place to prevent translation key issues and ensure consistent internationalization across the application.

## 🎯 Overview

Our translation system is designed to:
- Prevent missing translation keys from reaching production
- Enforce consistent naming conventions
- Provide automatic fallbacks for missing translations
- Validate translation usage at development and build time

## 🔧 Automated Prevention Systems

### 1. Pre-commit Hooks
Every commit is automatically validated for:
- ✅ All translation keys exist in both language files
- ✅ Components use `safeTranslate()` instead of direct `t()` calls
- ✅ Proper import statements for translation utilities

### 2. ESLint Rules
Custom ESLint rules enforce:
- **`translation/prefer-safe-translate`**: Prevents direct `t()` usage
- **`translation/translation-key-format`**: Enforces naming conventions

### 3. CI/CD Pipeline
GitHub Actions automatically:
- Validates all translation keys before merging
- Runs comprehensive translation usage checks
- Comments on PRs with validation results

### 4. Build-time Validation
The build process includes:
- Translation key existence validation
- Usage pattern verification
- Orphaned key detection

## 📝 Translation Key Naming Conventions

### Required Prefixes
All translation keys must start with one of these prefixes:

```
product.        - Product-related content
buttons.        - Button labels and actions
cart.           - Shopping cart functionality
checkout.       - Checkout process
auth.           - Authentication and login
account.        - User account management
admin.          - Admin panel content
common.         - Common UI elements
errors.         - Error messages
success.        - Success messages
navigation.     - Navigation elements
search.         - Search functionality
filters.        - Filter options
reviews.        - Product reviews
orders.         - Order management
payment.        - Payment processing
delivery.       - Delivery and shipping
promotions.     - Promotional content
loyalty.        - Loyalty program
affiliate.      - Affiliate system
business.       - Business features
help.           - Help and support
legal.          - Legal pages and terms
```

### Naming Format
- Use camelCase for key segments after the prefix
- Keep keys descriptive but concise
- Use nested objects for related keys

**Good Examples:**
```javascript
'product.itemsPrice'
'buttons.addToCart'
'errors.productNotFound'
'product.resellerBenefits.volumeDiscounts'
```

**Bad Examples:**
```javascript
'ProductItemsPrice'        // Missing prefix
'product.items_price'      // Snake case
'product.price'            // Too generic
'btn.add'                  // Non-standard prefix
```

## 🛠 Development Workflow

### 1. Adding New Translation Keys

1. **Add to English file** (`src/locales/en/translation.json`):
   ```json
   {
     "product": {
       "newFeature": "New Feature Description"
     }
   }
   ```

2. **Add to Spanish file** (`src/locales/es/translation.json`):
   ```json
   {
     "product": {
       "newFeature": "Descripción de Nueva Característica"
     }
   }
   ```

3. **Use in component**:
   ```typescript
   import { safeTranslate } from '../../utils/translationValidator';
   
   // In component
   const { t } = useTranslation();
   return <span>{safeTranslate(t, 'product.newFeature')}</span>;
   ```

### 2. Validation Commands

Run these commands during development:

```bash
# Validate all translation keys
npm run validate:translations

# Check for proper safeTranslate usage
npm run lint:translations

# Run ESLint with translation rules
npm run lint
```

### 3. Required Keys Validation

Add new keys to validation in `src/utils/translationValidator.ts`:

```typescript
export const PRODUCT_DETAIL_REQUIRED_KEYS = [
  // ... existing keys
  'product.newFeature',  // Add your new key here
];
```

## 🚨 Error Prevention

### Common Issues and Solutions

1. **Missing Translation Key**
   - **Error**: Key returns itself instead of translated text
   - **Solution**: Add key to both language files
   - **Prevention**: Pre-commit hooks catch this

2. **Direct t() Usage**
   - **Error**: No fallback for missing keys
   - **Solution**: Use `safeTranslate(t, 'key')` instead
   - **Prevention**: ESLint rules prevent this

3. **Inconsistent Naming**
   - **Error**: Keys don't follow conventions
   - **Solution**: Follow naming guidelines above
   - **Prevention**: ESLint rules enforce format

4. **Orphaned Keys**
   - **Error**: Keys exist but aren't used
   - **Solution**: Remove unused keys or add usage
   - **Prevention**: Validation scripts detect this

## 🔍 Debugging Translation Issues

### Development Tools

1. **Browser Console Warnings**
   ```
   Missing translation key: "product.unknownKey"
   ```

2. **Validation Script Output**
   ```bash
   npm run validate:translations
   # Shows missing keys, orphaned keys, and usage statistics
   ```

3. **ESLint Integration**
   - VS Code shows real-time errors for translation issues
   - Automatic fixes available for some issues

### Fallback Behavior

When a translation key is missing, `safeTranslate()` provides:
1. **Development**: Console warning + formatted fallback
2. **Production**: Silent fallback without console spam
3. **Fallback format**: "Unknown Key" (formatted from key name)

## 📊 Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Weekly**: Review orphaned keys report
2. **Before releases**: Run full validation suite
3. **After major features**: Update required keys validation
4. **Quarterly**: Review and update naming conventions

### Metrics to Track

- Number of translation keys per language
- Orphaned key count
- Missing key incidents in production
- Translation coverage percentage

## 🚀 Future Enhancements

Planned improvements to the translation system:

1. **Auto-generation**: Generate keys from component usage
2. **Translation management UI**: Web interface for translators
3. **Pluralization support**: Handle singular/plural forms
4. **Context-aware translations**: Different translations for different contexts
5. **Translation memory**: Reuse similar translations

## 📞 Support

For translation-related issues:
1. Check this documentation first
2. Run validation commands to identify issues
3. Review console warnings in development
4. Check GitHub Actions for CI/CD failures

Remember: **Prevention is better than fixing!** The automated systems are designed to catch issues before they reach users.