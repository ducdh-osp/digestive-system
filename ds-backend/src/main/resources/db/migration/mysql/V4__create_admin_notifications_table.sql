CREATE TABLE admin_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_notifications_admin FOREIGN KEY (admin_id) REFERENCES admins(id),
    INDEX idx_admin_notifications_admin_created (admin_id, created_at),
    INDEX idx_admin_notifications_admin_unread (admin_id, is_read)
);
