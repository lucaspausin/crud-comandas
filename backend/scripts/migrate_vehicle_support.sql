-- Create the new many-to-many relationship table
CREATE TABLE _VehicleSupport (
    A Int NOT NULL,
    B Int NOT NULL,
    
    PRIMARY KEY (A,B),
    FOREIGN KEY (A) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (B) REFERENCES support(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing data
INSERT INTO _VehicleSupport (A, B)
SELECT DISTINCT vehicle_id, cylinder_id 
FROM vehicle_cylinder_versions;

-- Drop the old table
DROP TABLE vehicle_cylinder_versions; 