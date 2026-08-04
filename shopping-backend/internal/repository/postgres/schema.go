package postgres

import (
	"database/sql"
	"fmt"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func EnsureSchema(db *sql.DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id BIGSERIAL PRIMARY KEY,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			full_name VARCHAR(255) NOT NULL,
			role VARCHAR(50) NOT NULL DEFAULT 'customer',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS products (
			id BIGSERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			category VARCHAR(100) DEFAULT '',
			price NUMERIC(10,2) NOT NULL,
			stock INTEGER NOT NULL DEFAULT 0,
			image_url TEXT DEFAULT '',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS cart_items (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			quantity INTEGER NOT NULL DEFAULT 1,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			UNIQUE(user_id, product_id)
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			id BIGSERIAL PRIMARY KEY,
			user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			total_amount NUMERIC(10,2) NOT NULL,
			status VARCHAR(50) NOT NULL DEFAULT 'PAID',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE TABLE IF NOT EXISTS order_items (
			id BIGSERIAL PRIMARY KEY,
			order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
			quantity INTEGER NOT NULL,
			price NUMERIC(10,2) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`,
		`ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT ''`,
	}

	for _, stmt := range statements {
		if _, err := db.Exec(stmt); err != nil {
			return fmt.Errorf("ensure schema failed for %q: %w", stmt, err)
		}
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@gmail.com"
	}
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "123456"
	}

	var exists bool
	if err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, adminEmail).Scan(&exists); err != nil {
		return fmt.Errorf("check default admin existence failed: %w", err)
	}

	if !exists {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("hash default admin password failed: %w", err)
		}
		if _, err := db.Exec(`
			INSERT INTO users (email, password_hash, full_name, role, created_at)
			VALUES ($1, $2, $3, $4, NOW())
		`, adminEmail, string(hashedPassword), "System Administrator", "admin"); err != nil {
			return fmt.Errorf("create default admin failed: %w", err)
		}
	}

	var productCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM products`).Scan(&productCount); err != nil {
		return fmt.Errorf("check product seed count failed: %w", err)
	}
	if productCount == 0 {
		seedProducts := []struct {
			name     string
			category string
			price    float64
			stock    int
			imageURL string
		}{
			{name: "Laptop Dell", category: "Electronics", price: 18990000, stock: 8, imageURL: ""},
			{name: "iPhone 15", category: "Electronics", price: 24990000, stock: 5, imageURL: ""},
			{name: "Sneaker Nike", category: "Fashion", price: 3200000, stock: 12, imageURL: ""},
		}
		for _, p := range seedProducts {
			if _, err := db.Exec(`
				INSERT INTO products (name, category, price, stock, image_url, created_at)
				VALUES ($1, $2, $3, $4, $5, NOW())
			`, p.name, p.category, p.price, p.stock, p.imageURL); err != nil {
				return fmt.Errorf("seed product failed: %w", err)
			}
		}
	}

	var orderCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM orders`).Scan(&orderCount); err != nil {
		return fmt.Errorf("check order seed count failed: %w", err)
	}
	if orderCount == 0 {
		var userID int64
		if err := db.QueryRow(`SELECT id FROM users WHERE email = $1`, adminEmail).Scan(&userID); err != nil {
			return fmt.Errorf("get admin user id for seed order failed: %w", err)
		}
		var productID int64
		if err := db.QueryRow(`SELECT id FROM products ORDER BY id LIMIT 1`).Scan(&productID); err != nil {
			return fmt.Errorf("get seed product id for order failed: %w", err)
		}
		if _, err := db.Exec(`
			INSERT INTO orders (user_id, total_amount, status, created_at)
			VALUES ($1, $2, 'PAID', NOW())
		`, userID, 3200000); err != nil {
			return fmt.Errorf("seed order failed: %w", err)
		}
		var orderID int64
		if err := db.QueryRow(`SELECT id FROM orders ORDER BY id DESC LIMIT 1`).Scan(&orderID); err != nil {
			return fmt.Errorf("get seeded order id failed: %w", err)
		}
		if _, err := db.Exec(`
			INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
			VALUES ($1, $2, 1, $3, NOW())
		`, orderID, productID, 3200000); err != nil {
			return fmt.Errorf("seed order item failed: %w", err)
		}
	}

	return nil
}
