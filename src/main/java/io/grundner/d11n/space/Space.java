package io.grundner.d11n.space;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Value;

import java.nio.file.Path;

@Value
public class Space {
    String id;
    String name;
    @JsonIgnore Path repoPath;
}