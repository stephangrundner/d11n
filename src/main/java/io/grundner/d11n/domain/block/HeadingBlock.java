package io.grundner.d11n.domain.block;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("HEADING")
@Getter
@Setter
public class HeadingBlock extends Block {

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "heading_level")
    private int headingLevel = 1;

    @Override
    public BlockType getType() {
        return BlockType.HEADING;
    }
}
