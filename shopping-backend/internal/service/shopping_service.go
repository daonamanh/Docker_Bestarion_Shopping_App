package service

import (
	"context"
	"shopping-backend/internal/domain"
	"shopping-backend/internal/repository/postgres"
)

type ShoppingService struct {
	repo *postgres.ShoppingRepository
}

func NewShoppingService(repo *postgres.ShoppingRepository) *ShoppingService {
	return &ShoppingService{repo: repo}
}

// Lấy giỏ hàng
func (s *ShoppingService) GetCart(ctx context.Context, userID int64) ([]domain.CartItem, error) {
	return s.repo.GetCartItems(ctx, userID)
}

// Thêm sản phẩm vào giỏ
func (s *ShoppingService) AddToCart(ctx context.Context, userID, productID int64, quantity int) error {
	// Có thể bổ sung logic kiểm tra sản phẩm tồn tại hoặc check stock ở đây nếu muốn
	return s.repo.AddToCart(ctx, userID, productID, quantity)
}

// Xóa sản phẩm khỏi giỏ
func (s *ShoppingService) RemoveCartItem(ctx context.Context, userID, productID int64) error {
	return s.repo.RemoveCartItem(ctx, userID, productID)
}

// Thanh toán đơn hàng (Checkout)
func (s *ShoppingService) Checkout(ctx context.Context, userID int64) (*domain.Order, error) {
	// Gọi trực tiếp repository đang chứa Transaction trừ kho
	return s.repo.Checkout(ctx, userID)
}