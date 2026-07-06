# ADR-0002: Visuelles Design-System nach „d11n Mockups"

* Status: Accepted
* Datum: 2026-06-26

## Kontext

Für d11n wurde in Claude Design ein vollständiges Hi-Fi-Mockup erstellt („d11n Mockups", 9 Screens). Die laufende App war optisch auf Standard-MUI. Das Mockup definiert eine konkrete Designsprache (Farbtokens, Roboto, Material Symbols, schwebende Menu Bar, Breadcrumb, Footer, Card-Grid für Spaces, Tabellen-/Baum-Liste für Inhalte, Lese-/Editor-Modus, draw.io, Suche, Teilen, Einstellungen, Admin-Berechtigungen).

## Entscheidung

Die App übernimmt diese Designsprache. Die Umsetzung erfolgt in der Präsentationsbibliothek `@d11n/ui` (siehe ADR-0001):

* **Tokens & Theme:** zentrale `d11nTokens` und `d11nTheme` (`frontend/packages/ui/src/theme.ts`); Werte siehe `docs/ui/design-tokens.md`.
* **Icons:** Material Symbols Rounded über `@mui/icons-material` (*Rounded*), zentral in `icons.ts`.
* **Typografie:** Roboto (im App-Layout geladen).
* **Bausteine:** `AppShell` (Menu Bar + Breadcrumb + Footer), `MenuBar` (7 Icons, Editor-Primärfarbe), `Breadcrumb`, `PageHeader`, `SpaceCard`, `CreateCard`, `ContentTree`, `DocumentReadView`, `EditorStatusPill`, `DrawioBlock`/`DrawioEditor`, `SearchOverlay`, `ShareDialog`, `SettingsDialog`, `PermissionsAdmin` (MUI X DataGrid).
* **Admin/Tabellen:** `@mui/x-data-grid`.

## Übergangsregelung (Mock-Daten)

Das Mockup zeigt Konzepte, die das Backend/die API noch nicht liefert: Tags, Sichtbarkeit, Space-Icons/Farben, Ordner-Zähler, Mitglieder/Avatare, Sortierung, Volltextsuche, Gruppen/Berechtigungen. Diese werden vorübergehend über **isolierte Mock-Daten** (`frontend/src/lib/mockDesign.ts`) dargestellt, deterministisch je id und klar als Platzhalter markiert. Echte Existenz/Navigation (Spaces, Inhalte, Dokumentblöcke, Anlegen/Umbenennen) nutzt weiterhin die API.

**draw.io ist real integriert** (kein Mock): Diagramme werden über den Block-Editor als eigener `diagram`-Block eingefügt und mit dem eingebetteten draw.io-Editor (`frontend/public/drawio/`, postMessage-Protokoll) bearbeitet. Persistiert wird als eigener **`DIAGRAM`-Block-Typ** (Spalten `svg`, `diagram_xml`) inline im Dokument — Details siehe `docs/decisions/0003-auditing-and-diagram-persistence.md`.

## Konsequenzen

* Einheitliches, markengerechtes Erscheinungsbild über alle Sichten; 1:1-Abbildung auf Bibliothekskomponenten.
* `docs/ui/content-view.md` wurde angepasst (Spaces = Grid, Inhalte = Liste; Breadcrumb + Footer), `docs/ui/menu-bar.md` präzisiert.
* Folgearbeit: Backend-Felder (Tags, Sichtbarkeit, Suche, Gruppen/Rechte) bereitstellen und Mock-Daten ersetzen; Volltextsuche real anbinden. Für draw.io später optional eine Asset-API statt Inline-Persistenz (bei großen Diagrammen).
* Bundle-Größe steigt durch DataGrid/Icons/Dialoge (akzeptiert).
