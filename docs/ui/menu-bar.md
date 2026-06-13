# Menu Bar

## Zielsetzung

Die Menu Bar ist das einzige dauerhaft sichtbare Steuerelement der Anwendung. d11n verzichtet bewusst auf Sidebars; die gesamte Navigation und Kontextsteuerung konzentriert sich in der Menu Bar.

---

## Position und Darstellung

* Die Menu Bar **schwebt frei** am oberen Rand der Anwendung.
* Sie ist **zentriert** ausgerichtet.
* Sie überlagert den Inhalt (kein reservierter Layout-Bereich).

---

## Button-Arten

### Kontext-unabhängige Buttons

Diese Buttons sind immer sichtbar und verhalten sich unabhängig vom aktiven Kontext gleich.

Beispiele:
* Lupe (Suche öffnen)
* Konto

### Kontextsensitive Buttons

Diese Buttons passen ihr Verhalten an den aktiven Kontext an.

| Aktiver Kontext | Zahnrad-Button                          | Teilen-Symbol                          |
|-----------------|-----------------------------------------|----------------------------------------|
| Space           | Öffnet Einstellungen des Space          | Öffnet Sichtbarkeit des Space          |
| Verzeichnis     | Öffnet Einstellungen des Verzeichnisses | Öffnet Sichtbarkeit des Verzeichnisses |
| Dokument        | Öffnet Einstellungen des Dokuments      | Öffnet Sichtbarkeit des Dokuments      |

Kontextsensitive Buttons werden ein- oder ausgeblendet, je nachdem ob sie im aktiven Kontext sinnvoll sind.

### Teilen-Symbol

Das Teilen-Symbol steuert die **Sichtbarkeit** des jeweils aktiven Inhalts. Ein Klick öffnet ein Overlay, in dem die Sichtbarkeit gesetzt und Benutzer oder Gruppen eingeladen werden können.

Mögliche Sichtbarkeitsstufen: Privat · Gruppe/Benutzer · Extern. Details: `docs/rules/business-rules.md`

---

## Zusammenhang mit Dokument-Modi

Im **Editor-Modus** eines Dokuments wechselt die Navbar-Farbe von Light zur Primärfarbe als Indikator. Details: `docs/ui/document-modes.md`

---

## Offene Punkte

* Vollständige Liste aller Buttons (kontext-unabhängig und kontextsensitiv) ist noch nicht definiert.
* Verhalten auf kleinen Bildschirmen / mobilen Viewports ist noch nicht definiert.
* Animation und Übergänge beim Kontextwechsel sind noch nicht definiert.
