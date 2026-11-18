-- Ley Universitaria (Ley N. 30220) y licenciamiento SUNEDU reconocen
-- unicamente estas 3 modalidades de estudio para pregrado/posgrado.
INSERT INTO modalidades_estudio (id, nombre, descripcion) VALUES
    (1, 'Presencial', 'Modalidad de estudio presencial.'),
    (2, 'Semipresencial', 'Modalidad de estudio semipresencial (B-Learning).'),
    (3, 'A Distancia', 'Modalidad de estudio a distancia (virtual).');

SELECT setval('modalidades_estudio_id_seq', (SELECT COALESCE(MAX(id), 1) FROM modalidades_estudio));
