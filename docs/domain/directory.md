# Verzeichnis

## Beschreibung

Ein **Verzeichnis** ist ein Container zur Strukturierung von Dokumenten innerhalb eines Spaces.

Verzeichnisse sind selbst **hierarchisch strukturierbar**: Ein Verzeichnis kann Unterverzeichnisse enthalten, die wiederum Unterverzeichnisse enthalten können.

---

## Eigenschaften

* Ein Verzeichnis hat einen Namen.
* Ein Verzeichnis hat eine **Sichtbarkeit** (Standard: geerbt vom übergeordneten Space oder Verzeichnis).
* Ein Verzeichnis kann beliebig viele **Tags** ([tag.md](tag.md)) haben.

---

## Beziehungen

* Ein Verzeichnis gehört zu genau einem **Space** ([space.md](space.md)).
* Ein Verzeichnis liegt entweder auf oberster Ebene eines Spaces oder in genau einem übergeordneten Verzeichnis.
* Ein Verzeichnis enthält beliebig viele Unterverzeichnisse und **Dokumente** ([document.md](document.md)).
* Die Sichtbarkeit eines Verzeichnisses kann für **Gruppen** ([group.md](group.md)), einzelne **Benutzer** ([user.md](user.md)) oder extern (ohne Anmeldung) freigegeben werden.

---

## Regeln

* Die Verzeichnishierarchie ist ein Baum: Jedes Verzeichnis hat höchstens ein übergeordnetes Verzeichnis; Zyklen sind ausgeschlossen.
* Ein Verzeichnis kann seinen Space nicht verlassen; verschachtelte Verzeichnisse gehören immer zum Space des Wurzelverzeichnisses.
* Ein Verzeichnis erbt die Sichtbarkeit seines übergeordneten Spaces oder Verzeichnisses, sofern keine eigene Sichtbarkeit gesetzt ist.
* Die Sichtbarkeit eines Verzeichnisses vererbt sich auf alle enthaltenen Dokumente und Unterverzeichnisse. Details: `docs/rules/business-rules.md`

---

## Offene Punkte

* Maximale Verschachtelungstiefe (falls begrenzt) ist nicht definiert.
* Verhalten beim Verschieben/Löschen von Verzeichnissen (inkl. Inhalt) ist nicht definiert.
