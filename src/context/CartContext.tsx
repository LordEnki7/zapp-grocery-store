import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '../services/productService';
import { InputSanitizer } from '../utils/security';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
  selectedVariant?: string;
  notes?: string;
}

interface CartSavings {
  productId: string;
  productName: string;
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  discountPercentage: number;
}

interface CartTotals {
  subtotal: number;
  discountedSubtotal: number;
  totalSavings: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: string, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  itemCount: number;
  totals: CartTotals;
  itemSavings: CartSavings[];
  isLoading: boolean;
  error: string | null;
  // Bulk operations
  addMultipleToCart: (items: Array<{product: Product, quantity: number, variant?: string}>) => void;
  removeMultipleFromCart: (productIds: string[]) => void;
  // Cart persistence
  saveCartToCloud: () => Promise<void>;
  loadCartFromCloud: () => Promise<void>;
  // Cart validation
  validateCart: () => Promise<{isValid: boolean, issues: string[]}>;
}

// Default context value
const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  updateItemNotes: () => {},
  clearCart: () => {},
  itemCount: 0,
  totals: {
    subtotal: 0,
    discountedSubtotal: 0,
    totalSavings: 0,
    tax: 0,
    shipping: 0,
    total: 0
  },
  itemSavings: [],
  isLoading: false,
  error: null,
  addMultipleToCart: () => {},
  removeMultipleFromCart: () => {},
  saveCartToCloud: async () => {},
  loadCartFromCloud: async () => {},
  validateCart: async () => ({isValid: true, issues: []})
});

