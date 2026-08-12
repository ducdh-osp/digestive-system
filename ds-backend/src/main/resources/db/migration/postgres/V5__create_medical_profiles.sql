CREATE TABLE medical_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL UNIQUE,

    height_cm NUMERIC(5,2),

    weight_kg NUMERIC(5,2),

    medical_history TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_medical_profile_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_height_positive
        CHECK (height_cm IS NULL OR height_cm > 0),

    CONSTRAINT chk_weight_positive
        CHECK (weight_kg IS NULL OR weight_kg > 0)
);