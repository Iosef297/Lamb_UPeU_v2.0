-- Relacion N:M entre regimen academico y modalidad de estudio.
-- Un regimen (p.ej. Modular) puede aplicar a varias modalidades
-- (Semipresencial y A Distancia) sin duplicar el regimen.

CREATE TABLE regimen_modalidad (
    id BIGSERIAL PRIMARY KEY,
    id_regimen_academico BIGINT NOT NULL REFERENCES regimenes_academicos (id),
    id_modalidad_estudio BIGINT NOT NULL REFERENCES modalidades_estudio (id),
    CONSTRAINT uq_regimen_modalidad UNIQUE (id_regimen_academico, id_modalidad_estudio)
);

-- Seed por nombre, no por id: filas id=1/2 de regimenes/modalidades
-- pueden ya no existir si fueron editadas/borradas desde el CRUD.
INSERT INTO regimen_modalidad (id_regimen_academico, id_modalidad_estudio)
SELECT r.id, m.id
FROM regimenes_academicos r, modalidades_estudio m
WHERE r.nombre = 'Semestral' AND m.nombre = 'Presencial'
ON CONFLICT DO NOTHING;

INSERT INTO regimen_modalidad (id_regimen_academico, id_modalidad_estudio)
SELECT r.id, m.id
FROM regimenes_academicos r, modalidades_estudio m
WHERE r.nombre = 'Modular' AND m.nombre = 'Semipresencial'
ON CONFLICT DO NOTHING;

INSERT INTO regimen_modalidad (id_regimen_academico, id_modalidad_estudio)
SELECT r.id, m.id
FROM regimenes_academicos r, modalidades_estudio m
WHERE r.nombre = 'Modular' AND m.nombre = 'A Distancia'
ON CONFLICT DO NOTHING;
