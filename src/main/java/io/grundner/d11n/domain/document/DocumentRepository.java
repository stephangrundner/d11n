package io.grundner.d11n.domain.document;

import io.grundner.d11n.domain.directory.Directory;
import io.grundner.d11n.domain.space.Space;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findBySpaceAndDirectoryIsNull(Space space);

    List<Document> findByDirectory(Directory directory);

    long countBySpace(Space space);
}
