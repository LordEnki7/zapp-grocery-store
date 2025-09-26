import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiArrowRight, FiShoppingBag, FiEdit3, FiCheck, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../services/productService';

const Cart: React.FC = () => {
  const { t } = useTranslation();
  const { 
    items, 
    removeFromCart, 
    updateQuantity,
    updateItemNotes,
    totals,
    itemSavings,
    isLoading,
    error,
    validateCart,
    removeMultipleFromCart
  } = useCart();

  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<{isValid: boolean, issues: string[]} | null>(null);

  // Validate cart on component mount and when items change
  useEffect(() => {
    // Alert to verify updated code is loading
    console.log('CART DEBUG: Updated cart component loaded!');
    
    const validate = async () => {
      const result = await validateCart();
      setValidationResult(result);
    };
    
    if (items.length > 0) {
      validate();
    }
  }, [items, validateCart]);

  // Points to be earned (1 point per dollar spent)
  const pointsToEarn = Math.floor(totals.discountedSubtotal);

  const handleEditNotes = (productId: string, currentNotes?: string) => {
    setEditingNotes(productId);
    setNoteText(currentNotes || '');
  };

  const handleSaveNotes = (productId: string) => {
    updateItemNotes(productId, noteText);
    setEditingNotes(null);
    setNoteText('');
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNoteText('');
  };

  const handleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.product.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length > 0) {
      removeMultipleFromCart(selectedItems);
      setSelectedItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
          {items.length > 0 && (
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-sm hover:bg-gray-100"
              >
                {selectedItems.length === items.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  Remove Selected ({selectedItems.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Validation Issues */}
        {validationResult && !validationResult.isValid && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <FiAlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-800">Cart Issues</h3>
            </div>
            <ul className="list-disc list-inside text-sm text-yellow-700">
              {validationResult.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <FiRefreshCw className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
              <span className="text-blue-800">Updating cart...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Your Items ({items.length})</h2>
                </div>
                <ul className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const { product, quantity, addedAt, selectedVariant, notes } = item;
                    const itemTotal = product.price * quantity;
                    const itemSaving = itemSavings.find(s => s.productId === product.id);
                    const hasDiscount = itemSaving && itemSaving.discountPercentage > 0;
                    const isSelected = selectedItems.includes(product.id);
                    
                    return (
                      <li key={`${product.id}-${selectedVariant || 'default'}`} className={`p-6 transition-colors duration-200 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-start gap-4">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(product.id)}
                            className="mt-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          
                          <div className="w-24 h-24 overflow-hidden rounded-lg flex-shrink-0 shadow-md bg-gray-100">
                            <img 
                              src={(() => {
                                const imageSrc = product.images?.[0] || product.primaryImage || `/images/products/${product.image}` || '/images/product-placeholder.svg';
                                console.log('Cart item debug:', {
                                  productName: product.name,
                                  images: product.images,
                                  primaryImage: product.primaryImage,
                                  image: product.image,
                                  finalSrc: imageSrc
                                });
                                return imageSrc;
                              })()} 
                              alt={product.name} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.log('Image failed to load:', target.src, 'for product:', product.name);
                                if (target.src !== '/images/product-placeholder.svg') {
                                  target.src = '/images/product-placeholder.svg';
                                }
                              }}
                              loading="lazy"
                            />
                          </div>
                        
                          <div className="flex-grow">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 hover:text-green-600 transition-colors duration-200 text-lg">
                                  {product.name}
                                </Link>
                                {selectedVariant && (
                                  <p className="text-sm text-gray-600 mt-1 font-medium">Variant: {selectedVariant}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">{product.category}</span>
                                  <span className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">{product.origin}</span>
                                  <span className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">{product.weight}</span>
                                </div>
                                
                                {/* Added date */}
                                <p className="text-xs text-gray-500 mt-2 flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                  Added: {addedAt.toLocaleDateString()}
                                </p>
                              </div>
                              
                              {/* Remove button */}
                              <button
                                onClick={() => removeFromCart(product.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                aria-label="Remove item"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          
                            {/* Price display with discount */}
                            <div className="mt-2">
                              {hasDiscount ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(itemSaving.discountedPrice, product.currency)}
                                  </span>
                                  <span className="text-sm line-through text-gray-500">
                                    {formatCurrency(itemTotal, product.currency)}
                                  </span>
                                  <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">
                                    {itemSaving.discountPercentage}% OFF
                                  </span>
                                </div>
                              ) : (
                                <span className="font-semibold">
                                  {formatCurrency(itemTotal, product.currency)}
                                </span>
                              )}
                            </div>
                          
                            {/* Quantity controls */}
                            <div className="flex items-center justify-between mt-6">
                              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                <button 
                                  className="px-4 py-2 border-r-2 border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  disabled={quantity <= 1}
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="px-6 py-2 min-w-[4rem] text-center font-semibold text-gray-800 bg-gray-50">{quantity}</span>
                                <button 
                                  className="px-4 py-2 border-l-2 border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  disabled={quantity >= product.stock}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              
                              {/* Stock indicator */}
                              <div className="flex items-center text-sm">
                                <div className={`w-2 h-2 rounded-full mr-2 ${product.stock > 10 ? 'bg-green-400' : product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                                <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {product.stock} in stock
                                </span>
                              </div>
                            </div>
                          
                            {/* Notes section */}
                            <div className="mt-3">
                              {editingNotes === product.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add a note for this item..."
                                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    maxLength={200}
                                  />
                                  <button
                                    onClick={() => handleSaveNotes(product.id)}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    <FiCheck className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {notes ? (
                                    <p className="text-sm text-gray-600 italic flex-1">"{notes}"</p>
                                  ) : (
                                    <p className="text-sm text-gray-400 flex-1">No notes</p>
                                  )}
                                  <button
                                    onClick={() => handleEditNotes(product.id, notes)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <FiEdit3 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-8 sticky top-4 border border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 -mx-8 -mt-8 px-8 py-6 mb-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">{t('cart.orderSummary')}</h2>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  
                  {totals.totalSavings > 0 && (
                    <div className="flex justify-between items-center py-2 bg-green-50 -mx-4 px-4 rounded-lg">
                      <span className="text-green-700 font-medium">{t('cart.savings')}</span>
                      <span className="font-bold text-green-700">-{formatCurrency(totals.totalSavings)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{t('cart.tax')}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totals.tax)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{t('cart.shipping')}</span>
                    <span className={`font-semibold ${totals.shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}
                    </span>
                  </div>
                  
                  <hr className="my-4 border-gray-200" />
                  
                  <div className="flex justify-between items-center py-3 bg-green-50 -mx-4 px-4 rounded-lg">
                    <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                    <span className="text-xl font-bold text-green-600">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
                
                {/* Points to earn */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg mb-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-800">Points to earn:</span>
                    </div>
                    <span className="font-bold text-yellow-800 text-lg">{pointsToEarn}</span>
                  </div>
                </div>
                
                {/* Free shipping indicator */}
                {totals.shipping > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-200">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm font-medium text-blue-800">
                        Add {formatCurrency(50 - totals.discountedSubtotal)} more for free shipping!
                      </p>
                    </div>
                  </div>
                )}
                
                <Button 
                  className="w-full mb-4 py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => window.location.href = '/checkout'}
                >
                  <FiArrowRight className="w-5 h-5 mr-2" />
                  {t('cart.proceedToCheckout')}
                </Button>
                
                <Link to="/products">
                  <Button 
                    variant="outline" 
                    className="w-full py-3 text-base font-medium border-2 border-gray-300 hover:border-green-500 hover:text-green-600 transition-all duration-200"
                  >
                    <FiArrowLeft className="w-5 h-5 mr-2" />
                    {t('cart.continueShopping')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Empty cart state
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <FiShoppingBag className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-3">{t('cart.empty')}</h2>
              <p className="text-gray-500 mb-8 text-lg leading-relaxed">Discover our amazing selection of Caribbean and African groceries</p>
              <Link to="/products">
                <Button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200">
                  <FiShoppingBag className="w-5 h-5 mr-2" />
                  {t('cart.continueShopping')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;