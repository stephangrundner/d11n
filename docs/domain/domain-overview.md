# Domänenübersicht

## Zielsetzung

Dieses Dokument gibt einen Überblick über die zentralen Domänenobjekte von d11n und ihre Beziehungen. Die Details der einzelnen Objekte sind in den jeweiligen Domain-Dokumenten beschrieben.

---

## Domänenobjekte

| Objekt      | Dokument       | Kurzbeschreibung                                            |
|-------------|----------------|-------------------------------------------------------------|
| Space       | `space.md`     | Oberste Organisationseinheit für Verzeichnisse und Dokumente |
| Verzeichnis | `directory.md` | Hierarchisch strukturierbarer Container für Dokumente        |
| Dokument    | `document.md`  | Inhaltliche Einheit, bestehend aus Blöcken                   |
| Block       | `block.md`     | Kleinste inhaltliche Einheit eines Dokuments                 |
| Diagramm    | `diagram.md`   | draw.io-Diagramm, eingebunden über einen Diagramm-Block      |
| Benutzer    | `user.md`      | Natürliche Person mit einer Rolle (Benutzer oder Admin)      |
| Gruppe      | `group.md`     | Benannte Sammlung von Benutzern mit feingranularen Berechtigungen |
| Tag         | `tag.md`       | Label zur Kategorisierung von Verzeichnissen und Dokumenten  |

---

## Beziehungen

```text
Benutzer
├── hat eine Rolle (Benutzer | Admin)
└── ist Mitglied in 0..* Gruppen

Gruppe (wird von Admin verwaltet)
└── hat Zugriff auf 0..* Spaces / Verzeichnisse / Dokumente

Space
├── hat eine Sichtbarkeit (privat | Gruppe/Benutzer | extern)
├── Verzeichnis (hierarchisch, beliebig verschachtelbar)
│   ├── hat eine Sichtbarkeit (geerbt oder explizit)
│   ├── hat 0..* Tags
│   ├── Verzeichnis
│   │   └── ...
│   └── Dokument
│       ├── hat eine Sichtbarkeit (geerbt oder explizit)
│       └── hat 0..* Tags
└── Dokument
    ├── hat eine Sichtbarkeit (geerbt oder explizit)
    └── hat 0..* Tags

Dokument
└── Block (geordnete Liste)
    └── Diagramm-Block → referenziert Diagramm (draw.io-Datei)

Tag
└── zugeordnet zu 0..* Verzeichnissen und/oder Dokumenten
```

* Ein **Benutzer** hat genau eine Rolle und kann Mitglied in mehreren **Gruppen** sein.
* **Gruppen** werden von Admins verwaltet und erhalten feingranulare Zugriffsrechte auf Inhalte.
* Ein **Space** ist die oberste Ebene. Verzeichnisse und Dokumente existieren immer innerhalb eines Spaces.
* **Verzeichnisse** können Verzeichnisse und Dokumente enthalten.
* Ein **Dokument** besteht aus einer geordneten Liste von **Blöcken**.
* Ein **Diagramm-Block** referenziert die Datei eines **Diagramms** in ihrer aktuellen Version.
* **Tags** können Verzeichnissen und Dokumenten zugeordnet werden; sie sind kein eigenständiges verwaltetes Objekt.
* Die **Sichtbarkeit** vererbt sich hierarchisch von Space über Verzeichnis zum Dokument. Details: `docs/rules/business-rules.md`

---

## Sichtbarkeit

Spaces, Verzeichnisse und Dokumente haben eine **Sichtbarkeit**. Standardmäßig sind alle Inhalte privat. Die Sichtbarkeit vererbt sich hierarchisch vom Space über Verzeichnisse zu Dokumenten. Details: `docs/rules/business-rules.md`

---

## Offene Punkte

* Versionierung von Inhalten ist noch nicht definiert.
* Berechtigungsstufen innerhalb von Gruppen sind noch nicht definiert.
