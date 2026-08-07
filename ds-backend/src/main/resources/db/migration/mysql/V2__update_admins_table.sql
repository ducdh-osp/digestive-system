ALTER TABLE admins ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

INSERT INTO admins (username, email, role_id, password_hash, is_active)
VALUES ('admin', 'admin@gastro.ai', 1, '$2b$12$y5vfJ0//KNJgVnLQFtIaTuwsqlj1ZrZ4ft9YUcK8YhgCk3iVHL1Zi', true);
