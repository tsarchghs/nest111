# POS System for Cafes & Restaurants

A comprehensive Point of Sale system built with NestJS and React, designed for baristas and restaurant staff.

## Features

### Barista/Server Perspective
- **Table Management**: View and select tables with real-time status updates
- **Product Browsing**: Browse products by category with images
- **Order Management**: Add items to cart, adjust quantities, view totals
- **Real-time Calculations**: Automatic subtotal, tax (15%), and total calculations
- **Multiple Payment Methods**: Cash, Card, and Digital Wallet support
- **Split Bill**:
  - Split by person (even distribution)
  - Split by item (select specific items)
  - Custom amount split
- **Tip Management**: Quick tip percentages (5%, 10%, 15%, 20%) or custom amounts
- **Cash Handling**: Keypad for entering received amount with change calculation

## Technology Stack

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: Supabase (PostgreSQL)
- **API**: RESTful endpoints with CORS enabled

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Material Symbols

## Database Schema

- **categories**: Product categories
- **products**: Menu items with pricing and images
- **tables**: Restaurant tables with status
- **orders**: Customer orders with totals
- **order_items**: Individual line items
- **payments**: Payment records with split information

## Setup Instructions

### 1. Install Dependencies

Backend:
\`\`\`bash
npm install
\`\`\`

Frontend:
\`\`\`bash
cd client
npm install
\`\`\`

### 2. Database Setup

The database schema has been automatically created with:
- Sample categories (Coffee, Tea, Pastries, Breakfast, Lunch)
- Sample products with images
- Table configurations

### 3. Run the Application

Start Backend (Port 3000):
\`\`\`bash
npm run start:dev
\`\`\`

Start Frontend (Port 5173):
\`\`\`bash
cd client
npm run dev
\`\`\`

### 4. Access the Application

Open your browser to: http://localhost:5173

## API Endpoints

### Categories
- GET /categories - List all active categories
- GET /categories/:id - Get single category

### Products
- GET /products - List all products
- GET /products?categoryId=:id - List products by category
- GET /products/:id - Get single product

### Tables
- GET /tables - List all tables
- GET /tables/:id - Get single table
- PUT /tables/:id - Update table status

### Orders
- GET /orders - List all orders
- GET /orders?tableId=:id - List orders by table
- GET /orders/:id - Get single order
- POST /orders - Create new order
- PUT /orders/:id - Update order
- GET /orders/:id/items - Get order items
- POST /orders/:id/items - Add item to order
- PUT /orders/items/:itemId - Update order item quantity
- DELETE /orders/items/:itemId - Remove order item

### Payments
- POST /payments - Create payment
- GET /payments?orderId=:id - Get payments for order

## User Flow

1. **Select Table**: Barista selects a table from the main screen
2. **Browse Products**: Products are organized by categories
3. **Add to Cart**: Tap products to add them to the order
4. **View Cart**: Review order items with quantities and prices
5. **Checkout**: Proceed to payment screen
6. **Add Tip** (Optional): Select or enter custom tip amount
7. **Split Bill** (Optional):
   - Choose split method
   - Configure split parameters
8. **Select Payment Method**: Cash, Card, or Digital Wallet
9. **Complete Payment**: For cash, enter received amount and calculate change
10. **Finish**: Order marked as paid, table becomes available

## Key Features for Baristas

### Quick Operations
- Fast product selection with visual feedback
- One-tap quantity adjustments
- Real-time order totals
- Quick tip selection buttons

### Split Bill Options
- **By Person**: Evenly split between 2-5+ people
- **By Item**: Select specific items for partial payment
- **Custom Amount**: Enter any custom split amount

### Cash Handling
- Numeric keypad for easy input
- Automatic change calculation
- Exact amount button for quick entry

### Mobile Optimized
- Touch-friendly interface
- Bottom sheet modals for cart and actions
- Responsive design for tablets and phones

## Sample Data

The system comes pre-loaded with:
- 5 product categories
- 10 sample products with Pexels stock images
- 11 configured tables (various capacities)

## Security

- Row Level Security (RLS) enabled on all tables
- Service role policies for backend API access
- CORS enabled for frontend communication

## Development

### Backend Structure
\`\`\`
src/
├── categories/    # Category endpoints
├── products/      # Product endpoints
├── tables/        # Table management
├── orders/        # Order management
├── payments/      # Payment processing
└── supabase/      # Database client
\`\`\`

### Frontend Structure
\`\`\`
client/src/
├── api/           # API client functions
├── pages/         # Main page components
│   ├── TableSelection.tsx
│   ├── OrderView.tsx
│   └── CheckoutView.tsx
└── App.tsx        # Main app with routing
\`\`\`

## Building for Production

Backend:
\`\`\`bash
npm run build
npm run start:prod
\`\`\`

Frontend:
\`\`\`bash
cd client
npm run build
\`\`\`

The frontend build output will be in \`client/dist/\`.
