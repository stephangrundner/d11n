package io.grundner.d11n.api.block.dto;

import io.grundner.d11n.domain.block.BlockType;
import jakarta.validation.constraints.NotNull;

/**
 * @param type         block type
 * @param content      text/heading content (null for diagrams)
 * @param headingLevel heading level (HEADING only)
 * @param svg          rendered diagram SVG (DIAGRAM only)
 * @param diagramXml   diagram mxfile XML source (DIAGRAM only)
 */
public record BlockRequest(@NotNull BlockType type, String content, Integer headingLevel, String svg, String diagramXml) {
}
