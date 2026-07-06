# Design-Tokens

Die visuelle Sprache von d11n basiert auf der Claude-Design-Vorlage („d11n Mockups").
Die Tokens sind in `frontend/packages/ui/src/theme.ts` als `d11nTokens` und im MUI-Theme
`d11nTheme` hinterlegt. Sie sind die einzige Quelle der Wahrheit für Farbe, Elevation und Form.

## Farben

| Token                | Wert       | Verwendung                                  |
|----------------------|------------|---------------------------------------------|
| primary              | `#1F5FC4`  | Primäraktion, aktive Sicht, Links           |
| primaryContainer     | `#E8EFFB`  | Hintergrund für Primär-Akzente, Chips        |
| primaryContainerDark | `#CFE0FB`  | Hover/Tiles                                  |
| success              | `#2E7D32`  | Erfolg, „automatisch gespeichert"           |
| error                | `#C62828`  | Fehler, Sperrzone, Löschen                  |
| info                 | `#0288D1`  | Hinweise (Vererbungs-Alert)                 |
| folder               | `#F6B73C`  | Ordner-Icon                                 |
| background           | `#F4F5F7`  | Seitenhintergrund                           |
| paper                | `#FFFFFF`  | Karten, Dialoge                             |
| surfaceAlt           | `#FAFBFC`  | Tabellenköpfe, Seitenleisten                |
| textHeading          | `#1B1B1F`  | Überschriften                               |
| textBody             | `rgba(0,0,0,.87)` | Fließtext                            |

Avatar-Palette: `#7E57C2`, `#0288D1`, `#2E7D32`, `#C62828`, `#F6B73C`, `#1F5FC4`.

## Form & Elevation

* Radien: Card **12**, Button **8** (Aktion) / **4** (Dialog-Footer), Menu-Pille **30**, Icon-Button **kreisförmig 42**.
* Schatten: `cardShadow` (dezent), `menuShadow` (Pille), `dialogShadow` (Dialog), `buttonShadow` (Primärbutton).

## Typografie & Icons

* Schrift: **Roboto** (300/400/500/700), Mono **Roboto Mono**.
* Icons: Material Symbols Rounded, umgesetzt über `@mui/icons-material` (*Rounded*-Varianten), zentral in `frontend/packages/ui/src/icons.ts`.

Siehe `docs/decisions/0002-visual-design-system.md`.
