package io.grundner.d11n.domain.space;

import io.grundner.d11n.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpaceRepository extends JpaRepository<Space, Long> {

    List<Space> findByOwner(User owner);

    Optional<Space> findByIdAndOwner(Long id, User owner);
}
