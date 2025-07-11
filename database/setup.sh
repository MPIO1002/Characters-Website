#!/bin/bash

# Script khởi tạo lại database
echo "🚀 Bắt đầu khởi tạo lại database..."

# 1. Chạy script tạo schema
echo "📋 Tạo schema database..."
docker exec postgres123 psql -U postgres -d mhgh -f /tmp/init_database.sql

# 2. Chạy script Node.js để tạo admin user với password đã hash
echo "👤 Tạo admin user..."
cd backend && npm run build && node dist/insertUser.js

echo "✅ Hoàn thành khởi tạo database!"
echo "🔑 Thông tin đăng nhập admin:"
echo "   Username: admin"
echo "   Password: GGOadminMHGH2025"
