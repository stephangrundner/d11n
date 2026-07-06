# Architecture Overview

## Zielsetzung

Dieses Dokument beschreibt die übergeordneten Architekturprinzipien, technologischen Rahmenbedingungen und Qualitätsanforderungen des Projekts.

Die Architektur soll langfristig wartbar, verständlich, sicher und erweiterbar sein. Technische Entscheidungen müssen sich stets an den fachlichen Anforderungen orientieren und die langfristige Weiterentwicklung des Systems unterstützen.

Die fachliche Dokumentation unter `docs/` ist die primäre Quelle für Anforderungen, Geschäftsregeln und Domänenwissen.

---

# Architekturprinzipien

Die Architektur folgt den folgenden Grundprinzipien:

* Security First
* Domain Driven Design
* Test Driven Development
* Documentation Driven Development
* Clean Architecture
* Separation of Concerns
* Explicitness over Magic
* Maintainability over Short-Term Speed
* Simplicity over Complexity

Die fachliche Domäne hat stets Vorrang vor technischen Details.

Technische Implementierungen müssen die fachlichen Konzepte und Entscheidungen aus den Dokumenten unter `docs/` widerspiegeln.

---

# Projektstruktur

Das Projekt wird als Monorepo aufgebaut.

```text
/
├── docs/
├── frontend/
├── src/
├── build.gradle
├── settings.gradle
└── Dockerfile
```

## Backend

Das Backend liegt im Projekt-Root und basiert auf:

* Java 21 oder höher
* Spring Boot
* Gradle
* Lombok

Der Backend-Code befindet sich unter:

```text
src/main/java
src/test/java
```

---

## Frontend

Das Frontend liegt im Verzeichnis:

```text
frontend/
```

Technologien:

* Next.js
* React
* MUI (Material UI Core + X)
* TanStack Query
* TypeScript

Das Frontend ist als npm-Workspace organisiert. Die Präsentationskomponenten
liegen als eigenständige, baubare Bibliothek `@d11n/ui` unter
`frontend/packages/ui` und enthalten keine Routing-, API- oder Auth-Logik. Die
Next.js-App konsumiert diese Bibliothek; ihre Komponenten unter
`frontend/src/components` sind dünne Wrapper, die die Anwendungslogik ergänzen.
Details: `docs/decisions/0001-frontend-ui-component-library.md`.

Das visuelle Design folgt der Vorlage „d11n Mockups": zentrale Design-Tokens und
ein MUI-Theme in `@d11n/ui`, Schrift **Roboto**, Icons via `@mui/icons-material`
(Rounded), Tabellen via **MUI X DataGrid**. Tokens: `docs/ui/design-tokens.md`;
Entscheidung: `docs/decisions/0002-visual-design-system.md`. Noch fehlende
Backend-Felder werden vorübergehend über isolierte Mock-Daten dargestellt
(`frontend/src/lib/mockDesign.ts`).

```text
frontend/
├── packages/
│   └── ui/          # @d11n/ui — Präsentationsbibliothek (Design-System)
└── src/             # Next.js-App (konsumiert @d11n/ui)
```

Frontend und Backend werden gemeinsam entwickelt und versioniert.

---

# Deployment Architektur

Das Zielsystem wird als einzelnes Docker-Image ausgeliefert.

Der Build-Prozess erzeugt ein deploybares Artefakt, welches:

* Backend
* Frontend
* Konfiguration

enthält.

Das fertige Image wird in einer Container Registry veröffentlicht.

Die konkrete Zielplattform ist aktuell nicht Bestandteil dieser Architekturentscheidung.

---

# Programmiersprache

Die Entwicklungssprache des Projekts ist Englisch.

Folgende Artefakte werden ausschließlich in englischer Sprache erstellt:

* Quellcode
* Klassen
* Methoden
* Variablen
* Kommentare
* Tests
* API-Verträge

Die Projektdokumentation unter `docs/` wird in deutscher Sprache gepflegt.

---

# Dokumentationsgetriebene Entwicklung

Das Projekt folgt einem Documentation Driven Development Ansatz.

Vor jeder Implementierung müssen Änderungen in den Dokumenten analysiert werden.

Insbesondere gelten:

* Domain-Dokumente
* Requirements
* Accepted ADRs

als fachliche Quelle der Wahrheit.

Implementierungen dürfen diesen Dokumenten nicht widersprechen.

---

# Security

Security besitzt höchste Priorität.

Sicherheitsanforderungen müssen von Beginn an berücksichtigt werden und dürfen nicht nachträglich ergänzt werden.

## Grundsatz

Alle Endpunkte und Services sind standardmäßig geschützt.

Öffentliche Zugriffe müssen explizit freigegeben werden.

