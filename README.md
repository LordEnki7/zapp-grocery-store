# ZAPP E-commerce Platform

ZAPP is an online grocery and hospitality goods store focusing on products from the Caribbean and Africa.

## Build Directions

For detailed implementation guidelines, please refer to the [BUILD_DIRECTIONS.md](BUILD_DIRECTIONS.md) document and the PDF files in the `docs/` directory.

We've implemented a structured approach to managing build directions:

1. Original PDF documents are stored in the `docs/` directory
2. Requirements have been extracted and are available in `docs/requirements/`
3. Use `npm run extract-requirements` to update extracted requirements from PDFs

## Retail Product Data

For information about the product data structure and management, please refer to the [RETAIL_PRODUCT_DATA.md](RETAIL_PRODUCT_DATA.md) document.

Key product data features:

1. Excel-based product data source files stored in `data/products/`
2. JSON product data generated for the application
3. Tools for uploading product data to Firebase
4. Use `npm run generate-product-data` to create product data files

## Features

- 🛍️ Browse over 40,000 products (grocery, frozen, hotel/hospitality)
- 🌍 Multilingual support (English + Spanish)
- 💰 ZAPP Points loyalty system (1 point = $1 spent, 100 pts = $1 credit)
- 💳 Stripe checkout for customers
- 🔥 Firestore for product, user, and order data
- 📊 Admin dashboard to manage products, orders, and analytics
- 🔐 Role-based authentication (admin, customer)
- 👥 Referral/affiliate code system

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Hosting, Functions)
- **Payment**: Stripe
- **State Management**: React Context
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Firebase account
- Stripe account

### Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/zapp-ecommerce.git
cd zapp-ecommerce
```

2. Install dependencies:
```
npm install
```

3. Create a `.env.local` file in the root directory with your Firebase and Stripe credentials:
```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

4. Start the development server:
```
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
/src
  /assets         # Static assets
  /components     # Reusable UI components
  /context        # React Context providers
  /hooks          # Custom React hooks
  /locales        # Internationalization files
  /pages          # Application pages
  /services       # Firebase and other services
  /utils          # Utility functions
```

## Admin Dashboard

The admin dashboard is accessible at `/admin` and provides the following functionality:

- Product management (upload CSV, add/edit/delete)
- Order management
- User management
- Analytics

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage
3. Set up Authentication with Email/Password provider
4. Create security rules for Firestore and Storage

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```
npm install -g firebase-tools
```

2. Login to Firebase:
```
firebase login
```

3. Initialize Firebase:
```
firebase init
```

4. Build the project:
```
npm run build
```

5. Deploy to Firebase:
```
firebase deploy
```

## Code Safety Policy

We follow strict guidelines to ensure code quality and maintainability. See [CODE_SAFETY_POLICY.md](CODE_SAFETY_POLICY.md) for details on:

- Backup procedures (ZIP archives at key milestones)
- Modular architecture guidelines
- Version control best practices

### Development Scripts

```bash
# Create a backup at a development milestone
npm run backup milestone-name

# Create a backup before building
npm run backup:pre-build

# Analyze code architecture for violations
npm run analyze

# Scaffold a new feature with proper architecture
npm run create-feature feature-name
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Read the [CODE_SAFETY_POLICY.md](CODE_SAFETY_POLICY.md) document
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Use `npm run create-feature your-feature` to scaffold your feature
4. Make your changes following the modular architecture
5. Run `npm run analyze` to verify architecture compliance
6. Create a backup: `npm run backup your-feature`
7. Submit a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
