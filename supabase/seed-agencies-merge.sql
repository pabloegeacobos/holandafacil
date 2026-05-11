-- seed-agencies-merge.sql
-- Ejecutar DESPUÉS de seed-agencies.sql
--
-- Problema que resuelve:
--   Las agencias existentes con reviews (Randstad, Adecco, etc.) fueron creadas
--   sin KvK, por lo que el ON CONFLICT del seed no las actualizó.
--   Este script:
--     1. Copia certifications/kvk de las filas del seed a las agencias existentes (por nombre)
--     2. Elimina las filas duplicadas del seed (0 reviews, mismo nombre)

-- Paso 1: copiar certifications y KvK a las agencias existentes (tienen reviews)
UPDATE agencies existing_a
SET
  certifications = seed_a.certifications,
  kvk            = COALESCE(existing_a.kvk, seed_a.kvk),
  city           = COALESCE(existing_a.city, seed_a.city)
FROM (
  SELECT
    LOWER(TRIM(name)) AS norm_name,
    certifications,
    kvk,
    city
  FROM agencies
  WHERE total_reviews = 0
    AND kvk IS NOT NULL
    AND array_length(certifications, 1) > 0
) AS seed_a
WHERE existing_a.total_reviews > 0
  AND LOWER(TRIM(existing_a.name)) = seed_a.norm_name;

-- Paso 2: eliminar los duplicados del seed que ya tienen una contraparte con reviews
DELETE FROM agencies seed_row
WHERE seed_row.total_reviews = 0
  AND EXISTS (
    SELECT 1
    FROM agencies existing_a
    WHERE existing_a.total_reviews > 0
      AND LOWER(TRIM(existing_a.name)) = LOWER(TRIM(seed_row.name))
  );

-- Verificación (ejecutar para confirmar):
-- SELECT name, kvk, certifications, total_reviews
-- FROM agencies
-- WHERE total_reviews > 0
-- ORDER BY total_reviews DESC
-- LIMIT 20;
