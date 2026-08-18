# FROM golang:1.23-alpine AS builder

# WORKDIR /app

# ENV GOTOOLCHAIN=auto

# COPY go.mod go.sum ./
# RUN go mod download

# COPY . .

# # Chỉ định chính xác đường dẫn chứa file main.go
# RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go

# FROM alpine:latest
# WORKDIR /app
# COPY --from=builder /app/main .
# EXPOSE 8080
# CMD ["./main"]


# Stage 1: Build binary Golang
FROM golang:1.23-alpine AS builder

WORKDIR /app

ENV GOTOOLCHAIN=auto

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build file main ra ngoài thư mục làm việc (/main)
RUN CGO_ENABLED=0 GOOS=linux go build -o /main ./cmd/api/main.go

# Stage 2: Run binary
FROM alpine:latest
WORKDIR /app

# Copy file main từ stage build vào thư mục gốc /main
COPY --from=builder /main /main

EXPOSE 8082

# Chạy file /main ở thư mục gốc
CMD ["/main"]