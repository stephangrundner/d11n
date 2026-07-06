package io.grundner.d11n.domain.block;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

/**
 * A block embedding a draw.io diagram. The diagram is stored inline: the rendered
 * {@code svg} (with the mxfile XML embedded in its content attribute) for display,
 * and the {@code xml} (mxfile) as the editable source of truth.
 * See docs/ui/diagram-interaction.md.
 */
@Entity
@DiscriminatorValue("DIAGRAM")
@Getter
@Setter
public class DiagramBlock extends Block {

    @Column(columnDefinition = "TEXT")
    private String svg;

    @Column(name = "diagram_xml", columnDefinition = "TEXT")
    private String xml;

    @Override
    public BlockType getType() {
        return BlockType.DIAGRAM;
    }
}
