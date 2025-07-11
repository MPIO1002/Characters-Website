# Hướng dẫn khởi tạo lại Database

## Bước 1: Copy file SQL vào container PostgreSQL

```bash
# Copy file init_database.sql vào container postgres
docker cp database/init_database.sql postgres123:/tmp/init_database.sql
```

## Bước 2: Chạy script tạo schema

```bash
# Kết nối vào container PostgreSQL và chạy script
docker exec postgres123 psql -U postgres -d mhgh -f /tmp/init_database.sql
```

## Bước 3: Tạo admin user

Sử dụng script Node.js có sẵn:

```bash
# Vào thư mục backend
cd backend

# Build TypeScript code (nếu cần)
npm run build

# Chạy script tạo user admin
node dist/insertUser.js
```

Hoặc chạy trực tiếp với ts-node:

```bash
cd backend
npx ts-node src/insertUser.ts
```

## Bước 4: Kiểm tra kết quả

```bash
# Kết nối vào PostgreSQL để kiểm tra
docker exec -it postgres123 psql -U postgres -d mhgh

# Kiểm tra các table đã được tạo
\dt

# Kiểm tra admin user đã được tạo
SELECT * FROM users;

# Thoát khỏi PostgreSQL
\q
```

## Thông tin đăng nhập Admin

- **Username:** `admin`
- **Password:** `GGOadminMHGH2025`

## Cấu trúc Database

### Tables chính:

1. **users** - Quản lý tài khoản admin
2. **heroes** - Thông tin các tướng
3. **skill** - Kỹ năng của tướng
4. **fate** - Duyên tướng
5. **pet** - Duyên linh thú của tướng
6. **artifact** - Duyên bảo vật của tướng
7. **pet_private** - Linh thú riêng biệt
8. **artifact_private** - Bảo vật riêng biệt

### Quan hệ:

- `heroes` (1) -> (n) `skill`, `fate`, `pet`, `artifact`
- `pet_private` và `artifact_private` là độc lập
- Tất cả đều có foreign key constraints và indexes

## Troubleshooting

### Nếu database chưa tồn tại:

```bash
# Tạo database
docker exec postgres123 psql -U postgres -c "CREATE DATABASE mhgh;"
```

### Nếu cần xóa toàn bộ và tạo lại:

```bash
# Xóa database (cẩn thận!)
docker exec postgres123 psql -U postgres -c "DROP DATABASE IF EXISTS mhgh;"
docker exec postgres123 psql -U postgres -c "CREATE DATABASE mhgh;"

# Sau đó chạy lại script init_database.sql
```

### Kiểm tra connection string:

Đảm bảo file `.env` trong backend có:
```
DATABASE_URL=postgres://postgres:17022025@postgres:5432/mhgh
```
