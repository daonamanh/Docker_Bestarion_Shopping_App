package postgres

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

// InitDB khởi tạo kết nối tới cơ sở dữ liệu PostgreSQL
func InitDB(connStr string) (*sql.DB, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("lỗi kết nối cơ sở dữ liệu: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("không thể ping tới cơ sở dữ liệu: %w", err)
	}

	return db, nil
}