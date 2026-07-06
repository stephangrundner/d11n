package io.grundner.d11n.application.space;

import io.grundner.d11n.api.error.EntityNotFoundException;
import io.grundner.d11n.domain.directory.DirectoryRepository;
import io.grundner.d11n.domain.document.DocumentRepository;
import io.grundner.d11n.domain.space.Space;
import io.grundner.d11n.domain.space.SpaceRepository;
import io.grundner.d11n.domain.user.User;
import io.grundner.d11n.infrastructure.security.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final DocumentRepository documentRepository;
    private final DirectoryRepository directoryRepository;
    private final SecurityContextHelper securityContextHelper;

    @Transactional(readOnly = true)
    public List<Space> findAll() {
        return spaceRepository.findByOwner(securityContextHelper.currentUser());
    }

    @Transactional(readOnly = true)
    public Space findById(Long id) {
        User owner = securityContextHelper.currentUser();
        return spaceRepository.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new EntityNotFoundException("Space not found: " + id));
    }

    public Space create(String name) {
        Space space = new Space();
        space.setName(name);
        space.setOwner(securityContextHelper.currentUser());
        return spaceRepository.save(space);
    }

    public Space update(Long id, String name) {
        Space space = findById(id);
        space.setName(name);
        return spaceRepository.save(space);
    }

    public void delete(Long id) {
        spaceRepository.delete(findById(id));
    }

    @Transactional(readOnly = true)
    public long countDocuments(Space space) {
        return documentRepository.countBySpace(space);
    }

    @Transactional(readOnly = true)
    public long countDirectories(Space space) {
        return directoryRepository.countBySpace(space);
    }
}
