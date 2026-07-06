package io.grundner.d11n.application.block;

import io.grundner.d11n.api.error.EntityNotFoundException;
import io.grundner.d11n.application.document.DocumentService;
import io.grundner.d11n.domain.block.Block;
import io.grundner.d11n.domain.block.BlockRepository;
import io.grundner.d11n.api.block.dto.BlockRequest;
import io.grundner.d11n.domain.block.DiagramBlock;
import io.grundner.d11n.domain.block.HeadingBlock;
import io.grundner.d11n.domain.block.TextBlock;
import io.grundner.d11n.domain.document.Document;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BlockService {

    private final BlockRepository blockRepository;
    private final DocumentService documentService;

    @Transactional(readOnly = true)
    public List<Block> findByDocument(Long documentId) {
        Document document = documentService.findById(documentId);
        return blockRepository.findByDocumentOrderByPositionAsc(document);
    }

    public Block add(Long documentId, BlockRequest request) {
        Document document = documentService.findById(documentId);
        int nextPosition = (int) blockRepository.countByDocument(document);
        Block block = buildBlock(request);
        block.setDocument(document);
        block.setPosition(nextPosition);
        return blockRepository.save(block);
    }

    public Block update(Long blockId, BlockRequest request) {
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new EntityNotFoundException("Block not found: " + blockId));
        // verify access via document → space
        documentService.findById(block.getDocument().getId());

        if (block instanceof HeadingBlock h) {
            h.setContent(request.content());
            if (request.headingLevel() != null) h.setHeadingLevel(request.headingLevel());
        } else if (block instanceof TextBlock t) {
            t.setContent(request.content());
        } else if (block instanceof DiagramBlock d) {
            d.setSvg(request.svg());
            d.setXml(request.diagramXml());
        }
        return blockRepository.save(block);
    }

    public void delete(Long blockId) {
        Block block = blockRepository.findById(blockId)
                .orElseThrow(() -> new EntityNotFoundException("Block not found: " + blockId));
        documentService.findById(block.getDocument().getId());
        blockRepository.delete(block);
    }

    public List<Block> replaceAll(Long documentId, List<BlockRequest> requests) {
        Document document = documentService.findById(documentId);
        // Replace through the managed collection: clearing it triggers orphanRemoval
        // (deletes old blocks) and adding new ones cascades the inserts. A bulk
        // delete + save loop would leave the still-managed collection to re-sync the
        // old blocks on flush, duplicating content.
        document.getBlocks().clear();
        for (int i = 0; i < requests.size(); i++) {
            Block block = buildBlock(requests.get(i));
            block.setDocument(document);
            block.setPosition(i);
            document.getBlocks().add(block);
        }
        return document.getBlocks();
    }

    private Block buildBlock(BlockRequest req) {
        return switch (req.type()) {
            case HEADING -> {
                HeadingBlock h = new HeadingBlock();
                h.setContent(req.content());
                h.setHeadingLevel(req.headingLevel() != null ? req.headingLevel() : 1);
                yield h;
            }
            case TEXT -> {
                TextBlock t = new TextBlock();
                t.setContent(req.content());
                yield t;
            }
            case DIAGRAM -> {
                DiagramBlock d = new DiagramBlock();
                d.setSvg(req.svg());
                d.setXml(req.diagramXml());
                yield d;
            }
        };
    }
}
