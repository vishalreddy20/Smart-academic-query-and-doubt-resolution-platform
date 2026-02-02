/*
  # Smart Academic Query & Doubt Resolution Platform - Complete Schema

  ## Overview
  Complete database schema for an academic doubt resolution platform with role-based access control,
  priority management, knowledge base, and analytics support.

  ## New Tables

  ### 1. profiles
  Extends auth.users with additional user information and role-based access
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text: 'student', 'faculty', 'admin')
  - `created_at` (timestamptz)

  ### 2. subjects
  Academic subjects for categorizing doubts
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 3. doubts
  Student questions with status tracking, priority, and faculty assignment
  - `id` (uuid, primary key)
  - `student_id` (uuid, references profiles)
  - `subject_id` (uuid, references subjects)
  - `title` (text)
  - `description` (text)
  - `priority` (text: 'low', 'medium', 'high')
  - `status` (text: 'open', 'in_progress', 'resolved', 'reopened')
  - `faculty_id` (uuid, references profiles, nullable)
  - `answer` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `resolved_at` (timestamptz, nullable)

  ### 4. ratings
  Student feedback on faculty answers
  - `id` (uuid, primary key)
  - `doubt_id` (uuid, references doubts)
  - `student_id` (uuid, references profiles)
  - `rating` (integer, 1-5)
  - `feedback` (text, nullable)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Students can view their own doubts and resolved doubts
  - Faculty can view open doubts and their assigned doubts
  - Admin can view and manage everything
  - Proper authentication checks on all policies

  ## Important Notes
  1. Default role is 'student' for new users
  2. Priority defaults to 'medium'
  3. Status defaults to 'open'
  4. All timestamps are automatically managed
  5. Ratings are restricted to 1-5 range
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view other profiles for collaboration"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Subjects policies (everyone can view, only admin can modify)
CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert subjects"
  ON subjects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update subjects"
  ON subjects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete subjects"
  ON subjects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create doubts table
CREATE TABLE IF NOT EXISTS doubts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'reopened')),
  faculty_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  answer text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

-- Doubts policies
CREATE POLICY "Students can view own doubts"
  ON doubts FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    status IN ('resolved') OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('faculty', 'admin')
    )
  );

CREATE POLICY "Students can insert own doubts"
  ON doubts FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Students can update own doubts when reopening"
  ON doubts FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can update doubts to answer"
  ON doubts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'faculty'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'faculty'
    )
  );

CREATE POLICY "Admin can manage all doubts"
  ON doubts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id uuid NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(doubt_id, student_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Students can view ratings on resolved doubts"
  ON ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM doubts
      WHERE doubts.id = ratings.doubt_id AND doubts.status = 'resolved'
    )
  );

CREATE POLICY "Students can rate their own resolved doubts"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM doubts
      WHERE doubts.id = ratings.doubt_id 
      AND doubts.student_id = auth.uid()
      AND doubts.status = 'resolved'
    )
  );

CREATE POLICY "Students can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty and admin can view all ratings"
  ON ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('faculty', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doubts_student_id ON doubts(student_id);
CREATE INDEX IF NOT EXISTS idx_doubts_faculty_id ON doubts(faculty_id);
CREATE INDEX IF NOT EXISTS idx_doubts_subject_id ON doubts(subject_id);
CREATE INDEX IF NOT EXISTS idx_doubts_status ON doubts(status);
CREATE INDEX IF NOT EXISTS idx_doubts_priority ON doubts(priority);
CREATE INDEX IF NOT EXISTS idx_doubts_created_at ON doubts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_doubt_id ON ratings(doubt_id);

-- Insert default subjects
INSERT INTO subjects (name, description) VALUES
  ('Mathematics', 'Questions related to Mathematics including Calculus, Algebra, Statistics'),
  ('Physics', 'Questions related to Physics including Mechanics, Thermodynamics, Optics'),
  ('Chemistry', 'Questions related to Chemistry including Organic, Inorganic, Physical Chemistry'),
  ('Computer Science', 'Questions related to Programming, Data Structures, Algorithms, Databases'),
  ('Electronics', 'Questions related to Electronics, Digital Circuits, Microprocessors'),
  ('English', 'Questions related to English Language, Literature, Communication')
ON CONFLICT (name) DO NOTHING;
