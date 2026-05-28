package io.grundner.d11n.space;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.DumperOptions;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SpaceSettingsService {

    private static final String SETTINGS_FILE = "settings.yml";

    private final SpaceService spaceService;

    /**
     * Reads settings.yml from the space repository root.
     * Returns defaults silently on any error (missing file, malformed YAML, etc.)
     * so the UI is never broken by a bad settings file.
     */
    public SpaceSettings getSettings(String spaceId) {
        try {
            Space space = spaceService.findById(spaceId).orElseThrow();
            Path file = space.getRepoPath().resolve(SETTINGS_FILE);
            if (!Files.exists(file)) return new SpaceSettings();

            Yaml yaml = new Yaml();
            try (var reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                Map<?, ?> map = yaml.load(reader);
                if (map == null) return new SpaceSettings();

                SpaceSettings settings = new SpaceSettings();
                settings.setName(asString(map.get("name")));
                settings.setDescription(asString(map.get("description")));
                return settings;
            }
        } catch (Exception e) {
            return new SpaceSettings();
        }
    }

    public SpaceSettings saveSettings(String spaceId, SpaceSettings settings) throws IOException, GitAPIException {
        var repo = spaceService.openRepository(spaceId);

        Map<String, Object> map = new LinkedHashMap<>();
        if (settings.getName() != null && !settings.getName().isBlank())
            map.put("name", settings.getName().strip());
        if (settings.getDescription() != null && !settings.getDescription().isBlank())
            map.put("description", settings.getDescription().strip());

        DumperOptions opts = new DumperOptions();
        opts.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK);
        String content = map.isEmpty()
                ? "# d11n space settings\n"
                : new Yaml(opts).dump(map);

        repo.writeBinaryAndCommit(SETTINGS_FILE, content.getBytes(StandardCharsets.UTF_8),
                "Update space settings", "d11n", "d11n@localhost");

        return settings;
    }

    private static String asString(Object value) {
        return value instanceof String s ? s.isBlank() ? null : s.strip() : null;
    }
}
