# Diagramm

## Beschreibung

Ein **Diagramm** ist eine draw.io-Zeichnung, die über einen Diagramm-Block in ein Dokument eingebunden wird.

Die draw.io-Integration ist eine sehr wichtige Komponente von d11n: Diagramme sollen jederzeit ganz einfach angepasst werden können — vollintegriert, ohne die Anwendung zu verlassen.

---

## Darstellung und Bearbeitung

* Im **Lese-Modus** wird ein Diagramm als **SVG** dargestellt. Bei Klick wird es in einer Lightbox mit Zoomfunktion betrachtet.
* Im **Editor-Modus** öffnet sich bei Klick auf das Diagramm die **draw.io-Oberfläche** zur direkten Bearbeitung.

Das UI-Verhalten ist im Detail in `docs/ui/diagram-interaction.md` beschrieben.

---

## Beziehungen

* Ein Diagramm wird über einen Diagramm-**Block** ([block.md](block.md)) in ein Dokument eingebunden.
* Der Diagramm-Block referenziert die **Datei** des Diagramms.

---

## Regeln

* Es wird immer die Datei des Diagramms **in der aktuellen Version** referenziert. Die Darstellung im Dokument zeigt damit stets den aktuellen Stand des Diagramms.
* Diagramme können ausschließlich im Editor-Modus eines Dokuments bearbeitet werden.

---

## Offene Punkte

* Versionierung von Diagrammdateien (Historie, Wiederherstellung) ist noch nicht definiert.
* Wiederverwendung eines Diagramms in mehreren Dokumenten ist noch nicht definiert.
* Speicherort und Format der Diagrammdateien sind noch nicht definiert (technische Entscheidung, gehört in ein ADR).
