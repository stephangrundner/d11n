package io.grundner.d11n.domain.block;

import io.grundner.d11n.domain.document.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlockRepository extends JpaRepository<Block, Long> {

    List<Block> findByDocumentOrderByPositionAsc(Document document);

    long countByDocument(Document document);

    void deleteAllByDocument(Document document);
}
