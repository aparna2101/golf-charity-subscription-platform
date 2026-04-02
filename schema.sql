CREATE DATABASE IF NOT EXISTS golf_charity_subscription_platform;
USE golf_charity_subscription_platform;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  plan ENUM('Monthly', 'Yearly') DEFAULT 'Monthly',
  charity_id INT,
  charity_contribution_pct INT DEFAULT 10,
  status ENUM('Active', 'Inactive', 'Pending') DEFAULT 'Active',
  role ENUM('user', 'admin') DEFAULT 'user',
  otp_code VARCHAR(10),
  otp_expiry DATETIME,
  joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS charities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  members INT DEFAULT 0,
  contributions DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  description TEXT,
  category VARCHAR(100) DEFAULT 'Community',
  location VARCHAR(255),
  image_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS draws (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draw_date DATE NOT NULL,
  prize_pool DECIMAL(10, 2) DEFAULT 0.00,
  winning_numbers VARCHAR(255),
  status ENUM('Pending', 'Completed') DEFAULT 'Pending',
  published BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS winners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  draw_id INT NOT NULL,
  user_id INT NOT NULL,
  match_type ENUM('3-Number', '4-Number', '5-Number'),
  prize_amount DECIMAL(10, 2),
  status ENUM('Pending', 'Verified', 'Paid') DEFAULT 'Pending',
  proof_url VARCHAR(255),
  FOREIGN KEY (draw_id) REFERENCES draws(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan ENUM('Monthly', 'Yearly') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('active', 'cancelled', 'lapsed') DEFAULT 'active',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_subscription_id VARCHAR(255),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  status ENUM('created', 'paid', 'failed') DEFAULT 'created',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- Add columns if they don't exist (for existing databases)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user';
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry DATETIME;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS charity_contribution_pct INT DEFAULT 10;
-- ALTER TABLE charities ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Community';
-- ALTER TABLE charities ADD COLUMN IF NOT EXISTS location VARCHAR(255);

INSERT INTO charities (name, members, contributions, status, description, category, location) VALUES 
('Hope Through Sport Foundation', 2340, 234000.00, 'Active', 'Empowering disadvantaged youth through sport programs across the UK.', 'Sport', 'London, UK'),
('GreenFairway Trust', 1820, 156000.00, 'Active', 'Restoring natural habitats and wildlife corridors along UK golf courses.', 'Environment', 'Edinburgh, UK'),
('Junior Swing Academy', 1540, 128000.00, 'Active', 'Providing free golf coaching and mentorship for underprivileged children.', 'Youth', 'Manchester, UK')
ON DUPLICATE KEY UPDATE name=name;
