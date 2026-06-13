# Produktvision

## Name

**d11n** steht für *documentation* — 11 Zeichen zwischen `d` und `n` (Numeronym, analog zu i18n/l10n).

---

## Leitidee

d11n ist eine Software mit einem einzigen Ziel:

> **Kontinuierliches Dokumentieren.**

Dokumentation soll kein lästiger, nachgelagerter Schritt sein, sondern ein selbstverständlicher, fortlaufender Teil der Arbeit.

---

## Anspruch an die Benutzererfahrung

Die Software soll so angenehm in der Verwendung sein, dass man **sehr gerne** mit ihr arbeitet.

Daraus folgt:

* Die Bedienung muss leichtgängig und ablenkungsfrei sein.
* Der Benutzer soll sich beim Schreiben ausschließlich auf den **Inhalt** konzentrieren können.
* Wiederkehrende Tätigkeiten (z. B. das Anpassen von Diagrammen) müssen ohne Medienbrüche direkt in der Anwendung möglich sein.

---

## Kernkonzepte

### Block-Editor

Dokumentiert wird — ähnlich wie in Notion oder Confluence — mit einem **Block-Editor**. Inhalte bestehen aus Blöcken, die der Benutzer frei aneinanderreiht.

### Lese-Modus als Standard

Dokumente sind standardmäßig im **Lese-Modus**. In den **Editor-Modus** wird explizit per Button gewechselt. Details: `docs/ui/document-modes.md`

### Vollintegrierte Diagramme (draw.io)

Eine sehr wichtige Komponente ist die Integration von **draw.io**. Diagramme werden als Block eingefügt, im Lese-Modus als SVG dargestellt und im Editor-Modus direkt in der draw.io-Oberfläche bearbeitet — vollintegriert, ohne die Anwendung zu verlassen. Details: `docs/ui/diagram-interaction.md`

### Organisation in Spaces

Dokumente liegen in hierarchisch strukturierbaren **Verzeichnissen**. Verzeichnisse und Dokumente sind auf oberster Ebene in sogenannten **Spaces** organisiert. Details: `docs/domain/`

### Card-basierte Darstellung

Spaces werden als **Card-Grid** dargestellt. Dieselbe Darstellungsform gilt einheitlich auch für die Inhaltsansicht eines Spaces oder Verzeichnisses: Unterverzeichnisse und Dokumente werden ebenfalls als Cards präsentiert. Details: `docs/ui/content-view.md`

### Bewusst keine Sidebar

d11n verzichtet **bewusst** auf Sidebars. Die Benutzeroberfläche bleibt damit maximal aufgeräumt und der Inhalt steht immer im Vordergrund.

### Frei schwebende Menu Bar

Das einzige dauerhaft sichtbare Steuerelement ist eine **frei schwebende Menu Bar** am oberen Rand der Anwendung (zentriert).

Die Menu Bar enthält zwei Arten von Buttons:

* **Kontext-unabhängige Buttons**: immer sichtbar und immer gleich (z. B. Suche, Konto).
* **Kontextsensitive Buttons**: hängen von der aktiven Sicht ab. Beispiel: Ein Zahnrad-Button öffnet die Einstellungen des jeweils aktiven Kontexts — in einem Dokument die Dokumenteinstellungen, in einem Verzeichnis die Verzeichniseinstellungen, in einem Space die Space-Einstellungen.

Details: `docs/ui/menu-bar.md`

### Tags

Verzeichnisse und Dokumente können mit **Tags** versehen werden. Tags sind gemeinsam mit dem Inhalt die Basis der Suche.

### Suche

Die Suche wird als **Overlay (Modal)** dargestellt. Sie ist erreichbar:

* über die **Lupe** in der Menu Bar,
* per Tastenkürzel **Shift+Shift** (in Anlehnung an IntelliJ IDEA).

Details: `docs/ui/search.md`

### Rollen und Berechtigungen

Es gibt zunächst zwei Rollen: **Benutzer** und **Admins**. Weitere Rollen sind für spätere Ausbaustufen vorgesehen.

Admins können **Gruppen** anlegen. An Gruppen lassen sich feingranulare Berechtigungen vergeben.

### Sichtbarkeit und Teilen

Spaces, Ordner und Dokumente haben eine **Sichtbarkeit**. Standardmäßig sind alle Inhalte **privat**.

Die Sichtbarkeit kann über das **Teilen-Symbol** geändert werden. Mögliche Sichtbarkeiten:

* **Privat** (Standard) — nur der Eigentümer hat Zugriff.
* **Gruppen / spezifische Benutzer** — Inhalte werden gezielt für ausgewählte Gruppen und/oder einzelne Benutzer freigegeben.
* **Extern** — Inhalte sind ohne Anmeldung öffentlich zugänglich.

Sichtbarkeiten **vererben sich** hierarchisch: vom Space über Ordner zu Dokumenten. Ein Dokument erbt die Sichtbarkeit des übergeordneten Ordners bzw. Spaces, sofern sie nicht explizit überschrieben wird.

---

## Abgrenzung

Dieses Dokument beschreibt die Produktvision und ist gemäß `CLAUDE.md` **kein Implementierungstreiber**. Verbindliche fachliche Anforderungen befinden sich in `docs/domain/` und in akzeptierten ADRs.

---

## Offene Punkte

* Weitere Beschreibung zum Projekt folgt (Zusagen des Product Owners ausstehend).
