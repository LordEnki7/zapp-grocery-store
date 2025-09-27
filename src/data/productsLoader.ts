// Dynamic products loader to avoid build-time JSON parsing issues
export const loadProductsData = async () => {
  try {
    // Use dynamic import to load products at runtime instead of build time
    const response = await fetch('/data/products/products.json');
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.status}`);
    }
    const productsData = await response.json();
    return productsData;
  } catch (error) {
    console.error('Error loading products data:', error);
    // Return empty array as fallback
    return [];
  }
};

export default loadProductsData;