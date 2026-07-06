package io.grundner.d11n.application.block;

import io.grundner.d11n.api.block.dto.BlockRequest;
import io.grundner.d11n.application.document.DocumentService;
import io.grundner.d11n.domain.block.Block;
import io.grundner.d11n.domain.block.BlockRepository;
import io.grundner.d11n.domain.block.BlockType;
import io.grundner.d11n.domain.block.DiagramBlock;
import io.grundner.d11n.domain.block.HeadingBlock;
import io.grundner.d11n.domain.block.TextBlock;
import io.grundner.d11n.domain.document.Document;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlockServiceTest {

    @Mock BlockRepository blockRepository;
    @Mock DocumentService documentService;

    @InjectMocks
    BlockService blockService;

    @Test
    void replaceAll_replacesManagedCollectionWithoutDuplicating() {
        Document document = new Document();
        TextBlock old1 = new TextBlock();
        old1.setContent("old text");
        old1.setDocument(document);
        old1.setPosition(0);
        HeadingBlock old2 = new HeadingBlock();
        old2.setContent("old heading");
        old2.setDocument(document);
        old2.setPosition(1);
        document.getBlocks().add(old1);
        document.getBlocks().add(old2);

        when(documentService.findById(1L)).thenReturn(document);

        List<Block> result = blockService.replaceAll(1L, List.of(
                new BlockRequest(BlockType.TEXT, "new text", null, null, null),
                new BlockRequest(BlockType.DIAGRAM, null, null, "<svg/>", "<mxfile/>")
        ));

        // exactly the two new blocks — old ones removed (orphanRemoval), not duplicated
        assertThat(result).hasSize(2);
        assertThat(document.getBlocks()).hasSize(2).containsExactlyElementsOf(result);

        assertThat(result.get(0)).isInstanceOf(TextBlock.class);
        assertThat(((TextBlock) result.get(0)).getContent()).isEqualTo("new text");
        assertThat(result.get(0).getPosition()).isZero();

        assertThat(result.get(1)).isInstanceOf(DiagramBlock.class);
        DiagramBlock diagram = (DiagramBlock) result.get(1);
        assertThat(diagram.getSvg()).isEqualTo("<svg/>");
        assertThat(diagram.getXml()).isEqualTo("<mxfile/>");
        assertThat(diagram.getPosition()).isEqualTo(1);

        assertThat(result).allSatisfy(b -> assertThat(b.getDocument()).isSameAs(document));
    }
}
