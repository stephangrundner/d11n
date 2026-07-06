package io.grundner.d11n.application.content;

import io.grundner.d11n.api.content.ContentItemResponse;
import io.grundner.d11n.domain.directory.Directory;
import io.grundner.d11n.domain.directory.DirectoryRepository;
import io.grundner.d11n.domain.document.DocumentRepository;
import io.grundner.d11n.domain.space.Space;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final DirectoryRepository directoryRepository;
    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public List<ContentItemResponse> listSpaceContents(Space space) {
        List<ContentItemResponse> items = new ArrayList<>();
        directoryRepository.findBySpaceAndParentIsNull(space).stream()
                .map(ContentItemResponse::fromDirectory)
                .forEach(items::add);
        documentRepository.findBySpaceAndDirectoryIsNull(space).stream()
                .map(ContentItemResponse::fromDocument)
                .forEach(items::add);
        items.sort(Comparator.comparing(ContentItemResponse::updatedAt).reversed());
        return items;
    }

    @Transactional(readOnly = true)
    public List<ContentItemResponse> listDirectoryContents(Directory directory) {
        List<ContentItemResponse> items = new ArrayList<>();
        directoryRepository.findByParent(directory).stream()
                .map(ContentItemResponse::fromDirectory)
                .forEach(items::add);
        documentRepository.findByDirectory(directory).stream()
                .map(ContentItemResponse::fromDocument)
                .forEach(items::add);
        items.sort(Comparator.comparing(ContentItemResponse::updatedAt).reversed());
        return items;
    }
}
