package domain

import (
	"context"
	"time"
)

// User định nghĩa cấu trúc dữ liệu người dùng trong CSDL
type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // Không serialize mật khẩu ra JSON
	FullName     string    `json:"full_name"`
	Role         string    `json:"role"` // 'admin' hoặc 'customer'
	CreatedAt    time.Time `json:"created_at"`
}

// RegisterReq DTO nhận dữ liệu đăng ký từ Client
type RegisterReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
}

// LoginReq DTO nhận dữ liệu đăng nhập từ Client
type LoginReq struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// 🟢 MỚI: DTO Yêu cầu quên mật khẩu
type ForgotPasswordReq struct {
	Email string `json:"email" binding:"required,email"`
}

// 🟢 MỚI: DTO Đặt lại mật khẩu mới
type ResetPasswordReq struct {
	Email       string `json:"email" binding:"required,email"`
	Token       string `json:"token" binding:"required,len=6"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}
// AuthResponse DTO trả về Token và thông tin User sau khi Auth thành công
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// UserRepository Interface giao tiếp với Database
type UserRepository interface {
	Create(ctx context.Context, u *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id int64) (*User, error)
	// 🟢 MỚI: Phương thức cập nhật mật khẩu
	UpdatePassword(ctx context.Context, userID int64, newPasswordHash string) error
}