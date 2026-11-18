package pe.edu.upeu.lamb.institucional.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Relacion N:M entre regimen academico y modalidad de estudio
 * (p.ej. Modular aplica tanto a Semipresencial como a A Distancia).
 */
@Entity
@Table(name = "regimen_modalidad")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegimenModalidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "id_regimen_academico", nullable = false)
    private Long idRegimenAcademico;

    @Column(name = "id_modalidad_estudio", nullable = false)
    private Long idModalidadEstudio;
}
