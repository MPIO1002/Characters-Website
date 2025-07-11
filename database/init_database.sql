-- Khởi tạo database cho Characters Website
-- Tạo database (nếu chưa có)
-- CREATE DATABASE mhgh;

-- Kết nối vào database mhgh
\c mhgh;

-- 1. Table users (cho authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 2. Table heroes (tướng chính)
CREATE TABLE IF NOT EXISTS heroes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    img TEXT,
    story TEXT,
    transform TEXT
);

-- 3. Table skill (kỹ năng của tướng)
CREATE TABLE IF NOT EXISTS skill (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    star VARCHAR(50),
    description TEXT,
    hero_id INTEGER REFERENCES heroes(id) ON DELETE CASCADE
);

-- 4. Table fate (duyên tướng)
CREATE TABLE IF NOT EXISTS fate (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hero_id INTEGER REFERENCES heroes(id) ON DELETE CASCADE
);

-- 5. Table pet (duyên linh thú của tướng)
CREATE TABLE IF NOT EXISTS pet (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hero_id INTEGER REFERENCES heroes(id) ON DELETE CASCADE
);

-- 6. Table artifact (duyên bảo vật của tướng)
CREATE TABLE IF NOT EXISTS artifact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hero_id INTEGER REFERENCES heroes(id) ON DELETE CASCADE
);

-- 7. Table pet_private (linh thú riêng biệt - không thuộc tướng nào)
CREATE TABLE IF NOT EXISTS pet_private (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    img TEXT,
    img_figure_1 TEXT,
    img_figure_2 TEXT
);

-- 8. Table artifact_private (bảo vật riêng biệt - không thuộc tướng nào)
CREATE TABLE IF NOT EXISTS artifact_private (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    img TEXT,
    img_figure_1 TEXT,
    img_figure_2 TEXT
);

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_heroes_name ON heroes(name);
CREATE INDEX IF NOT EXISTS idx_skill_hero_id ON skill(hero_id);
CREATE INDEX IF NOT EXISTS idx_fate_hero_id ON fate(hero_id);
CREATE INDEX IF NOT EXISTS idx_pet_hero_id ON pet(hero_id);
CREATE INDEX IF NOT EXISTS idx_artifact_hero_id ON artifact(hero_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Thông báo hoàn thành
SELECT 'Database schema created successfully!' as status;
