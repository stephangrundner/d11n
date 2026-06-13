# Business Rules

Dieses Dokument enthält übergreifende Geschäftsregeln, die mehrere Domänenobjekte betreffen und keinem einzelnen Objekt zugeordnet werden können.

---

## Sichtbarkeit und Zugriffskontrolle

### Standardsichtbarkeit

Alle neu erstellten Inhalte (Spaces, Verzeichnisse, Dokumente) sind standardmäßig **privat**.

Private Inhalte sind ausschließlich für den Eigentümer sichtbar.

### Sichtbarkeitsstufen

Inhalte können auf eine der folgenden Sichtbarkeitsstufen gesetzt werden:

| Stufe | Beschreibung |
|-------|-------------|
| **Privat** | Nur der Eigentümer hat Zugriff (Standard). |
| **Gruppe / Benutzer** | Explizit freigegebene Gruppen und/oder einzelne Benutzer erhalten Zugriff. |
| **Extern** | Der Inhalt ist ohne Anmeldung öffentlich zugänglich. |

### Sichtbarkeitsvererbung

Sichtbarkeiten vererben sich hierarchisch:

```text
Space
└── Verzeichnis  (erbt vom Space, sofern nicht explizit überschrieben)
    └── Dokument  (erbt vom Verzeichnis, sofern nicht explizit überschrieben)
```

* Ein Verzeichnis erbt die Sichtbarkeit seines Spaces, wenn es keine eigene Sichtbarkeit gesetzt hat.
* Ein Dokument erbt die Sichtbarkeit seines übergeordneten Verzeichnisses (oder seines Spaces, falls es direkt im Space liegt), wenn es keine eigene Sichtbarkeit gesetzt hat.
* Eine explizit gesetzte Sichtbarkeit überschreibt die geerbte Sichtbarkeit.

### Restriktivitätsprinzip

Die Vererbung setzt die Standardsichtbarkeit eines untergeordneten Objekts. Ob und in welche Richtung diese überschrieben werden darf (nur restriktiver oder auch offener), ist noch nicht entschieden und muss in einem ADR festgelegt werden.

### Teilen

Die Sichtbarkeit eines Inhalts wird über das **Teilen-Symbol** in der Benutzeroberfläche gesteuert. Inhalte können geteilt werden:

* mit einzelnen **Benutzern** ([user.md](../domain/user.md))
* mit **Gruppen** ([group.md](../domain/group.md))
* für **Extern** (ohne Anmeldung)
