package io.grundner.d11n.application.directory;

import io.grundner.d11n.api.error.EntityNotFoundException;
import io.grundner.d11n.application.space.SpaceService;
import io.grundner.d11n.domain.directory.Directory;
import io.grundner.d11n.domain.directory.DirectoryRepository;
import io.grundner.d11n.domain.space.Space;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DirectoryService {

    private final DirectoryRepository directoryRepository;
    private final SpaceService spaceService;

    @Transactional(readOnly = true)
    public Directory findById(Long id) {
        Directory directory = directoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Directory not found: " + id));
        // verify the caller has access via the space
        spaceService.findById(directory.getSpace().getId());
        return directory;
    }

    public Directory createInSpace(Long spaceId, String name) {
        Space space = spaceService.findById(spaceId);
        Directory directory = new Directory();
        directory.setName(name);
        directory.setSpace(space);
        return directoryRepository.save(directory);
    }

    public Directory createInDirectory(Long parentId, String name) {
        Directory parent = findById(parentId);
        Directory directory = new Directory();
        directory.setName(name);
        directory.setSpace(parent.getSpace());
        directory.setParent(parent);
        return directoryRepository.save(directory);
    }

    public Directory update(Long id, String name) {
        Directory directory = findById(id);
        directory.setName(name);
        return directoryRepository.save(directory);
    }

    public void delete(Long id) {
        directoryRepository.delete(findById(id));
    }
}
