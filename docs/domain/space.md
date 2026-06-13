# Space

## Beschreibung

Ein **Space** ist die oberste Organisationseinheit in d11n.

Verzeichnisse und Dokumente sind auf oberster Ebene immer in einem Space organisiert. Spaces trennen voneinander unabhängige Dokumentationsbereiche (z. B. Teams, Produkte oder Themen).

---

## Eigenschaften

* Ein Space hat einen Namen.
* Ein Space hat eine **Sichtbarkeit** (Standard: privat).

---

## Beziehungen

* Ein Space enthält beliebig viele **Verzeichnisse** ([directory.md](directory.md)) auf oberster Ebene.
* Ein Space enthält beliebig viele **Dokumente** ([document.md](document.md)) auf oberster Ebene.
* Die Sichtbarkeit eines Spaces kann für **Gruppen** ([group.md](group.md)), einzelne **Benutzer** ([user.md](user.md)) oder extern (ohne Anmeldung) freigegeben werden.

---

## Regeln

* Jedes Verzeichnis und jedes Dokument gehört zu genau einem Space.
* Spaces sind die oberste Ebene der Organisation; Spaces können nicht ineinander verschachtelt werden.
* Ein Space ist standardmäßig privat.
* Die Sichtbarkeit eines Spaces vererbt sich auf alle enthaltenen Verzeichnisse und Dokumente, sofern diese keine eigene Sichtbarkeit gesetzt haben. Details: `docs/rules/business-rules.md`

---

## Offene Punkte

* Beschreibung und Icon eines Spaces sind noch nicht definiert.
* Eigentümerschaft und Übertragung eines Spaces sind noch nicht definiert.
