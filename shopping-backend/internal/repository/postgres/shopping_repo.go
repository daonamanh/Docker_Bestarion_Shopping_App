package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"shopping-backend/internal/domain"
)

type ShoppingRepository struct {
	db *sql.DB
}

func NewShoppingRepository(db *sql.DB) *ShoppingRepository {
	return &ShoppingRepository{db: db}
}

// ------------------- CART METHODS -------------------

// Lấy danh sách item trong giỏ hàng của user
func (r *ShoppingRepository) GetCartItems(ctx context.Context, userID int64) ([]domain.CartItem, error) {
	query := `
		SELECT ci.id, ci.user_id, ci.product_id, p.name, p.price, ci.quantity
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = $1
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []domain.CartItem{}
	for rows.Next() {
		var item domain.CartItem
		if err := rows.Scan(&item.ID, &item.UserID, &item.ProductID, &item.ProductName, &item.Price, &item.Quantity); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

// Thêm sản phẩm vào giỏ (Nó sẽ tự động cộng dồn nếu sản phẩm đã có trong giỏ)
func (r *ShoppingRepository) AddToCart(ctx context.Context, userID, productID int64, quantity int) error {
	query := `
		INSERT INTO cart_items (user_id, product_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, product_id)
		DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
	`
	_, err := r.db.ExecContext(ctx, query, userID, productID, quantity)
	return err
}

// Xóa 1 sản phẩm khỏi giỏ hàng
func (r *ShoppingRepository) RemoveCartItem(ctx context.Context, userID, productID int64) error {
	query := `DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2`
	_, err := r.db.ExecContext(ctx, query, userID, productID)
	return err
}

// ------------------- CHECKOUT TRANSACTION -------------------

func (r *ShoppingRepository) Checkout(ctx context.Context, userID int64) (*domain.Order, error) {
	// 1. Mở Transaction
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback() // Tự động Rollback nếu xảy ra lỗi giữa chừng

	// 2. Lấy danh sách sản phẩm trong giỏ và KHÓA dòng sản phẩm để kiểm tra tồn kho (FOR UPDATE)
	queryItems := `
		SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = $1
		FOR UPDATE OF p
	`
	rows, err := tx.QueryContext(ctx, queryItems, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	type cartRow struct {
		productID int64
		quantity  int
		price     float64
		stock     int
		name      string
	}

	var items []cartRow
	var totalAmount float64

	for rows.Next() {
		var item cartRow
		if err := rows.Scan(&item.productID, &item.quantity, &item.price, &item.stock, &item.name); err != nil {
			return nil, err
		}

		// ⚠️ KIỂM TRA TỒN KHO: Nếu không đủ stock -> Rollback toàn bộ
		if item.stock < item.quantity {
			return nil, fmt.Errorf("sản phẩm '%s' không đủ tồn kho (còn %d, trong giỏ %d)", item.name, item.stock, item.quantity)
		}

		totalAmount += item.price * float64(item.quantity)
		items = append(items, item)
	}

	if len(items) == 0 {
		return nil, errors.New("giỏ hàng của bạn đang trống")
	}

	// 3. Tạo Đơn Hàng mới (orders)
	var orderID int64
	createOrderQuery := `
		INSERT INTO orders (user_id, total_amount, status)
		VALUES ($1, $2, 'PAID')
		RETURNING id
	`
	err = tx.QueryRowContext(ctx, createOrderQuery, userID, totalAmount).Scan(&orderID)
	if err != nil {
		return nil, err
	}

	// 4. Chèn từng mục vào Chi tiết Đơn hàng (order_items) & TRỪ TỒN KHO (products.stock)
	insertOrderItemQuery := `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`
	updateStockQuery := `UPDATE products SET stock = stock - $1 WHERE id = $2`

	for _, item := range items {
		// Chèn order_item
		_, err := tx.ExecContext(ctx, insertOrderItemQuery, orderID, item.productID, item.quantity, item.price)
		if err != nil {
			return nil, err
		}

		// Trừ số lượng tồn kho
		_, err = tx.ExecContext(ctx, updateStockQuery, item.quantity, item.productID)
		if err != nil {
			return nil, err
		}
	}

	// 5. Xóa toàn bộ sản phẩm trong giỏ hàng (cart_items) của user này
	clearCartQuery := `DELETE FROM cart_items WHERE user_id = $1`
	if _, err := tx.ExecContext(ctx, clearCartQuery, userID); err != nil {
		return nil, err
	}

	// 6. Commit Transaction (Lưu vĩnh viễn vào Postgres)
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return &domain.Order{
		ID:          orderID,
		UserID:      userID,
		TotalAmount: totalAmount,
		Status:      "PAID",
	}, nil
}