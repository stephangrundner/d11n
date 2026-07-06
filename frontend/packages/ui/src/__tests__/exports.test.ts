import { describe, it, expect } from "vitest";
import * as ui from "../index";

// BlockNote/ProseMirror, the DataGrid and the full-screen draw.io editor do not
// render reliably under jsdom, so we assert the public surface here rather than
// mounting them. Behavioral coverage lives in the consuming app.
describe("@d11n/ui public API", () => {
  it("exports every component", () => {
    for (const name of [
      "D11nThemeProvider",
      "AppShell",
      "MenuBar",
      "Breadcrumb",
      "AppFooter",
      "IconTile",
      "TagChip",
      "VisibilityChip",
      "AvatarStack",
      "PageHeader",
      "SortPill",
      "SpaceCard",
      "CreateCard",
      "ContentTree",
      "DocumentReadView",
      "EditorStatusPill",
      "BlockEditor",
      "SearchOverlay",
      "ShareDialog",
      "SettingsDialog",
      "PermissionsAdmin",
    ]) {
      expect(typeof (ui as Record<string, unknown>)[name]).toBe("function");
    }
    expect(ui.d11nTheme).toBeTypeOf("object");
    expect(ui.d11nTokens.primary).toBe("#1F5FC4");
  });
});
