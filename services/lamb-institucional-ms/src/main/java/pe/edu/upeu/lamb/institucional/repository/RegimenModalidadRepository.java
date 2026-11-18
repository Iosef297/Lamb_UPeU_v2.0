package pe.edu.upeu.lamb.institucional.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.lamb.institucional.entity.RegimenModalidad;

import java.util.List;

public interface RegimenModalidadRepository extends JpaRepository<RegimenModalidad, Long> {
    List<RegimenModalidad> findByIdRegimenAcademico(Long idRegimenAcademico);
    void deleteByIdRegimenAcademicoAndIdModalidadEstudio(Long idRegimenAcademico, Long idModalidadEstudio);
}
