package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"shopping-backend/internal/service"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Nếu là OPTIONS request (CORS Preflight), bỏ qua Auth để CORSMiddleware xử lý
		if c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		// 2. Lấy header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Request must include Authorization header"})
			c.Abort()
			return
		}

		// 3. Tách chuỗi "Bearer <token>"
		authHeader = strings.TrimSpace(authHeader)
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format. Expected 'Bearer <token>'"})
			c.Abort()
			return
		}

		tokenString := strings.TrimSpace(parts[1])
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token string cannot be empty"})
			c.Abort()
			return
		}

		// 4. Validate và Parse JWT Token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Đảm bảo thuật toán mã hóa là HMAC (HS256/HS384/HS512)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return service.JwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// 5. Trích xuất claims và lưu user_id vào Context
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		userID, exists := claims["user_id"]
		if !exists || userID == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
			c.Abort()
			return
		}

		// Lưu thông tin user_id vào Gin context để Handler tiếp theo sử dụng
		c.Set("user_id", userID)

		c.Next()
	}
}