-- Crear tabla temporal
CREATE TABLE vehicles_temp (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    brand_id          INT,
    name              VARCHAR(255),
    observations      TEXT,
    sales_suggestions TEXT,
    cradle_type       VARCHAR(100),
    created_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    updated_at        TIMESTAMP(0) DEFAULT CURRENT_TIMESTAMP(0),
    exhaust_reform    BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
);

-- Copiar datos
INSERT INTO vehicles_temp 
SELECT id, brand_id, name, observations, sales_suggestions, cradle_type, created_at, updated_at, exhaust_reform 
FROM vehicles;

-- Eliminar relaciones existentes
DELETE FROM _VehicleSupport;

-- Eliminar tabla original
DROP TABLE vehicles;

-- Renombrar tabla temporal
RENAME TABLE vehicles_temp TO vehicles;

-- Recrear índice normal
CREATE INDEX idx_brand_id ON vehicles(brand_id);

-- Recrear tabla de relación many-to-many
CREATE TABLE _VehicleSupport (
    A INT NOT NULL,
    B INT NOT NULL,
    FOREIGN KEY (A) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES support(id) ON DELETE CASCADE,
    PRIMARY KEY(A, B)
); 