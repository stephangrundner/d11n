package io.grundner.d11n.api.block.dto;

import io.grundner.d11n.domain.block.Block;
import io.grundner.d11n.domain.block.BlockType;
import io.grundner.d11n.domain.block.DiagramBlock;
import io.grundner.d11n.domain.block.HeadingBlock;
import io.grundner.d11n.domain.block.TextBlock;

public record BlockResponse(Long id, BlockType type, int position, String content, Integer headingLevel,
                            String svg, String diagramXml) {

    public static BlockResponse from(Block block) {
        return switch (block) {
            case HeadingBlock h -> new BlockResponse(h.getId(), BlockType.HEADING, h.getPosition(),
                    h.getContent(), h.getHeadingLevel(), null, null);
            case TextBlock t -> new BlockResponse(t.getId(), BlockType.TEXT, t.getPosition(),
                    t.getContent(), null, null, null);
            case DiagramBlock d -> new BlockResponse(d.getId(), BlockType.DIAGRAM, d.getPosition(),
                    null, null, d.getSvg(), d.getXml());
            default -> throw new IllegalStateException("Unknown block type: " + block.getClass());
        };
    }
}
