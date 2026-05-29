package io.grundner.d11n.git;

import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.util.LinkedHashMap;
import java.util.Map;

public class FrontmatterParser {

    private static final String DELIMITER = "---";

    public record ParseResult(Map<String, Object> frontmatter, String body) {}

    public static ParseResult parse(String rawContent) {
        if (rawContent == null || !rawContent.startsWith(DELIMITER + "\n")) {
            return new ParseResult(Map.of(), rawContent != null ? rawContent : "");
        }
        int closeIndex = rawContent.indexOf("\n" + DELIMITER, DELIMITER.length());
        if (closeIndex == -1) {
            return new ParseResult(Map.of(), rawContent);
        }
        String yaml = rawContent.substring(DELIMITER.length() + 1, closeIndex);
        String body = rawContent.substring(closeIndex + DELIMITER.length() + 1).stripLeading();

        Yaml snakeYaml = new Yaml();
        Map<String, Object> fm = snakeYaml.load(yaml);
        return new ParseResult(fm != null ? fm : Map.of(), body);
    }

    public static String serialize(Map<String, Object> frontmatter, String body) {
        if (frontmatter == null || frontmatter.isEmpty()) {
            return body != null ? body : "";
        }
        DumperOptions opts = new DumperOptions();
        opts.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
        opts.setIndent(2);
        Yaml snakeYaml = new Yaml(opts);
        String yaml = snakeYaml.dump(new LinkedHashMap<>(frontmatter));
        return DELIMITER + "\n" + yaml + DELIMITER + "\n\n" + (body != null ? body : "");
    }
}