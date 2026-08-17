CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action ENUM('CREATE','UPDATE','DELETE') NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES admins(id),
    INDEX idx_audit_logs_admin_created (admin_id, created_at),
    INDEX idx_audit_logs_created (created_at)
);
