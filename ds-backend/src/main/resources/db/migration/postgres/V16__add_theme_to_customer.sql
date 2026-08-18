ALTER TABLE customers ADD COLUMN theme VARCHAR(10) NOT NULL DEFAULT 'light';
ALTER TABLE customers ADD CONSTRAINT chk_customers_theme CHECK (theme IN ('light', 'dark'));
