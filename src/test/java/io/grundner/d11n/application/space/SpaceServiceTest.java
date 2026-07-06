package io.grundner.d11n.application.space;

import io.grundner.d11n.api.error.EntityNotFoundException;
import io.grundner.d11n.domain.directory.DirectoryRepository;
import io.grundner.d11n.domain.document.DocumentRepository;
import io.grundner.d11n.domain.space.Space;
import io.grundner.d11n.domain.space.SpaceRepository;
import io.grundner.d11n.domain.user.Role;
import io.grundner.d11n.domain.user.User;
import io.grundner.d11n.infrastructure.security.SecurityContextHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpaceServiceTest {

    @Mock SpaceRepository spaceRepository;
    @Mock DocumentRepository documentRepository;
    @Mock DirectoryRepository directoryRepository;
    @Mock SecurityContextHelper securityContextHelper;

    @InjectMocks
    SpaceService spaceService;

    User owner;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setEmail("user@example.com");
        owner.setRole(Role.USER);
        when(securityContextHelper.currentUser()).thenReturn(owner);
    }

    @Test
    void create_persistsSpaceWithOwner() {
        when(spaceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Space result = spaceService.create("Engineering");

        assertThat(result.getName()).isEqualTo("Engineering");
        assertThat(result.getOwner()).isEqualTo(owner);
        verify(spaceRepository).save(result);
    }

    @Test
    void findAll_returnsOnlyOwnerSpaces() {
        Space space = new Space();
        space.setName("My Space");
        when(spaceRepository.findByOwner(owner)).thenReturn(List.of(space));

        List<Space> result = spaceService.findAll();

        assertThat(result).containsExactly(space);
    }

    @Test
    void findById_throwsWhenNotFound() {
        when(spaceRepository.findByIdAndOwner(99L, owner)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spaceService.findById(99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void delete_removesSpace() {
        Space space = new Space();
        when(spaceRepository.findByIdAndOwner(1L, owner)).thenReturn(Optional.of(space));

        spaceService.delete(1L);

        verify(spaceRepository).delete(space);
    }
}