// Custom hook to use cart context
export const useCart = () => useContext(CartContext);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Get user profile for business discounts
  const { userProfile } = useAuth();
  
  // State management
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('zappCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt strings back to Date objects
        return parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('zappCart', JSON.stringify(items));
      console.log('Cart saved to localStorage:', items);
      console.log('Cart item count:', items.length);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      setError('Failed to save cart locally');
    }
  }, [items]);
  
  // Enhanced add to cart function
  const addToCart = useCallback((product: Product, quantity: number = 1, variant?: string, notes?: string) => {
    try {
      console.log('Adding to cart:', product.name, 'quantity:', quantity);
      
      // Sanitize inputs
      const sanitizedNotes = notes ? InputSanitizer.sanitizeText(notes) : undefined;
      const sanitizedVariant = variant ? InputSanitizer.sanitizeText(variant) : undefined;
      
      if (quantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }
      
      if (quantity > product.stock) {
        setError(`Only ${product.stock} items available in stock`);
        return;
      }
      
      setItems(prevItems => {
        console.log('Previous cart items:', prevItems);
        
        // Check if item already exists in cart (considering variant)
        const existingItemIndex = prevItems.findIndex(
          item => item.product.id === product.id && item.selectedVariant === sanitizedVariant
        );
        
        if (existingItemIndex >= 0) {
          console.log('Item exists, updating quantity');
          // Update quantity if item exists
          const updatedItems = [...prevItems];
          const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
          
          if (newQuantity > product.stock) {
            setError(`Cannot add more items. Only ${product.stock} available in stock`);
            return prevItems;
          }
          
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: newQuantity,
            notes: sanitizedNotes || updatedItems[existingItemIndex].notes
          };
          console.log('Updated cart items:', updatedItems);
          return updatedItems;
        } else {
          console.log('Adding new item to cart');
          // Add new item if it doesn't exist
          const newItem: CartItem = {
            product,
            quantity,
            addedAt: new Date(),
            selectedVariant: sanitizedVariant,
            notes: sanitizedNotes
          };
          const newItems = [...prevItems, newItem];
          console.log('New cart items:', newItems);
          return newItems;
        }
      });
      
      setError(null);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
    }
  }, []);
  
  // Remove a product from the cart
  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => 
      prevItems.filter(item => item.product.id !== productId)
    );
    setError(null);
  }, []);
  
  // Update quantity of a product in the cart
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            setError(`Only ${item.product.stock} items available in stock`);
            return item;
          }
          setError(null);
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);
  
  // Update item notes
  const updateItemNotes = useCallback((productId: string, notes: string) => {
    const sanitizedNotes = InputSanitizer.sanitizeText(notes);
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.product.id === productId
          ? { ...item, notes: sanitizedNotes }
          : item
      )
    );
  }, []);
  
  // Clear the entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);
  
  // Bulk add to cart
  const addMultipleToCart = useCallback((itemsToAdd: Array<{product: Product, quantity: number, variant?: string}>) => {
    try {
      setIsLoading(true);
      
      itemsToAdd.forEach(({ product, quantity, variant }) => {
        addToCart(product, quantity, variant);
      });
    } catch (err) {
      console.error('Error adding multiple items to cart:', err);
      setError('Failed to add items to cart');
    } finally {
      setIsLoading(false);
    }
  }, [addToCart]);
  
  // Bulk remove from cart
  const removeMultipleFromCart = useCallback((productIds: string[]) => {
    setItems(prevItems => 
      prevItems.filter(item => !productIds.includes(item.product.id))
    );
    setError(null);
  }, []);
  
  // Save cart to cloud (Firebase)
  const saveCartToCloud = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implementation would depend on user authentication
      // For now, just simulate the operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Cart saved to cloud');
    } catch (err) {
      console.error('Error saving cart to cloud:', err);
      setError('Failed to save cart to cloud');
    } finally {
      setIsLoading(false);
    }
  }, [items]);
  
  // Load cart from cloud (Firebase)
  const loadCartFromCloud = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implementation would depend on user authentication
      // For now, just simulate the operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Cart loaded from cloud');
    } catch (err) {
      console.error('Error loading cart from cloud:', err);
      setError('Failed to load cart from cloud');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Validate cart items (check stock, prices, etc.)
  const validateCart = useCallback(async (): Promise<{isValid: boolean, issues: string[]}> => {
    try {
      const issues: string[] = [];
      
      for (const item of items) {
        // Check if product is still available
        if (!item.product.isActive) {
          issues.push(`${item.product.name} is no longer available`);
        }
        
        // Check stock availability
        if (item.quantity > item.product.stock) {
          issues.push(`${item.product.name}: Only ${item.product.stock} items available (you have ${item.quantity})`);
        }
        
        // Check if product is in stock
        if (!item.product.inStock) {
          issues.push(`${item.product.name} is out of stock`);
        }
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    } catch (err) {
      console.error('Error validating cart:', err);
      return {
        isValid: false,
        issues: ['Failed to validate cart']
      };
    }
  }, [items]);
  
  // Calculate total number of items in cart
  const itemCount = items.reduce(
    (total, item) => total + item.quantity, 
    0
  );
  
  // Calculate savings from volume discounts
  const itemSavings = items.map(item => {
    const { product, quantity } = item;
    const originalPrice = product.price * quantity;
    
    // Check for volume discounts
    let discountPercentage = 0;
    if (product.volumeDiscounts) {
      // Sort discounts in descending order by quantity to get the best discount
      const applicableDiscounts = [...product.volumeDiscounts]
        .sort((a, b) => b.quantity - a.quantity)
        .filter(discount => quantity >= discount.quantity);
      
      // Apply the highest applicable discount
      if (applicableDiscounts.length > 0) {
        discountPercentage = applicableDiscounts[0].discountPercentage;
      }
    }
    
    // Check for business account additional volume discounts
    if (userProfile?.accountType === 'business' && userProfile.businessProfile?.volumeDiscounts) {
      const businessDiscounts = userProfile.businessProfile.volumeDiscounts
        .filter(discount => 
          (!discount.productIds || discount.productIds.includes(product.id)) &&
          (!discount.categoryIds || discount.categoryIds.includes(product.category)) &&
          quantity >= discount.minQuantity
        )
        .sort((a, b) => b.discountPercentage - a.discountPercentage);
      
      if (businessDiscounts.length > 0) {
        // Apply the better discount (business or product-level)
        discountPercentage = Math.max(discountPercentage, businessDiscounts[0].discountPercentage);
      }
    }
    
    const savings = originalPrice * (discountPercentage / 100);
    const discountedPrice = originalPrice - savings;
    
    return {
      productId: product.id,
      productName: product.name,
      originalPrice,
      discountedPrice,
      savings,
      discountPercentage
    };
  });
  
  // Calculate comprehensive totals
  const totals = React.useMemo((): CartTotals => {
    // Calculate subtotal price of all items in cart (before discounts)
    const subtotal = items.reduce(
      (total, item) => total + (item.product.price * item.quantity), 
      0
    );
    
    // Calculate total savings
    const totalSavings = itemSavings.reduce(
      (total, item) => total + item.savings, 
      0
    );
    
    // Calculate discounted subtotal
    const discountedSubtotal = subtotal - totalSavings;
    
    // Calculate tax (8.5% for example - this should be configurable)
    // Business accounts with tax exemption get 0% tax
    let taxRate = 0.085;
    if (userProfile?.accountType === 'business' && 
        userProfile.businessProfile?.taxExemption?.isExempt) {
      taxRate = 0;
    }
    const tax = discountedSubtotal * taxRate;
    
    // Calculate shipping (free shipping over $50, otherwise $5.99)
    // Business accounts might have different shipping terms
    let shippingThreshold = 50;
    let shippingCost = 5.99;
    
    if (userProfile?.accountType === 'business' && userProfile.businessProfile?.paymentTerms) {
      // Business accounts might have free shipping or different thresholds
      shippingThreshold = 25; // Lower threshold for business accounts
    }
    
    const shipping = discountedSubtotal >= shippingThreshold ? 0 : shippingCost;
    
    // Calculate final total
    const total = discountedSubtotal + tax + shipping;
    
    return {
      subtotal,
      discountedSubtotal,
      totalSavings,
      tax,
      shipping,
      total
    };
  }, [items, itemSavings, userProfile]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemNotes,
    clearCart,
    itemCount,
    totals,
    itemSavings,
    isLoading,
    error,
    addMultipleToCart,
    removeMultipleFromCart,
    saveCartToCloud,
    loadCartFromCloud,
    validateCart
  }), [
    items, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    updateItemNotes,
    clearCart, 
    itemCount, 
    totals, 
    itemSavings,
    isLoading,
    error,
    addMultipleToCart,
    removeMultipleFromCart,
    saveCartToCloud,
    loadCartFromCloud,
    validateCart
  ]);
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};