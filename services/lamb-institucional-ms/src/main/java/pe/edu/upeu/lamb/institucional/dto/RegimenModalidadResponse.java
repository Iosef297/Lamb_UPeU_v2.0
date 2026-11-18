package pe.edu.upeu.lamb.institucional.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegimenModalidadResponse {
    private Long id;
    private Long idRegimenAcademico;
    private Long idModalidadEstudio;
}
