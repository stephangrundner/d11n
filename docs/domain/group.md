# Gruppe

## Beschreibung

Eine **Gruppe** ist eine benannte Zusammenfassung von Benutzern, der feingranulare Berechtigungen zugewiesen werden können.

Gruppen sind das zentrale Werkzeug, um Inhalte (Spaces, Verzeichnisse, Dokumente) für mehrere Benutzer gleichzeitig freizugeben.

---

## Eigenschaften

* Eine Gruppe hat einen eindeutigen Namen.
* Eine Gruppe enthält beliebig viele Mitglieder (**Benutzer**).

---

## Beziehungen

* Eine Gruppe wird von einem **Admin** ([user.md](user.md)) erstellt und verwaltet.
* Eine Gruppe kann Zugriff auf beliebig viele **Spaces** ([space.md](space.md)), **Verzeichnisse** ([directory.md](directory.md)) und **Dokumente** ([document.md](document.md)) erhalten.
* Ein **Benutzer** kann Mitglied in beliebig vielen Gruppen sein.

---

## Regeln

* Gruppen können ausschließlich von Admins erstellt werden.
* Berechtigungen werden an der Gruppe gesetzt, nicht am einzelnen Mitglied.
* Die Mitgliedschaft in einer Gruppe gewährt dem Benutzer die der Gruppe zugewiesenen Berechtigungen.

---

## Offene Punkte

* Konkrete Berechtigungsstufen (z. B. Lesen, Kommentieren, Bearbeiten) sind noch nicht definiert.
* Gruppen-Hierarchien oder verschachtelte Gruppen sind noch nicht definiert.
* Verwaltungsoberfläche für Gruppen ist noch nicht spezifiziert.
