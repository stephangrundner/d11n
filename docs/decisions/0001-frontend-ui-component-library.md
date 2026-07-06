# ADR-0001: Frontend-Präsentationskomponenten als `@d11n/ui`-Bibliothek

* Status: Accepted
* Datum: 2026-06-26

## Kontext

Die in `docs/ui/` beschriebene Oberfläche (schwebende Menu Bar, Content-View-Card-Grid mit Space-, Verzeichnis-, Dokument- und Ghost-Card, Block-Editor) war bisher als anwendungsgekoppelte Komponenten direkt in der Next.js-App umgesetzt (`frontend/src/components`). Diese Komponenten waren an Routing (`next/navigation`), den API-Client (`@/lib/api`) und die Authentifizierung (`@/lib/auth`) gebunden.

Dadurch existierte:

* keine klare Trennung zwischen Präsentation und Anwendungslogik,
* keine wiederverwendbare, eigenständig baubare Komponentenbibliothek,
* kein `dist`-Artefakt, das als Design-System exportiert werden kann.

Ziel ist eine saubere Trennung von Präsentation und Anwendungslogik sowie ein baubares Design-System.

## Entscheidung

Die Präsentationskomponenten werden in eine eigenständige Bibliothek **`@d11n/ui`** extrahiert.

* `frontend/` wird zu einem npm-Workspace-Root; die Bibliothek liegt unter `frontend/packages/ui`.
* `@d11n/ui` enthält ausschließlich **präsentationsorientierte** Komponenten — ohne Routing, API-Zugriffe oder Authentifizierung. Interaktionen werden über Callbacks (z. B. `onOpen`, `onCreate`) statt über Navigation abgebildet.
* Technische Grundlage bleibt **MUI** (Material UI). Das MUI-Theme wird als `d11nTheme` und `D11nThemeProvider` zur einzigen Quelle der Wahrheit für das Erscheinungsbild.
* Der Block-Editor wird als Präsentations-Shell aufgenommen: Er kapselt die BlockNote-Ansicht, das `mention`-Inline-Format und das `@`-Vorschlagsmenü. Serialisierung in Backend-Blöcke und die Datenquelle der Mentions verbleiben in der Anwendung.
* Die Bibliothek wird mit **tsup** (esbuild) nach `dist/` gebaut (ESM + Typdeklarationen). Framework-/UI-Abhängigkeiten bleiben `peerDependencies` und werden von der Anwendung bereitgestellt.
* Die Next.js-App **konsumiert** `@d11n/ui`: Die bisherigen Komponenten in `frontend/src/components` werden zu dünnen Wrappern, die Routing/API/Auth ergänzen und die Präsentationskomponenten rendern.

## Konsequenzen

* Präsentation ist von Anwendungslogik getrennt und unabhängig testbar (Vitest-Smoke-Tests in `@d11n/ui`).
* Das `dist`-Artefakt ermöglicht den späteren Export als Design-System (z. B. via `/design-sync`).
* Die App benötigt vor `type-check`/`build` einen gebauten Stand von `@d11n/ui` (Build-Reihenfolge: zuerst die Bibliothek).
* Neue UI-Bausteine entstehen künftig in `@d11n/ui`; anwendungsspezifische Verdrahtung bleibt in der App.
* MUI/Emotion ist ein Theme-basiertes System: Komponenten müssen innerhalb des `D11nThemeProvider` gerendert werden; Styling erfolgt über Theme und `sx`-Props, nicht über statische CSS-Klassen.
