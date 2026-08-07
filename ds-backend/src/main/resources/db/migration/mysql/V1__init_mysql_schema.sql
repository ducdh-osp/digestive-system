CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO roles (role_name, description) VALUES 
('SUPER_ADMIN', 'Toàn quyền hệ thống'),
('DOCTOR', 'Bác sĩ chuyên môn'),
('CONTENT_CREATOR', 'Nhân sự quản lý tài liệu AI');
