package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"shopping-backend/internal/domain"
	"shopping-backend/internal/service"
)

type ShoppingHandler struct {
	service *service.ShoppingService
}

func NewShoppingHandler(s *service.ShoppingService) *ShoppingHandler {
	return &ShoppingHandler{service: s}
}

func getUserID(c *gin.Context) int64 {
	if val, exists := c.Get("user_id"); exists {
		switch v := val.(type) {
		case float64:
			return int64(v) // JWT claims mặc định parse ra float64
		case int64:
			return v
		case int:
			return int64(v)
		}
	}
	return 0 // Trả về 0 thay vì hardcode id = 1
}

func (h *ShoppingHandler) GetCart(c *gin.Context) {
	items, err := h.service.GetCart(c.Request.Context(), getUserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

func (h *ShoppingHandler) AddToCart(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản không hợp lệ hoặc chưa đăng nhập"})
		return
	}

	var req domain.AddToCartReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.service.AddToCart(c.Request.Context(), userID, req.ProductID, req.Quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã thêm vào giỏ hàng thành công"})
}

func (h *ShoppingHandler) Checkout(c *gin.Context) {
	order, err := h.service.Checkout(c.Request.Context(), getUserID(c))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Thanh toán đơn hàng thành công",
		"order":   order,
	})
}