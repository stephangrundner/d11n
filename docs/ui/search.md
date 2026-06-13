# Suche

## Zielsetzung

Die Suche ermöglicht das schnelle Auffinden von Dokumenten und Verzeichnissen quer über alle Spaces.

---

## Sucheingabe

Die Suche basiert auf folgenden Datenquellen:

* **Inhalt**: Der Textinhalt von Dokumenten.
* **Tags**: Tags, die an Verzeichnissen oder Dokumenten vergeben wurden. Details: `docs/domain/tag.md`
* **Entscheidungs-Blöcke**: Blöcke vom Typ Entscheidung sind gezielt durchsuchbar und filterbar. Details: `docs/domain/block.md`

---

## Darstellung

Die Suche wird als **Overlay (Modal)** dargestellt. Sie überlagert die aktuelle Ansicht, ohne die Seite zu verlassen.

---

## Öffnen der Suche

Die Suche kann auf zwei Arten geöffnet werden:

* Klick auf die **Lupe** in der Menu Bar.
* Tastenkürzel **Shift+Shift** (zweimaliges Drücken von Shift, in Anlehnung an IntelliJ IDEA — „Search Everywhere").

---

## Offene Punkte

* Suchsyntax (z. B. Tag-Filter, Volltextsuche, Kombination) ist noch nicht definiert.
* Darstellung der Suchergebnisse (Gruppierung, Vorschau) ist noch nicht definiert.
* Scope der Suche (Space-übergreifend vs. aktueller Space) ist noch nicht definiert.
* Verhalten beim Klick auf ein Suchergebnis ist noch nicht definiert.
* Suchergebnisse müssen auf Inhalte begrenzt werden, auf die der Benutzer Zugriff hat (Sichtbarkeit). Details: `docs/rules/business-rules.md`
