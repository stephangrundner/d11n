import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactElement } from "react";
import { D11nThemeProvider } from "../ThemeProvider";
import { SpaceCard } from "../components/cards/SpaceCard";
import { CreateCard } from "../components/cards/CreateCard";
import { ContentTree } from "../components/ContentTree";
import { MenuBar } from "../components/MenuBar";
import { Breadcrumb } from "../components/Breadcrumb";
import { SearchOverlay } from "../components/SearchOverlay";
import { ShareDialog } from "../components/ShareDialog";
import { SettingsDialog } from "../components/SettingsDialog";

const NOW = new Date().toISOString();

function renderUi(ui: ReactElement) {
  return render(<D11nThemeProvider>{ui}</D11nThemeProvider>);
}

describe("SpaceCard", () => {
  it("renders name and counts and fires onOpen", () => {
    const onOpen = vi.fn();
    renderUi(<SpaceCard name="Mein Space" documentCount={3} directoryCount={2} tags={["A"]} onOpen={onOpen} />);
    expect(screen.getByText("Mein Space")).toBeInTheDocument();
    expect(screen.getByText(/3 Dokumente · 2 Ordner/)).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Mein Space"));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe("CreateCard", () => {
  it("fires onCreate", () => {
    const onCreate = vi.fn();
    renderUi(<CreateCard label="Neuen Space anlegen" onCreate={onCreate} />);
    fireEvent.click(screen.getByText("Neuen Space anlegen"));
    expect(onCreate).toHaveBeenCalledOnce();
  });
});

describe("ContentTree", () => {
  it("renders folder + document rows and fires onOpen", () => {
    const onOpen = vi.fn();
    renderUi(
      <ContentTree
        rows={[
          { id: 1, type: "folder", name: "Zonenlogik", updatedAt: NOW, onOpen },
          { id: 2, type: "document", name: "Doku", updatedAt: NOW },
        ]}
      />
    );
    expect(screen.getByText("Zonenlogik")).toBeInTheDocument();
    expect(screen.getByText("Doku")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Zonenlogik"));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe("MenuBar", () => {
  it("disables context buttons without handlers and marks the active view", () => {
    renderUi(<MenuBar active="home" onHome={vi.fn()} onSearch={vi.fn()} />);
    expect((screen.getByLabelText("Spaces") as HTMLButtonElement).disabled).toBe(false);
    // edit/share/settings have no handlers -> disabled
    expect((screen.getByLabelText("Bearbeiten") as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows the edit-mode title on the toggle", () => {
    const onEdit = vi.fn();
    renderUi(<MenuBar editMode onEdit={onEdit} />);
    const btn = screen.getByLabelText("Bearbeitung beenden");
    fireEvent.click(btn);
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe("Breadcrumb", () => {
  it("renders all items", () => {
    renderUi(<Breadcrumb items={[{ label: "Spaces", onClick: vi.fn() }, { label: "Architektur" }]} />);
    expect(screen.getByText("Spaces")).toBeInTheDocument();
    expect(screen.getByText("Architektur")).toBeInTheDocument();
  });
});

describe("Overlays render when open", () => {
  it("SearchOverlay shows input and reacts to typing", () => {
    const onQueryChange = vi.fn();
    renderUi(<SearchOverlay open query="" onQueryChange={onQueryChange} onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText(/Suchen/);
    fireEvent.change(input, { target: { value: "Zon" } });
    expect(onQueryChange).toHaveBeenCalledWith("Zon");
  });

  it("ShareDialog renders options", () => {
    renderUi(<ShareDialog open contextLabel="Doku" value="group" onChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText("Privat")).toBeInTheDocument();
    expect(screen.getByText("Gruppen & Benutzer")).toBeInTheDocument();
    expect(screen.getByText("Extern")).toBeInTheDocument();
  });

  it("SettingsDialog renders the title field", () => {
    renderUi(<SettingsDialog open contextKind="document" title="Doku" onClose={vi.fn()} />);
    expect(screen.getByDisplayValue("Doku")).toBeInTheDocument();
    expect(screen.getAllByText("Allgemein").length).toBeGreaterThan(0);
  });
});
