// Theme & tokens
export { d11nTheme, d11nTokens } from "./theme";
export { D11nThemeProvider } from "./ThemeProvider";
export type { D11nThemeProviderProps } from "./ThemeProvider";

// Icons (Material Rounded, design vocabulary)
export * as icons from "./icons";

// Shell / navigation
export { AppShell } from "./components/AppShell";
export type { AppShellProps } from "./components/AppShell";
export { MenuBar } from "./components/MenuBar";
export type { MenuBarProps, MenuBarView } from "./components/MenuBar";
export { Breadcrumb } from "./components/Breadcrumb";
export type { BreadcrumbProps, BreadcrumbItem } from "./components/Breadcrumb";
export { AppFooter } from "./components/AppFooter";

// Primitives
export { IconTile, TagChip, VisibilityChip, AvatarStack } from "./components/primitives";
export type { IconTileProps, TagChipProps, VisibilityChipProps, AvatarStackProps, Visibility, Member } from "./components/primitives";

// Content view
export { PageHeader, SortPill } from "./components/PageHeader";
export type { PageHeaderProps, SortPillProps } from "./components/PageHeader";
export { SpaceCard } from "./components/cards/SpaceCard";
export type { SpaceCardProps } from "./components/cards/SpaceCard";
export { CreateCard } from "./components/cards/CreateCard";
export type { CreateCardProps } from "./components/cards/CreateCard";
export { ContentTree } from "./components/ContentTree";
export type { ContentTreeProps, ContentRow } from "./components/ContentTree";

// Document
export { DocumentReadView } from "./components/DocumentReadView";
export type { DocumentReadViewProps } from "./components/DocumentReadView";
export { EditorStatusPill } from "./components/EditorStatusPill";
export type { EditorStatusPillProps } from "./components/EditorStatusPill";
export { BlockEditor } from "./components/editor/BlockEditor";
export type { BlockEditorProps, MentionCandidate, D11nEditorInstance } from "./components/editor/BlockEditor";

// Overlays & admin
export { SearchOverlay } from "./components/SearchOverlay";
export type { SearchOverlayProps, SearchFilter, SearchResultItem, SearchResultGroup } from "./components/SearchOverlay";
export { ShareDialog } from "./components/ShareDialog";
export type { ShareDialogProps, ShareVisibility, ShareMember } from "./components/ShareDialog";
export { SettingsDialog } from "./components/SettingsDialog";
export type { SettingsDialogProps, SettingsContext } from "./components/SettingsDialog";
export { PermissionsAdmin } from "./components/PermissionsAdmin";
export type { PermissionsAdminProps, PermGroup, PermRow, PermState, ResourceKind } from "./components/PermissionsAdmin";
