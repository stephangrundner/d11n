package io.grundner.d11n.share;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShareRepository extends JpaRepository<Share, String> {

    List<Share> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    List<Share> findBySpaceIdAndResourceTypeAndResourcePath(
            String spaceId, String resourceType, String resourcePath);

    List<Share> findBySpaceIdAndResourceTypeAndResourcePathIsNull(
            String spaceId, String resourceType);
}
