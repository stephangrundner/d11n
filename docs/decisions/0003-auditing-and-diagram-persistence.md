# ADR-0003: JPA-Auditing & Diagramm-Persistenz

* Status: Accepted
* Datum: 2026-06-26

## Kontext

Zwei Anforderungen:

1. Für **alle** Entities soll nachvollziehbar sein, **wer/wann** sie erzeugt und **wer/wann** sie zuletzt geändert hat.
2. Diagramme (draw.io) wurden übergangsweise als Hack inline in einem TEXT-Block gespeichert (Marker-Objekt `{__d11n:"diagram",…}`). Sie sollen sauber persistiert werden, mit passenden Endpoints.

Alle strukturierten Daten liegen bereits in JPA/H2; es gibt **keine** Datei-basierte Persistenz (nur statische Assets wie die eingebettete draw.io-App unter `public/`).

## Entscheidung

### Auditing
- `BaseEntity` (geerbt von User, Space, Directory, Document, Block) trägt: `createdAt`, `updatedAt` (`@CreatedDate`/`@LastModifiedDate`) sowie `createdBy`, `updatedBy` (`@CreatedBy`/`@LastModifiedBy`) als **`String` (E-Mail)** — kein `@ManyToOne`/keine FK.
- Aktiviert über `JpaAuditingConfig` (`@EnableJpaAuditing`) mit `AuditorAware<String>`, der die E-Mail direkt aus dem `SecurityContext`-Principal liest. **Wichtig:** kein DB-Query im Auditor — ein Query (z. B. `findByEmail`) würde während des Flush einen re-entranten Flush auslösen und den Request abbrechen (führte zu 401 beim Speichern). Ohne Auth (Startup-Superuser, Selbstregistrierung) bleibt der Auditor leer ⇒ `created_by/updated_by` null.
- Audit-Infos werden in `SpaceResponse`, `DirectoryResponse`, `DocumentResponse` ausgegeben (Zeitpunkte + Auditor-E-Mail).

### Diagramme als eigener Block-Typ
- Neuer `BlockType.DIAGRAM` mit Entity `DiagramBlock` (Single-Table-Vererbung, Diskriminator `DIAGRAM`), Spalten `svg` und `diagram_xml` (beide `TEXT`).
- Persistenz **inline im Dokument** (Diagramm ist Dokument-Inhalt, kein separates Asset): `svg` (gerendert, mit eingebettetem XML im content-Attribut) für die Anzeige, `xml` (mxfile) als bearbeitbare Quelle.
- **Endpoints** (bestehende Block-Endpoints, jetzt DIAGRAM-fähig): `PUT /api/documents/{id}/blocks` (Dokument speichern) und `PUT /api/blocks/{id}` (einzelnes Diagramm aktualisieren).
- Schemaänderungen über Flyway `V2__audit_and_diagram.sql` (`ddl-auto=validate`).

### Frontend
- Diagramm-Block (BlockNote, `frontend/packages/ui/.../editor/DiagramBlock.tsx`) serialisiert als `DIAGRAM` (svg + diagramXml) statt Inline-Marker.
- Nach Speichern im draw.io-Editor wird das neue SVG sofort angezeigt (`editor.updateBlock`); bei **Abbrechen** bleiben die Block-Props unverändert ⇒ letzte Version bleibt sichtbar.

## Konsequenzen

- Vollständige Herkunfts-/Änderungsnachverfolgung für alle Entities.
- Diagramme sind erstklassige, sauber persistierte Blöcke; kein TEXT-Marker-Hack mehr.
- EAGER-Auditor-Assoziationen erzeugen zusätzliche Joins (für die App-Größe vernachlässigbar).
- Großes SVG liegt inline in `blocks`; bei Bedarf später Auslagerung in eine Asset-API (separates ADR).
- Produktions-DB weiterhin offen; Migration ist DB-portabel gehalten.
