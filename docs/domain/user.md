# Benutzer

## Beschreibung

Ein **Benutzer** ist eine natürliche Person, die sich an d11n anmeldet und auf Inhalte zugreift oder diese erstellt.

---

## Rollen

Jeder Benutzer hat genau eine Rolle. Die Rolle bestimmt den Umfang seiner Berechtigungen im System.

Aktuell existieren zwei Rollen:

| Rolle       | Beschreibung                                                                 |
|-------------|------------------------------------------------------------------------------|
| **Benutzer** | Standardrolle. Kann Inhalte lesen und bearbeiten, sofern er Zugriff hat.    |
| **Admin**    | Kann zusätzlich Gruppen anlegen und systemweite Berechtigungen verwalten.   |

Weitere Rollen sind für spätere Ausbaustufen vorgesehen.

---

## Eigenschaften

* Ein Benutzer hat einen eindeutigen Identifikator.
* Ein Benutzer hat eine E-Mail-Adresse.
* Ein Benutzer hat eine Rolle.

---

## Beziehungen

* Ein Benutzer kann Mitglied in beliebig vielen **Gruppen** ([group.md](group.md)) sein.
* Ein Benutzer ist Eigentümer der von ihm erstellten Inhalte (Spaces, Verzeichnisse, Dokumente).

---

## Superuser

Es gibt genau einen **Superuser**. Er ist ein Benutzer mit der Rolle `Admin`, dessen Zugangsdaten (E-Mail und Passwort) über die Anwendungskonfiguration festgelegt werden.

Der Superuser wird beim Start der Anwendung automatisch angelegt, sofern er noch nicht existiert. Existiert bereits ein Benutzer mit der konfigurierten E-Mail-Adresse, wird dessen Rolle beim Start auf `Admin` gesetzt.

Konfiguration (Beispiel):
```
app.superuser.email=admin@example.com
app.superuser.password=changeme
```

Der Superuser stellt sicher, dass immer ein administrativer Zugang zur Anwendung besteht.

---

## Regeln

* Jeder Benutzer hat genau eine Rolle.
* Die Rolle `Admin` wird explizit vergeben; der Standard ist `Benutzer`.
* Ohne explizite Freigabe hat ein Benutzer keinen Zugriff auf Inhalte anderer Benutzer.
* Der Superuser muss vor dem Produktivbetrieb mit sicheren Zugangsdaten konfiguriert werden.

---

## Offene Punkte

* Registrierungsprozess und Einladungsmechanismus sind noch nicht definiert.
* Passwort-Policy und Authentifizierungsdetails werden in separaten Sicherheitsdokumenten beschrieben.
* Weitere Rollen und deren Berechtigungsumfang folgen in späteren Ausbaustufen.
