# Block

## Beschreibung

Ein **Block** ist die kleinste inhaltliche Einheit eines Dokuments.

Der Inhalt eines Dokuments besteht aus einer geordneten Liste von Blöcken. Blöcke werden im Editor-Modus mit dem Block-Editor erstellt, bearbeitet, angeordnet und gelöscht.

---

## Blocktypen

| Typ | Beschreibung |
|---|---|
| **Überschrift** | Strukturiert ein Dokument in Abschnitte. Ebenen H1–H3. |
| **Text** | Freier Fließtext mit Formatierungen (Fett, Kursiv) und @-Mentions. |
| **Code** | Darstellung von Quellcode oder Befehlen in Monospace-Schrift mit Syntax-Hervorhebung. |
| **Callout** | Farbiger Block mit Icon zur Hervorhebung besonderer Information. Varianten: Hinweis (blau), Erfolg (grün), Warnung (rot). |
| **Entscheidung** | Kennzeichnet eine im Dokument dokumentierte Entscheidung. Entscheidungs-Blöcke sind gezielt durchsuchbar. |
| **Diagramm** | Bindet ein draw.io-Diagramm in das Dokument ein. Details: [diagram.md](diagram.md) |

## @-Mentions

In Textblöcken können **Benutzer** und **Gruppen** via `@` erwähnt werden. Eine Mention ist ein Inline-Element mit Referenz auf den Benutzer oder die Gruppe. Details zur Editor-Interaktion: `docs/ui/block-editor.md`

---

## Beziehungen

* Ein Block gehört zu genau einem **Dokument** ([document.md](document.md)).
* Ein Diagramm-Block referenziert genau ein **Diagramm** ([diagram.md](diagram.md)).

---

## Regeln

* Blöcke haben innerhalb eines Dokuments eine definierte Reihenfolge.
* Blöcke können nur im Editor-Modus verändert werden.

---

## Offene Punkte

* Weitere Blocktypen (z. B. Tabelle, Liste, Bild) sind noch nicht spezifiziert.
* Verschachtelung von Blöcken (z. B. Callout mit Textblöcken darin) ist noch nicht definiert.
* Verschieben von Blöcken zwischen Dokumenten ist noch nicht definiert.
* Überschriften-Ebenen (H1, H2, H3 …) und deren maximale Tiefe sind noch nicht definiert.
