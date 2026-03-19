/*
  # POS System Schema for Cafes/Restaurants

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `sort_order` (integer)
      - `active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `products`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tables`
      - `id` (uuid, primary key)
      - `table_number` (text)
      - `capacity` (integer)
      - `status` (text, default 'available')
      - `current_guests` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (uuid, primary key)
      - `table_id` (uuid, foreign key)
      - `order_number` (text)
      - `status` (text, default 'open')
      - `subtotal` (decimal, default 0)
      - `tax` (decimal, default 0)
      - `tip` (decimal, default 0)
      - `total` (decimal, default 0)
      - `server_name` (text)
      - `guest_count` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `unit_price` (decimal)
      - `total_price` (decimal)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `payments`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `payment_method` (text)
      - `amount` (decimal)
      - `status` (text, default 'pending')
      - `split_info` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for service role access
    - All tables are accessible for authenticated API requests

  3. Important Notes
    - Tax rate is calculated as 15% for demo purposes
    - Order statuses: 'open', 'paid', 'cancelled'
    - Table statuses: 'available', 'occupied', 'reserved'
    - Payment methods: 'cash', 'card', 'digital_wallet'
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  sort_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10, 2) NOT NULL,
  image_url text DEFAULT '',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tables table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number text UNIQUE NOT NULL,
  capacity integer DEFAULT 4,
  status text DEFAULT 'available',
  current_guests integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text DEFAULT 'open',
  subtotal decimal(10, 2) DEFAULT 0,
  tax decimal(10, 2) DEFAULT 0,
  tip decimal(10, 2) DEFAULT 0,
  total decimal(10, 2) DEFAULT 0,
  server_name text DEFAULT '',
  guest_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  payment_method text NOT NULL,
  amount decimal(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  split_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (backend API)
CREATE POLICY "Service role full access to categories"
  ON categories FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to tables"
  ON tables FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to order_items"
  ON order_items FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to payments"
  ON payments FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample categories
INSERT INTO categories (name, description, sort_order) VALUES
  ('Coffee', 'Hot and cold coffee beverages', 1),
  ('Tea', 'Various tea selections', 2),
  ('Pastries', 'Fresh baked goods', 3),
  ('Breakfast', 'Morning favorites', 4),
  ('Lunch', 'Midday meals', 5)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, description, price, image_url) 
SELECT 
  c.id,
  p.name,
  p.description,
  p.price,
  p.image_url
FROM (
  SELECT 'Coffee' as category, 'Espresso' as name, 'Rich and bold' as description, 3.50 as price, 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400' as image_url
  UNION ALL SELECT 'Coffee', 'Cappuccino', 'Classic Italian coffee', 4.50, 'https://images.pexels.com/photos/6802983/pexels-photo-6802983.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Coffee', 'Caffè Latte', 'Smooth and creamy', 4.75, 'https://images.pexels.com/photos/1475035/pexels-photo-1475035.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Coffee', 'Americano', 'Bold espresso with water', 3.25, 'https://images.pexels.com/photos/4109998/pexels-photo-4109998.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Coffee', 'Mocha', 'Chocolate espresso', 5.25, 'https://images.pexels.com/photos/890577/pexels-photo-890577.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Pastries', 'Butter Croissant', 'Flaky and buttery', 3.75, 'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Pastries', 'Chocolate Muffin', 'Rich chocolate', 4.25, 'https://images.pexels.com/photos/2092897/pexels-photo-2092897.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Breakfast', 'Avocado Toast', 'Sourdough with fresh avocado', 8.50, 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Lunch', 'Caesar Salad', 'Classic Caesar with dressing', 14.00, 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400'
  UNION ALL SELECT 'Lunch', 'Wagyu Burger', 'Premium beef burger', 24.00, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400'
) p
CROSS JOIN categories c
WHERE c.name = p.category
ON CONFLICT DO NOTHING;

-- Insert sample tables
INSERT INTO tables (table_number, capacity, status) VALUES
  ('1', 2, 'available'),
  ('2', 2, 'available'),
  ('3', 4, 'available'),
  ('4', 4, 'available'),
  ('5', 4, 'available'),
  ('6', 6, 'available'),
  ('7', 6, 'available'),
  ('8', 8, 'available'),
  ('10', 4, 'available'),
  ('11', 4, 'available'),
  ('12', 4, 'occupied')
ON CONFLICT (table_number) DO NOTHING;