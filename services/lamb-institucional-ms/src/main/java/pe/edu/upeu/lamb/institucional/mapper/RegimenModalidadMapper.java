package pe.edu.upeu.lamb.institucional.mapper;

import org.springframework.stereotype.Component;
import pe.edu.upeu.lamb.institucional.dto.RegimenModalidadRequest;
import pe.edu.upeu.lamb.institucional.dto.RegimenModalidadResponse;
import pe.edu.upeu.lamb.institucional.entity.RegimenModalidad;

@Component
public class RegimenModalidadMapper {

    public RegimenModalidad toEntity(RegimenModalidadRequest request) {
        return RegimenModalidad.builder()
                .idRegimenAcademico(request.getIdRegimenAcademico())
                .idModalidadEstudio(request.getIdModalidadEstudio())
                .build();
    }

    public RegimenModalidadResponse toResponse(RegimenModalidad entity) {
        return RegimenModalidadResponse.builder()
                .id(entity.getId())
                .idRegimenAcademico(entity.getIdRegimenAcademico())
                .idModalidadEstudio(entity.getIdModalidadEstudio())
                .build();
    }
}
