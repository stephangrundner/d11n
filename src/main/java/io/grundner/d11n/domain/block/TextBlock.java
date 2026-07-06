package io.grundner.d11n.domain.block;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("TEXT")
@Getter
@Setter
public class TextBlock extends Block {

    @Column(columnDefinition = "TEXT")
    private String content;

    @Override
    public BlockType getType() {
        return BlockType.TEXT;
    }
}
