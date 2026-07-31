package handler

import (
	"errors"
	"net/http"
	"shopping-backend/internal/domain"
	"shopping-backend/internal/service"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	service service.UserService
}

func NewUserHandler(s service.UserService) *UserHandler {
	return &UserHandler{service: s}
}

func getCurrentUserID(c *gin.Context) int64 {
	if val, exists := c.Get("user_id"); exists {
		switch v := val.(type) {
		case float64:
			return int64(v)
		case int64:
			return v
		case int:
			return int64(v)
		}
	}
	return 0
}

// Hàm bổ trợ: Format lỗi Validate từ ShouldBindJSON thành Map chi tiết
func formatValidationError(err error) map[string]string {
	errs := make(map[string]string)
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		for _, fe := range ve {
			switch fe.Tag() {
			case "required":
				errs[fe.Field()] = "This field is required"
			case "email":
				errs[fe.Field()] = "Invalid email format"
			case "min":
				errs[fe.Field()] = "Password must be at least " + fe.Param() + " characters long"
			case "len":
				errs[fe.Field()] = "Must be exactly " + fe.Param() + " characters long"
			default:
				errs[fe.Field()] = "Invalid value"
			}
		}
		return errs
	}
	return map[string]string{"error": "Invalid JSON payload structure"}
}

func (h *UserHandler) Register(c *gin.Context) {
	var req domain.RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		// 🟢 Trả về chi tiết các trường bị lỗi validate
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Dữ liệu đầu vào không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	res, err := h.service.Register(c.Request.Context(), req)
	if err != nil {
		// 🟢 Phân loại lỗi nghiệp vụ cụ thể
		if errors.Is(err, domain.ErrEmailAlreadyExists) {
			c.JSON(http.StatusConflict, gin.H{"error": "Email này đã được đăng ký"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống, vui lòng thử lại sau"})
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (h *UserHandler) Login(c *gin.Context) {
	var req domain.LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Dữ liệu đầu vào không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	res, err := h.service.Login(c.Request.Context(), req)
	if err != nil {
		// 🟢 Bắt lỗi đăng nhập sai (User không tồn tại hoặc Mật khẩu sai)
		if errors.Is(err, domain.ErrInvalidCredentials) || errors.Is(err, domain.ErrUserNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Email hoặc mật khẩu không chính xác"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống, vui lòng thử lại sau"})
		return
	}

	c.JSON(http.StatusOK, res)
}

// 🟢 Handler Quên Mật Khẩu
func (h *UserHandler) ForgotPassword(c *gin.Context) {
	var req domain.ForgotPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Email không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	resetToken, err := h.service.ForgotPassword(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Email không tồn tại trong hệ thống"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống, vui lòng thử lại sau"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Yêu cầu thành công. Vui lòng kiểm tra email/token.",
		"reset_token": resetToken,
	})
}

// 🟢 Handler Đặt Lại Mật Khẩu
func (h *UserHandler) ResetPassword(c *gin.Context) {
	var req domain.ResetPasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Dữ liệu không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	err := h.service.ResetPassword(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, domain.ErrInvalidToken) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Token không hợp lệ hoặc đã hết hạn"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống, vui lòng thử lại sau"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đặt lại mật khẩu thành công"})
}

// 🟢 MỚI: Handler lấy toàn bộ danh sách User cho Admin
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.service.GetAllUsers(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy danh sách người dùng"})
		return
	}
	c.JSON(http.StatusOK, users)
}

// 🟢 MỚI: Handler cập nhật Role cho User
func (h *UserHandler) UpdateRole(c *gin.Context) {
	idParam := c.Param("id")
	userID, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID người dùng không hợp lệ"})
		return
	}

	var req domain.UpdateRoleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Dữ liệu không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	if err := h.service.UpdateUserRole(c.Request.Context(), userID, req.Role); err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cập nhật phân quyền thất bại"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật phân quyền thành công"})
}

func (h *UserHandler) GetMe(c *gin.Context) {
	userID := getCurrentUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản không hợp lệ hoặc chưa đăng nhập"})
		return
	}

	user, err := h.service.GetProfile(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lấy thông tin người dùng"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateMe(c *gin.Context) {
	userID := getCurrentUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản không hợp lệ hoặc chưa đăng nhập"})
		return
	}

	var req domain.UpdateProfileReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Dữ liệu không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	if err := h.service.UpdateProfile(c.Request.Context(), userID, req); err != nil {
		if errors.Is(err, domain.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cập nhật thông tin thất bại"})
		return
	}

	updatedUser, err := h.service.GetProfile(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Cập nhật thông tin thành công"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật thông tin thành công", "user": updatedUser})
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID := getCurrentUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Tài khoản không hợp lệ hoặc chưa đăng nhập"})
		return
	}

	var req domain.ChangePasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Dữ liệu không hợp lệ",
			"details": formatValidationError(err),
		})
		return
	}

	if err := h.service.ChangePassword(c.Request.Context(), userID, req); err != nil {
		if errors.Is(err, domain.ErrInvalidCurrentPassword) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Mật khẩu hiện tại không chính xác"})
			return
		}
		if errors.Is(err, domain.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy người dùng"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Đổi mật khẩu thất bại"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đổi mật khẩu thành công"})
}
