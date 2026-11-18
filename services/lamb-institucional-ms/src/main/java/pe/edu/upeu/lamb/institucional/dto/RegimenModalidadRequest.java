package pe.edu.upeu.lamb.institucional.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegimenModalidadRequest {

    @NotNull
    private Long idRegimenAcademico;

    @NotNull
    private Long idModalidadEstudio;
}
