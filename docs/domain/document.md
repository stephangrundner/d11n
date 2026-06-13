# Dokument

## Beschreibung

Ein **Dokument** ist die zentrale inhaltliche Einheit in d11n. In Dokumenten wird dokumentiert.

Der Inhalt eines Dokuments besteht aus einer geordneten Liste von **Blöcken**, die mit einem Block-Editor (ähnlich Notion oder Confluence) bearbeitet werden. Der Benutzer soll sich beim Schreiben ausschließlich auf den Inhalt konzentrieren können.

---

## Modi

Ein geöffnetes Dokument befindet sich immer in genau einem von zwei Modi:

* **Lese-Modus** (Standard): Das Dokument wird angezeigt, kann aber nicht verändert werden.
* **Editor-Modus**: Der Block-Editor ist aktiv, das Dokument kann bearbeitet werden.

Der Wechsel in den Editor-Modus erfolgt explizit per Button. Das UI-Verhalten beim Moduswechsel ist in `docs/ui/document-modes.md` beschrieben.

---

## Eigenschaften

* Ein Dokument hat einen Titel.
* Ein Dokument hat einen Inhalt in Form einer geordneten Liste von Blöcken.
* Ein Dokument hat eine **Sichtbarkeit** (Standard: geerbt vom übergeordneten Verzeichnis oder Space).
* Ein Dokument kann beliebig viele **Tags** ([tag.md](tag.md)) haben.

---

## Beziehungen

* Ein Dokument gehört zu genau einem **Space** ([space.md](space.md)).
* Ein Dokument liegt entweder auf oberster Ebene eines Spaces oder in genau einem **Verzeichnis** ([directory.md](directory.md)).
* Ein Dokument besteht aus beliebig vielen **Blöcken** ([block.md](block.md)).
* Die Sichtbarkeit eines Dokuments kann für **Gruppen** ([group.md](group.md)), einzelne **Benutzer** ([user.md](user.md)) oder extern (ohne Anmeldung) freigegeben werden.

---

## Regeln

* Ein Dokument ist nach dem Öffnen standardmäßig im Lese-Modus.
* Inhaltliche Änderungen sind ausschließlich im Editor-Modus möglich.
* Ein Dokument erbt die Sichtbarkeit seines übergeordneten Verzeichnisses oder Spaces, sofern keine eigene Sichtbarkeit gesetzt ist. Details: `docs/rules/business-rules.md`

---

## Offene Punkte

* Versionierung von Dokumenten ist noch nicht definiert.
* Metadaten (Autor, Erstellungs-/Änderungsdatum) sind noch nicht definiert.
* Gleichzeitiges Bearbeiten durch mehrere Benutzer ist noch nicht definiert.
