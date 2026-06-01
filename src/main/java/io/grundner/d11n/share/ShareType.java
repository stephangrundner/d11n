package io.grundner.d11n.share;

public enum ShareType {
    /** Public link — no authentication required, read-only. */
    EXTERNAL,
    /** Authenticated link — login required, read+write. */
    INTERNAL
}
