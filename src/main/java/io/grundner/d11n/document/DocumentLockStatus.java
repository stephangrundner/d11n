package io.grundner.d11n.document;

public record DocumentLockStatus(boolean locked, String lockedBy) {

    public static DocumentLockStatus free() {
        return new DocumentLockStatus(false, null);
    }

    public static DocumentLockStatus heldBy(String username) {
        return new DocumentLockStatus(true, username);
    }
}
