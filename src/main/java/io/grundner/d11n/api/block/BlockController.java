package io.grundner.d11n.api.block;

import io.grundner.d11n.api.block.dto.BlockRequest;
import io.grundner.d11n.api.block.dto.BlockResponse;
import io.grundner.d11n.application.block.BlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BlockController {

    private final BlockService blockService;

    @GetMapping("/documents/{documentId}/blocks")
    public List<BlockResponse> list(@PathVariable Long documentId) {
        return blockService.findByDocument(documentId).stream()
                .map(BlockResponse::from)
                .toList();
    }

    @PostMapping("/documents/{documentId}/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockResponse add(@PathVariable Long documentId, @RequestBody @Valid BlockRequest request) {
        return BlockResponse.from(blockService.add(documentId, request));
    }

    @PutMapping("/blocks/{id}")
    public BlockResponse update(@PathVariable Long id, @RequestBody @Valid BlockRequest request) {
        return BlockResponse.from(blockService.update(id, request));
    }

    @PutMapping("/documents/{documentId}/blocks")
    public List<BlockResponse> replaceAll(@PathVariable Long documentId,
                                          @RequestBody List<@Valid BlockRequest> requests) {
        return blockService.replaceAll(documentId, requests).stream()
                .map(BlockResponse::from)
                .toList();
    }

    @DeleteMapping("/blocks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        blockService.delete(id);
    }
}
