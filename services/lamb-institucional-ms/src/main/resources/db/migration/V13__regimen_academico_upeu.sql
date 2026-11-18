-- Modelo operativo UPeU de Regimen Academico: Semestral (periodo regular de
-- ~16 semanas, 2 ciclos I/II + verano/nivelacion) y Modular (modulos
-- intensivos secuenciales, p.ej. bimodular en semipresencial/a distancia).
-- Modalidad de estudio y regimen academico quedan desacoplados: se
-- relacionan recien a nivel de programa_sede (oferta del programa).

ALTER TABLE regimenes_academicos
    ADD COLUMN periodos_por_anio INTEGER,
    ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE regimenes_academicos
    ADD CONSTRAINT uq_regimenes_academicos_nombre UNIQUE (nombre);

INSERT INTO regimenes_academicos (id, nombre, descripcion, periodos_por_anio, activo) VALUES
    (1, 'Semestral', 'Periodo regular de aprox. 16 semanas; 2 ciclos regulares al anio (I y II) mas periodo extraordinario de verano/nivelacion.', 2, TRUE),
    (2, 'Modular', 'Organizacion por modulos intensivos secuenciales dentro de un periodo (p.ej. bimodular de 8 semanas para semipresencial/a distancia, o modulos mensuales para posgrado/segunda especialidad).', 2, TRUE);

SELECT setval('regimenes_academicos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM regimenes_academicos));

-- Relacion modalidad/regimen recien a nivel de oferta del programa (programa_sede).
ALTER TABLE programa_sede
    ADD COLUMN id_modalidad_estudio BIGINT REFERENCES modalidades_estudio (id),
    ADD COLUMN id_regimen_academico BIGINT REFERENCES regimenes_academicos (id);

-- Subperiodos/modulos: un periodo padre (2026-I) puede tener hijos (2026-I - M1, 2026-I - M2).
ALTER TABLE periodos_academicos
    ADD COLUMN id_periodo_padre BIGINT REFERENCES periodos_academicos (id);

INSERT INTO tipos_periodo (id, nombre, descripcion) VALUES
    (1, 'Regular', 'Ciclo academico regular (semestral).'),
    (2, 'Verano / Nivelacion', 'Periodo extraordinario de verano o nivelacion.'),
    (3, 'Modulo', 'Subperiodo/modulo intensivo dentro de un periodo padre (regimen modular).');

SELECT setval('tipos_periodo_id_seq', (SELECT COALESCE(MAX(id), 1) FROM tipos_periodo));
