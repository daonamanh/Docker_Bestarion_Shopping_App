package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"shopping-backend/internal/domain"
	"shopping-backend/internal/service"
)

type UserHandler struct {
	service service.UserService
}

func NewUserHandler(s service.UserService) *UserHandler {
	return &UserHandler{service: s}
}

func (h *UserHandler) Register(c *gin.Context) {
	var req domain.RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu nhập vào không hợp lệ"})
		return
	}

	res, err := h.service.Register(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (h *UserHandler) Login(c *gin.Context) {
	var req domain.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu nhập vào không hợp lệ"})
		return
	}

	res, err := h.service.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// 🟢 MỚI: Handler Quên Mật Khẩu
func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req domain.ForgotPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email không hợp lệ"})
		return
	}

	resetToken, err := h.service.ForgotPassword(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Yêu cầu thành công. Vui lòng kiểm tra email/token.",
		"reset_token": resetToken, // Trả token về để test trực tiếp trên FE
	})
}

// 🟢 MỚI: Handler Đặt Lại Mật Khẩu
func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req domain.ResetPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	err := h.service.ResetPassword(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đặt lại mật khẩu thành công"})
}