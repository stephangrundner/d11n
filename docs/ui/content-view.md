# Content View

## Zielsetzung

Die Content View ist die primäre Navigationsansicht von d11n. Sie stellt Inhalte als **Card-Grid** dar und wird auf drei Ebenen einheitlich verwendet:

1. **Spaces-Übersicht** — alle Spaces des Benutzers
2. **Space-Inhalt** — Verzeichnisse und Dokumente eines Spaces
3. **Verzeichnis-Inhalt** — Unterverzeichnisse und Dokumente eines Verzeichnisses

Das einheitliche Muster sorgt dafür, dass sich Benutzer auf jeder Ebene sofort zurechtfinden.

---

## Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                  ╭──────────────────────────────────────╮                  │
│                  │  🏠  📁  ·  ·  ·         🔍  ⚙️  👤  │  ← Menu Bar     │
│                  ╰──────────────────────────────────────╯                  │
│                                                                             │
│    [Titel der Ebene]                              + Neu                     │
│    ──────────────────────────────────────────────────────────────────────  │
│                                                                             │
│    ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│    │ [Icon]  [Name]       │  │ [Icon]  [Name]       │  │ [Icon]  [Name]  │  │
│    │                     │  │                     │  │                 │  │
│    │  [Metadaten]         │  │  [Metadaten]         │  │  [Metadaten]    │  │
│    │                     │  │                     │  │                 │  │
│    │  ─────────────────  │  │  ─────────────────  │  │  ─────────────  │  │
│    │  [letzte Aktivität]  │  │  [letzte Aktivität]  │  │  [letzte Akt.]  │  │
│    └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │
│                                                                             │
│    ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│    │ [Icon]  [Name]       │  │ [Icon]  [Name]       │  │  +  Neu         │  │
│    │  ...                │  │  ...                │  │   (Ghost-Card)  │  │
│    └─────────────────────┘  └─────────────────────┘  └─────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **3-spaltiges Grid** (responsiv: 2 Spalten auf mittleren, 1 Spalte auf kleinen Viewports).
* Die letzte Position im Grid ist eine **Ghost-Card** mit „+ Neu"-Aktion.
* Sortierung standardmäßig nach letzter Aktivität.

---

## Card-Inhalt je Ebene

### Spaces-Übersicht

| Element          | Inhalt                                      |
|------------------|---------------------------------------------|
| Icon             | Space-Icon (frei wählbar)                   |
| Name             | Name des Spaces                             |
| Metadaten        | Anzahl Dokumente · Anzahl Verzeichnisse     |
| Letzte Aktivität | Zeitpunkt der letzten Änderung im Space     |

### Space-Inhalt und Verzeichnis-Inhalt

Verzeichnisse und Dokumente werden gemischt im selben Grid dargestellt. Der Typ ist über das Icon erkennbar.

| Element          | Verzeichnis                              | Dokument                                |
|------------------|------------------------------------------|-----------------------------------------|
| Icon             | Ordner-Icon                              | Dokument-Icon                           |
| Name             | Name des Verzeichnisses                  | Titel des Dokuments                     |
| Metadaten        | Anzahl Unterverzeichnisse · Dokumente    | Tags                                    |
| Letzte Aktivität | Zeitpunkt der letzten Änderung           | Zeitpunkt der letzten Änderung          |

---

## Interaktion

* **Klick auf Card** — öffnet den Space, das Verzeichnis oder das Dokument.
* **Hover** — leichte Elevation / Hintergrundton als Feedback.
* **Ghost-Card „+ Neu"** — legt je nach Kontext einen neuen Space, ein neues Verzeichnis oder ein neues Dokument an.
* **„+ Neu"-Button** (oben rechts, über dem Grid) — identische Aktion wie Ghost-Card.

---

## Kontexttitel

Der Titel über dem Grid zeigt die aktuelle Ebene:

| Ebene                  | Titel              |
|------------------------|--------------------|
| Spaces-Übersicht       | „Spaces"           |
| Inhalt eines Spaces    | Name des Spaces    |
| Inhalt eines Verzeichnisses | Name des Verzeichnisses |

---

## Referenzen

* Wireframe-Grundlage: `docs/ui/wireframes/spaces-a-card-grid.md`
* Domain: `docs/domain/space.md`, `docs/domain/directory.md`, `docs/domain/document.md`
* Navigation: `docs/ui/menu-bar.md`

---

## Offene Punkte

* Verhalten bei sehr vielen Einträgen (Paginierung vs. Infinite Scroll) ist noch nicht definiert.
* Sortier- und Filteroptionen im Grid sind noch nicht spezifiziert.
* Darstellung auf kleinen Viewports / mobilen Geräten ist noch nicht definiert.
* Icon-Auswahl für Spaces (systemseitig vs. benutzerdefiniert) ist noch nicht definiert.
