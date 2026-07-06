package io.grundner.d11n.domain.directory;

import io.grundner.d11n.domain.space.Space;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DirectoryRepository extends JpaRepository<Directory, Long> {

    List<Directory> findBySpaceAndParentIsNull(Space space);

    List<Directory> findByParent(Directory parent);

    long countBySpace(Space space);
}
