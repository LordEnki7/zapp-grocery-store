/**
 * Custom ESLint Rules for Translation Management
 * 
 * These rules enforce:
 * 1. Use of safeTranslate() instead of direct t() calls
 * 2. Proper import of safeTranslate when used
 * 3. Consistent translation key naming
 */

module.exports = {
  'prefer-safe-translate': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Enforce use of safeTranslate() instead of direct t() calls',
        category: 'Best Practices',
        recommended: true,
      },
      fixable: 'code',
      schema: [],
      messages: {
        preferSafeTranslate: 'Use safeTranslate(t, "{{key}}") instead of t("{{key}}") for better error handling',
        missingSafeTranslateImport: 'safeTranslate is used but not imported from translationValidator',
      },
    },
    create(context) {
      let hasSafeTranslateImport = false;
      let usesSafeTranslate = false;

      return {
        ImportDeclaration(node) {
          if (
            node.source.value === '../../utils/translationValidator' ||
            node.source.value === '../utils/translationValidator' ||
            node.source.value.endsWith('/translationValidator')
          ) {
            const safeTranslateSpecifier = node.specifiers.find(
              spec => spec.type === 'ImportSpecifier' && spec.imported.name === 'safeTranslate'
            );
            if (safeTranslateSpecifier) {
              hasSafeTranslateImport = true;
            }
          }
        },

        CallExpression(node) {
          // Check for direct t() calls
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 't' &&
            node.arguments.length > 0 &&
            node.arguments[0].type === 'Literal'
          ) {
            // Allow t() calls that are inside safeTranslate()
            let parent = node.parent;
            let isInsideSafeTranslate = false;
            
            while (parent) {
              if (
                parent.type === 'CallExpression' &&
                parent.callee.type === 'Identifier' &&
                parent.callee.name === 'safeTranslate'
              ) {
                isInsideSafeTranslate = true;
                break;
              }
              parent = parent.parent;
            }

            if (!isInsideSafeTranslate) {
              const key = node.arguments[0].value;
              context.report({
                node,
                messageId: 'preferSafeTranslate',
                data: { key },
                fix(fixer) {
                  return fixer.replaceText(node, `safeTranslate(t, "${key}")`);
                },
              });
            }
          }

          // Check for safeTranslate usage
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'safeTranslate'
          ) {
            usesSafeTranslate = true;
          }
        },

        'Program:exit'() {
          if (usesSafeTranslate && !hasSafeTranslateImport) {
            context.report({
              node: context.getSourceCode().ast,
              messageId: 'missingSafeTranslateImport',
            });
          }
        },
      };
    },
  },

  'translation-key-format': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Enforce consistent translation key naming conventions',
        category: 'Style',
        recommended: true,
      },
      schema: [],
      messages: {
        invalidKeyFormat: 'Translation key "{{key}}" should follow camelCase naming within sections (e.g., "product.itemsPrice")',
        missingKeyPrefix: 'Translation key "{{key}}" should have a proper prefix (e.g., "product.", "buttons.", "errors.")',
      },
    },
    create(context) {
      const validPrefixes = [
        'product.',
        'buttons.',
        'cart.',
        'checkout.',
        'auth.',
        'account.',
        'admin.',
        'common.',
        'errors.',
        'success.',
        'navigation.',
        'search.',
        'filters.',
        'reviews.',
        'orders.',
        'payment.',
        'delivery.',
        'promotions.',
        'loyalty.',
        'affiliate.',
        'business.',
        'help.',
        'legal.',
      ];

      function validateKeyFormat(key) {
        // Check if key has a valid prefix
        const hasValidPrefix = validPrefixes.some(prefix => key.startsWith(prefix));
        if (!hasValidPrefix) {
          return 'missingKeyPrefix';
        }

        // Check camelCase format after the prefix
        const parts = key.split('.');
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (!/^[a-z][a-zA-Z0-9]*$/.test(part)) {
            return 'invalidKeyFormat';
          }
        }

        return null;
      }

      return {
        CallExpression(node) {
          // Check safeTranslate calls
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'safeTranslate' &&
            node.arguments.length >= 2 &&
            node.arguments[1].type === 'Literal'
          ) {
            const key = node.arguments[1].value;
            const error = validateKeyFormat(key);
            
            if (error) {
              context.report({
                node: node.arguments[1],
                messageId: error,
                data: { key },
              });
            }
          }

          // Check direct t() calls (for legacy code)
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 't' &&
            node.arguments.length > 0 &&
            node.arguments[0].type === 'Literal'
          ) {
            const key = node.arguments[0].value;
            const error = validateKeyFormat(key);
            
            if (error) {
              context.report({
                node: node.arguments[0],
                messageId: error,
                data: { key },
              });
            }
          }
        },
      };
    },
  },
};