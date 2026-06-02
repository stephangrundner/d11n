package io.grundner.d11n.auth;

public final class Permissions {

    // Spaces
    public static final String SPACE_CREATE = "SPACE_CREATE";
    public static final String SPACE_WRITE  = "SPACE_WRITE";
    public static final String SPACE_DELETE = "SPACE_DELETE";

    // Documents
    public static final String DOCUMENT_CREATE = "DOCUMENT_CREATE";
    public static final String DOCUMENT_WRITE  = "DOCUMENT_WRITE";
    public static final String DOCUMENT_DELETE = "DOCUMENT_DELETE";

    // Folders
    public static final String FOLDER_WRITE  = "FOLDER_WRITE";
    public static final String FOLDER_DELETE = "FOLDER_DELETE";

    // Shares
    public static final String SHARE_CREATE = "SHARE_CREATE";
    public static final String SHARE_REVOKE = "SHARE_REVOKE";

    // Administration
    public static final String ADMIN_ROLES = "ADMIN_ROLES";
    public static final String ADMIN_USERS = "ADMIN_USERS";

    private Permissions() {}
}
