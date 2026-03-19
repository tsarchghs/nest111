/*
  # Initial Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique identifier for each user
      - `email` (text, unique) - User email address
      - `name` (text) - User full name
      - `created_at` (timestamptz) - Timestamp when user was created
      - `updated_at` (timestamptz) - Timestamp when user was last updated
    
    - `posts`
      - `id` (uuid, primary key) - Unique identifier for each post
      - `user_id` (uuid, foreign key) - References users table
      - `title` (text) - Post title
      - `content` (text) - Post content
      - `published` (boolean) - Whether the post is published
      - `created_at` (timestamptz) - Timestamp when post was created
      - `updated_at` (timestamptz) - Timestamp when post was last updated

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can read all published posts
    - Users can only manage their own posts
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all published posts"
  ON posts FOR SELECT
  TO authenticated
  USING (published = true OR user_id = auth.uid());

CREATE POLICY "Users can insert their own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
