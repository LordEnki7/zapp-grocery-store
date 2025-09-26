# ZAPP Product Data

This directory contains product data for the ZAPP e-commerce platform.

## Files

- `products.json`: Complete product database with all products
- `categories.json`: Product categories
- `featured-products.json`: Featured products for homepage
- `products-{category}.json`: Products filtered by category

## Data Structure

Each product has the following structure:

```json
{
  "id": "GRO-001",
  "name": "Jamaica Rice",
  "description": "Authentic Jamaican rice product.",
  "price": 4.99,
  "currency": "USD",
  "weight": 16,
  "weightUnit": "oz",
  "category": "grocery",
  "origin": "Jamaica",
  "image": "grocery-1.jpg",
  "stock": 100,
  "featured": true,
  "nutrition": {
    "calories": 150,
    "protein": 3,
    "carbs": 30,
    "fat": 0
  }
}
```

## Usage

To regenerate this data from the Excel files, run:

```
npm run generate-product-data
```

Note: In the current implementation, this generates mock data since direct Excel parsing is not implemented.
