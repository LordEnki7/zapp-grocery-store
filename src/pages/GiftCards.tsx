import React, { useState, useEffect } from 'react';
import { FaGift, FaCreditCard, FaEnvelope, FaPhone, FaPrint, FaDownload, FaHeart, FaStar, FaGamepad, FaUtensils, FaShoppingBag, FaFilm, FaMusic, FaSpa, FaPlane, FaGraduationCap, FaBaby, FaHome, FaCar, FaPaw, FaSearch, FaCalendarAlt, FaUser, FaCheck, FaFilter } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import type { Product } from '../services/productService';
import type { GiftCard } from '../types/giftCard';
import { getProductsByCategory } from '../services/productService';
import ProductImage from '../components/products/ProductImage';

interface PurchaseDetails {
  cardId: string;
  amount: number;
  quantity: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  deliveryMethod: 'email' | 'sms' | 'print';
  deliveryDate?: string;
}

const GiftCards: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<Partial<PurchaseDetails>>({
    amount: 25,
    quantity: 1,
    deliveryMethod: 'email'
  });
  const { addToCart } = useCart();

  // Load gift cards from productService
  useEffect(() => {
    const loadGiftCards = async () => {
      try {
        setLoading(true);
        const products = await getProductsByCategory('gift-cards');
        // Transform products to GiftCard type
        const transformedGiftCards: GiftCard[] = products.map(product => {
          return {
            id: product.id,
            name: product.name,
            brand: product.brand || 'Generic',
            category: product.category,
            description: product.description,
            primaryImage: product.primaryImage,
            images: product.images,
            image: product.image,
          denominations: product.denominations || [25, 50, 100],
          customAmount: product.customAmount,
          minAmount: product.minAmount,
          maxAmount: product.maxAmount,
          isPopular: product.isPopular,
          discount: product.discount,
          averageRating: product.averageRating || product.rating,
          rating: product.rating,
          reviewCount: product.reviewCount || 0,
          expirationPolicy: product.expirationPolicy,
          termsAndConditions: product.termsAndConditions,
          availableDeliveryMethods: product.availableDeliveryMethods || ['email'],
          processingTime: product.processingTime,
          restrictions: product.restrictions,
          tags: product.tags,
          isActive: product.isActive !== false,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        };
      });
        setGiftCards(transformedGiftCards);
      } catch (error) {
        console.error('Error loading gift cards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGiftCards();
  }, []);

  // Handle add to cart for gift cards
  const handleAddToCart = (giftCard: Product, amount: number = 25) => {
    // Create a gift card product with the selected amount
    const giftCardProduct: Product = {
      ...giftCard,
      id: `${giftCard.id}-${amount}`,
      name: `${giftCard.name} - $${amount}`,
      price: amount,
      salePrice: amount,
      image: giftCard.primaryImage || giftCard.images?.[0] || giftCard.image || '/images/placeholder.jpg',
      category: 'gift-cards',
      inStock: true,
      stockQuantity: 999,
      description: `${giftCard.description} - $${amount} value`,
      brand: giftCard.brand || 'Gift Card',
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      tags: [...(giftCard.tags || []), 'gift-card'],
      volumeDiscounts: [],
      relatedProducts: [],
      variants: []
    };

    addToCart(giftCardProduct, 1);
  };

  const getFilteredCards = () => {
    return giftCards.filter(card => {
      return (
        searchQuery === '' ||
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ) && (
        selectedCategory === 'all' ||
        card.category === selectedCategory ||
        card.tags?.includes(selectedCategory)
      );
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} text-sm`}
      />
    ));
  };

  const handlePurchase = (card: GiftCard) => {
    setSelectedCard(card);
    setPurchaseDetails({
      cardId: card.id,
      amount: card.denominations?.[0] || 25,
      quantity: 1,
      deliveryMethod: 'email'
    });
    setShowPurchaseModal(true);
  };

  const handlePurchaseSubmit = () => {
    if (selectedCard && purchaseDetails.amount) {
      // Add to cart with the selected amount and quantity
      for (let i = 0; i < (purchaseDetails.quantity || 1); i++) {
        handleAddToCart(selectedCard, purchaseDetails.amount);
      }
      
      setPurchaseDetails({
        amount: 25,
        quantity: 1,
        deliveryMethod: 'email'
      });
      setShowPurchaseModal(false);
      setSelectedCard(null);
    }
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: FaGift },
    { id: 'retail', name: 'Retail & Shopping', icon: FaShoppingBag },
    { id: 'dining', name: 'Dining & Food', icon: FaUtensils },
    { id: 'entertainment', name: 'Entertainment', icon: FaFilm },
    { id: 'gaming', name: 'Gaming', icon: FaGamepad },
    { id: 'music', name: 'Music & Streaming', icon: FaMusic },
    { id: 'wellness', name: 'Health & Wellness', icon: FaSpa },
    { id: 'travel', name: 'Travel & Hotels', icon: FaPlane },
    { id: 'education', name: 'Education', icon: FaGraduationCap },
    { id: 'baby', name: 'Baby & Kids', icon: FaBaby },
    { id: 'home', name: 'Home & Garden', icon: FaHome },
    { id: 'automotive', name: 'Automotive', icon: FaCar },
    { id: 'pets', name: 'Pets', icon: FaPaw }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FaGift className="text-6xl mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Gift Cards</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Give the perfect gift with our wide selection of digital gift cards from your favorite brands
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search gift cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                <category.icon className="text-sm" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading gift cards...</p>
          </div>
        ) : (
          <>
            {/* Featured Cards */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Gift Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {giftCards.filter(card => card.isPopular).map((card) => (
                  <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        <img
                          src={(() => {
                            // Use the same direct image path approach as working pages
                            let imagePath = card.primaryImage || card.images?.[0] || card.image;
                            
                            // If the image path doesn't start with /images/, ensure it's properly formatted
                            if (imagePath && !imagePath.startsWith('/images/')) {
                              imagePath = `/images/${imagePath}`;
                            }
                            
                            // Fallback to placeholder if no image path
                            if (!imagePath) {
                              imagePath = '/images/product-placeholder.svg';
                            }
                            
                            return imagePath;
                          })()} 
                          alt={card.name}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/product-placeholder.svg';
                          }}
                        />
                      </div>
                      
                      {/* Featured Badge */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          FEATURED
                        </div>
                      </div>

                      {/* Discount Badge */}
                      {card.discount && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {card.discount}% OFF
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{card.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>

                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {renderStars(card.averageRating || card.rating || 0)}
                        </div>
                        <span className="text-xs text-gray-600">({card.reviewCount || 0})</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {card.denominations.slice(0, 4).map((amount: number) => (
                          <span key={amount} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            ${amount}
                          </span>
                        ))}
                        {card.customAmount && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            Custom Amount
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handlePurchase(card)}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Gift Cards */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Gift Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredCards().map((card) => (
                  <div key={card.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        <img
                          src={(() => {
                            // Use the same direct image path approach as working pages
                            let imagePath = card.primaryImage || card.images?.[0] || card.image;
                            
                            // If the image path doesn't start with /images/, ensure it's properly formatted
                            if (imagePath && !imagePath.startsWith('/images/')) {
                              imagePath = `/images/${imagePath}`;
                            }
                            
                            // Fallback to placeholder if no image path
                            if (!imagePath) {
                              imagePath = '/images/product-placeholder.svg';
                            }
                            
                            return imagePath;
                          })()} 
                          alt={card.name}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/product-placeholder.svg';
                          }}
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        {card.isPopular && (
                          <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            POPULAR
                          </div>
                        )}
                        {card.discount && (
                          <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {card.discount}% OFF
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{card.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>

                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          {renderStars(card.averageRating || card.rating || 0)}
                        </div>
                        <span className="text-xs text-gray-600">({card.reviewCount || 0})</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {card.denominations.slice(0, 3).map((amount: number) => (
                          <span key={amount} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            ${amount}
                          </span>
                        ))}
                        {card.denominations.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{card.denominations.length - 3} more
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handlePurchase(card)}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Buy Gift Card
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Purchase Modal */}
        {showPurchaseModal && selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Purchase Gift Card</h2>
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Card Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={(() => {
                        // Use the same direct image path approach as working pages
                        let imagePath = selectedCard.primaryImage || selectedCard.images?.[0] || selectedCard.image;
                        
                        // If the image path doesn't start with /images/, ensure it's properly formatted
                        if (imagePath && !imagePath.startsWith('/images/')) {
                          imagePath = `/images/${imagePath}`;
                        }
                        
                        // Fallback to placeholder if no image path
                        if (!imagePath) {
                          imagePath = '/images/product-placeholder.svg';
                        }
                        
                        return imagePath;
                      })()} 
                      alt={selectedCard.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/product-placeholder.svg';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold">{selectedCard.name}</h3>
                      <p className="text-sm text-gray-600">{selectedCard.description}</p>
                    </div>
                  </div>
                </div>

                {/* Purchase Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedCard.denominations.map((amount: number) => (
                        <button
                          key={amount}
                          onClick={() => setPurchaseDetails(prev => ({ ...prev, amount }))}
                          className={`p-2 border rounded text-sm font-medium ${
                            purchaseDetails.amount === amount
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                    {selectedCard.customAmount && (
                      <div className="mt-2">
                        <input
                          type="number"
                          placeholder="Custom amount"
                          min="5"
                          max="500"
                          value={purchaseDetails.amount || ''}
                          onChange={(e) => setPurchaseDetails(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={purchaseDetails.quantity || 1}
                      onChange={(e) => setPurchaseDetails(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePurchaseSubmit}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose Our Gift Cards?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCreditCard className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Delivery</h3>
              <p className="text-gray-600">Get your gift cards delivered instantly via email or SMS</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Expiration</h3>
              <p className="text-gray-600">Our gift cards never expire and have no hidden fees</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Choose from hundreds of popular brands and retailers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCards;