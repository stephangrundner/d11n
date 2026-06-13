# Diagramm-Interaktion (draw.io-Integration)

## Zielsetzung

Dieses Dokument beschreibt das UI-Verhalten von Diagrammen in Dokumenten. Das fachliche Konzept ist in `docs/domain/diagram.md` beschrieben.

Die draw.io-Integration ist eine sehr wichtige Komponente: Diagramme sollen jederzeit ganz einfach angepasst werden können — vollintegriert, ohne Medienbruch.

---

## Einfügen

* Ein Diagramm wird im Editor-Modus über den **Block-Editor** als Diagramm-Block eingefügt.

---

## Verhalten im Lese-Modus

* Das Diagramm wird als **SVG** im Dokument dargestellt.
* Bei **Klick** öffnet sich das Diagramm in einer Art **Lightbox** mit **Zoomfunktion**.
* Dargestellt wird immer die Datei des Diagramms in der **aktuellen Version**.

---

## Verhalten im Editor-Modus

* Bei **Klick** auf das Diagramm öffnet sich die **draw.io-Oberfläche** zur direkten Bearbeitung.
* Nach der Bearbeitung steht das aktualisierte Diagramm im Dokument zur Verfügung.

---

## Offene Punkte

* Gestaltung der Lightbox (Schließen, Zoom-Bedienung, Vollbild) ist noch nicht definiert.
* Einbettungsart der draw.io-Oberfläche (z. B. eingebettet, Overlay) ist noch nicht definiert (technische Entscheidung, gehört in ein ADR).
* Verhalten bei gleichzeitiger Bearbeitung desselben Diagramms ist noch nicht definiert.
