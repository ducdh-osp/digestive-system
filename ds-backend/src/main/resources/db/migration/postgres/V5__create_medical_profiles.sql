CREATE TABLE medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_height_positive CHECK (height_cm IS NULL OR height_cm > 0),
    CONSTRAINT chk_weight_positive CHECK (weight_kg IS NULL OR weight_kg > 0)
);
