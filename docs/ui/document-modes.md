# Dokument-Modi (Lese-Modus / Editor-Modus)

## Zielsetzung

Dieses Dokument beschreibt das UI-Verhalten beim Anzeigen und Bearbeiten von Dokumenten. Das fachliche Konzept der Modi ist in `docs/domain/document.md` beschrieben.

---

## Lese-Modus (Standard)

* Ein geöffnetes Dokument befindet sich standardmäßig im **Lese-Modus**.
* Der Inhalt wird ablenkungsfrei dargestellt; Bearbeitung ist nicht möglich.
* Die zentrale Navbar ist im **Light**-Erscheinungsbild.

---

## Wechsel in den Editor-Modus

Der Wechsel in den Editor-Modus erfolgt explizit über einen **Button**.

Beim Wechsel ändern sich zwei Dinge:

1. **Navbar-Farbe**: Die zentrale Navbar wechselt von Light in die **Primärfarbe**. Das ist immer der Indikator, dass aktuell ein Dokument zur Bearbeitung geöffnet ist.
2. **Block-Editor**: Das Schreiben wird aktiviert — der Block-Editor ist aktiv und der Inhalt kann bearbeitet werden.

---

## Editor-Modus

* Inhalte werden mit dem **Block-Editor** bearbeitet (ähnlich Notion oder Confluence).
* Der Benutzer soll sich ausschließlich auf den Inhalt konzentrieren können.
* Diagramm-Blöcke öffnen bei Klick die draw.io-Oberfläche (siehe `diagram-interaction.md`).

---

## Offene Punkte

* Verhalten beim Verlassen des Editor-Modus (Speichern automatisch/explizit, Verwerfen von Änderungen) ist noch nicht definiert.
* Platzierung und Gestaltung des Modus-Buttons sind noch nicht definiert.
