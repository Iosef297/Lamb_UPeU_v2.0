package pe.edu.upeu.lamb.institucional.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "regimenes_academicos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegimenAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @Column(name = "periodos_por_anio")
    private Integer periodosPorAnio;

    @Column(name = "activo", nullable = false)
    private Boolean activo;
}
