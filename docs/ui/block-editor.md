# Block-Editor

## Zielsetzung

Der Block-Editor ist die zentrale Schnittstelle zum Erstellen und Bearbeiten von Dokumenten. Er basiert auf **BlockNote** (ProseMirror-Grundlage) und bietet eine ablenkungsfreie, tastaturgesteuerte Editing-Erfahrung mit nativem Drag & Drop zur Neuanordnung von Blöcken.

---

## Slash-Commands

Tippt der Benutzer `/` in einem leeren Block oder am Zeilenende, öffnet sich ein **Dropdown-Menü** mit den verfügbaren Block-Typen:

| Befehl | Ergebnis |
|--------|----------|
| `/Heading 1` | Fügt eine H1-Überschrift ein |
| `/Heading 2` | Fügt eine H2-Überschrift ein |
| `/Heading 3` | Fügt eine H3-Überschrift ein |
| `/Paragraph` | Fügt einen Textblock ein |

Das Dropdown filtert live nach dem eingetippten Begriff. Navigation mit Pfeiltasten, Bestätigung mit Enter, Abbrechen mit Escape.

---

## @-Mentions

In jedem Textblock kann `@` gefolgt von einem Namen oder einer E-Mail-Adresse eingegeben werden. Es öffnet sich ein **Mention-Dropdown**, das live gegen die API nach passenden Benutzern sucht.

* **Benutzer**: Suche nach E-Mail-Adresse
* **Gruppen**: Suche nach Gruppenname (sobald Gruppen implementiert sind)

Eine eingefügte Mention ist ein eigenständiges, nicht editierbares Inline-Element im Text.

---

## Drag & Drop

Jeder Block besitzt einen **Drag-Handle**, der beim Hovern links neben dem Block erscheint. Blöcke können per Drag & Drop frei umsortiert werden. Diese Funktion ist nativ in BlockNote integriert und erfordert keine zusätzliche Implementierung.

---

## Technologie

* **BlockNote** (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`) als Editor-Engine (aufgebaut auf ProseMirror via Tiptap)
* **`BlockNoteSchema`** mit angepasstem `mention`-Inline-Content-Typ (`createReactInlineContentSpec`)
* **`SuggestionMenuController`** aus `@blocknote/react` für das @-Mention-Dropdown
* Natives Drag & Drop, Slash-Command-Menü und Toolbar sind Bestandteil von BlockNote

---

## Datenhaltung

Der Editor arbeitet auf dem BlockNote-Dokumentmodell (JSON). Beim Speichern wird das Dokument in die Blockliste des Backends serialisiert (ein BlockNote-Top-Level-Block = ein Backend-Block). Beim Laden wird die Blockliste in das BlockNote-Dokumentmodell deserialisiert. Details: `docs/domain/block.md`

Der Inhalt von Textblöcken wird als **BlockNote-Inline-Content-Array (JSON)** gespeichert, um Formatierungen und Mentions vollständig zu erhalten. Überschriften werden als **Klartext** gespeichert.

---

## Tastenkürzel (Editor-Modus)

| Kürzel | Aktion |
|--------|--------|
| `/` | Slash-Command-Menü öffnen |
| `@` | Mention-Menü öffnen |
| `Ctrl+B` | Fett |
| `Ctrl+I` | Kursiv |
| `Ctrl+Z` | Rückgängig |
| `Enter` | Neuer Block |
| `Backspace` am Anfang | Block-Typ zurücksetzen oder Block löschen |

---

## Offene Punkte

* Gruppen-Mentions setzen die Implementierung von Gruppen voraus.
* Callout- und Entscheidungs-Blöcke werden in einer späteren Iteration als Slash-Commands ergänzt.