Beispiele:

* Login
* Registrierung
* Impressum
* Datenschutz
* Health Checks (falls erforderlich)

Der Default-Zustand ist:

> Deny by Default

---

## Authentifizierung

Für die Authentifizierung wird Spring Security verwendet.

Spring Security muss von Beginn an Bestandteil der Architektur sein.

Eine spätere Integration ist nicht zulässig.

---

## Autorisierung

Zugriffsrechte müssen zentral definiert werden.

Direkte Sicherheitsprüfungen in Fachlogik sind zu vermeiden.

---

## Tokenbasierte Kommunikation

Zwischen Frontend und Backend wird JWT verwendet.

Die gesamte Authentifizierung zwischen Browser und Backend erfolgt tokenbasiert.

Die konkrete Implementierung wird in separaten Sicherheitsdokumenten beschrieben.

---

# Persistenz

Die Anwendung verwendet JPA als Persistenztechnologie.

## Entwicklungsumgebung

Für lokale Entwicklung wird verwendet:

* H2 Database

Profil:

```text
dev
```

---

## Produktionsumgebung

Die Produktionsdatenbank wird zu einem späteren Zeitpunkt entschieden.

Die Architektur darf keine Annahmen treffen, die einen Datenbankwechsel erschweren.

---

# Datenbankmigrationen

Datenbankänderungen müssen versioniert erfolgen.

Für Datenbankmigrationen wird Flyway eingesetzt.

Schemaänderungen dürfen niemals manuell durchgeführt werden.

---

# Auditing

Alle Entities (User, Space, Verzeichnis, Dokument, Block) erben von `BaseEntity` und
speichern **wer und wann** sie erzeugt bzw. zuletzt geändert hat: `created_at`,
`updated_at`, `created_by`, `updated_by`. Die Felder werden automatisch über Spring
Data JPA Auditing (`@EnableJpaAuditing`, `AuditorAware<User>`) befüllt; der Auditor ist
der authentifizierte Benutzer (ohne Authentifizierung bleibt der Auditor leer).
Details: `docs/decisions/0003-auditing-and-diagram-persistence.md`.

---

# Codequalität

Das Projekt verfolgt dauerhaft einen hohen Qualitätsanspruch.

Qualität ist kein nachgelagerter Schritt, sondern Bestandteil jeder Implementierung.

---

## Lesbarkeit

Code muss für Menschen optimiert werden.

Kompakte, verständliche und wartbare Implementierungen sind zu bevorzugen.

---

## Lombok

Lombok wird verwendet, um Boilerplate-Code zu reduzieren.

Der Einsatz von Lombok soll die Lesbarkeit erhöhen und nicht verschlechtern.

---

## Entwurfsmuster

Es sind etablierte Entwurfsmuster einzusetzen.

Beispiele:

* Strategy
* Factory
* Builder
* Adapter
* Facade
* Specification
* Domain Events

Der Einsatz von Mustern muss einen fachlichen oder technischen Mehrwert liefern.

Pattern-Hopping ohne konkreten Nutzen ist zu vermeiden.

---

# Teststrategie

Das Projekt wird testgetrieben entwickelt.

Neue Funktionalität soll grundsätzlich nach dem Prinzip:

```text
Red
Green
Refactor
```

entwickelt werden.

---

## Unit Tests

Unit Tests sind verpflichtend.

Technologie:

* JUnit

Tests müssen:

* reproduzierbar
* unabhängig
* schnell ausführbar

sein.

---

## Integrations-Tests

Kritische Geschäftsprozesse und Schnittstellen müssen durch Integrations-Tests abgesichert werden.

---

# Nachvollziehbarkeit

Jede Klasse und jede öffentliche Methode muss dokumentiert werden.

Die Dokumentation soll:

* Zweck erläutern
* Verantwortlichkeiten beschreiben
* wichtige Entscheidungen begründen

Wenn möglich soll ein Bezug zu den fachlichen Dokumenten hergestellt werden.

Beispiele:

```java
/**
 * Implements the matching algorithm described in:
 *
 * docs/domain/match.md
 */
```

Dadurch bleibt die Verbindung zwischen Fachlichkeit und Implementierung langfristig nachvollziehbar.

---

# Architekturziel

Das langfristige Ziel ist eine sichere, verständliche und nachhaltig wartbare Softwarelösung.

Kurzfristige Entwicklungsgewinne dürfen niemals zu Lasten von:

* Sicherheit
* Wartbarkeit
* Testbarkeit
* Nachvollziehbarkeit
* fachlicher Konsistenz

gehen.

Die Architektur soll auch nach mehreren Jahren Weiterentwicklung klar strukturiert, verständlich und erweiterbar bleiben.
