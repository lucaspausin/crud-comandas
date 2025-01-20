-- First drop the foreign keys
ALTER TABLE vehicle_cylinder_versions 
DROP FOREIGN KEY vehicle_cylinder_versions_vehicle_id_fkey;

ALTER TABLE vehicle_cylinder_versions 
DROP FOREIGN KEY vehicle_cylinder_versions_cylinder_id_fkey;

-- Then drop the unique key
ALTER TABLE vehicle_cylinder_versions 
DROP INDEX vehicle_cylinder_versions_vehicle_id_version_type_key;

-- Finally re-add the foreign keys without the unique constraint
ALTER TABLE vehicle_cylinder_versions 
ADD CONSTRAINT vehicle_cylinder_versions_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE vehicle_cylinder_versions 
ADD CONSTRAINT vehicle_cylinder_versions_cylinder_id_fkey 
FOREIGN KEY (cylinder_id) REFERENCES support(id) 
ON DELETE CASCADE ON UPDATE CASCADE; 