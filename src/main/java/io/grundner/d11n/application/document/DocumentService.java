package io.grundner.d11n.application.document;

import io.grundner.d11n.api.error.EntityNotFoundException;
import io.grundner.d11n.application.directory.DirectoryService;
import io.grundner.d11n.application.space.SpaceService;
import io.grundner.d11n.domain.directory.Directory;
import io.grundner.d11n.domain.document.Document;
import io.grundner.d11n.domain.document.DocumentRepository;
import io.grundner.d11n.domain.space.Space;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final SpaceService spaceService;
    private final DirectoryService directoryService;

    @Transactional(readOnly = true)
    public Document findById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
        spaceService.findById(document.getSpace().getId());
        document.getBlocks().size(); // initialize lazy collection while session is open
        return document;
    }

    public Document createInSpace(Long spaceId, String title) {
        Space space = spaceService.findById(spaceId);
        Document document = new Document();
        document.setTitle(title);
        document.setSpace(space);
        return documentRepository.save(document);
    }

    public Document createInDirectory(Long directoryId, String title) {
        Directory directory = directoryService.findById(directoryId);
        Document document = new Document();
        document.setTitle(title);
        document.setSpace(directory.getSpace());
        document.setDirectory(directory);
        return documentRepository.save(document);
    }

    public Document update(Long id, String title) {
        Document document = findById(id);
        document.setTitle(title);
        return documentRepository.save(document);
    }

    public void delete(Long id) {
        documentRepository.delete(findById(id));
    }
}
