package pe.edu.upeu.lamb.institucional.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.upeu.lamb.institucional.dto.RegimenModalidadRequest;
import pe.edu.upeu.lamb.institucional.dto.RegimenModalidadResponse;
import pe.edu.upeu.lamb.institucional.entity.RegimenModalidad;
import pe.edu.upeu.lamb.institucional.exception.ResourceNotFoundException;
import pe.edu.upeu.lamb.institucional.mapper.RegimenModalidadMapper;
import pe.edu.upeu.lamb.institucional.repository.RegimenModalidadRepository;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class RegimenModalidadService {

    private final RegimenModalidadRepository regimenModalidadRepository;
    private final RegimenModalidadMapper regimenModalidadMapper;

    public List<RegimenModalidadResponse> listar() {
        return regimenModalidadRepository.findAll().stream()
                .map(regimenModalidadMapper::toResponse)
                .toList();
    }

    public List<RegimenModalidadResponse> listarPorRegimen(Long idRegimenAcademico) {
        return regimenModalidadRepository.findByIdRegimenAcademico(idRegimenAcademico).stream()
                .map(regimenModalidadMapper::toResponse)
                .toList();
    }

    public RegimenModalidadResponse obtener(Long id) {
        return regimenModalidadMapper.toResponse(buscarOFallar(id));
    }

    public RegimenModalidadResponse crear(RegimenModalidadRequest request) {
        RegimenModalidad entity = regimenModalidadMapper.toEntity(request);
        return regimenModalidadMapper.toResponse(regimenModalidadRepository.save(entity));
    }

    public void eliminar(Long id) {
        regimenModalidadRepository.delete(buscarOFallar(id));
    }

    private RegimenModalidad buscarOFallar(Long id) {
        return regimenModalidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RegimenModalidad no encontrado con id: " + id));
    }
}
