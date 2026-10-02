# Debug Android — VS Code

Configurations dans `.vscode/launch.json` (extension **React Native Tools**,
`msjsdiag.vscode-react-native`, requise) :

- **Debug Android (Emulator)** — lance sur l'émulateur actif.
- **Debug Android (Device USB)** — force le déploiement sur un appareil
  physique précis (demande l'ID du device au lancement, utile quand
  plusieurs devices/émulateurs sont détectés en même temps).

La tâche **Start Metro Bundler** (`.vscode/tasks.json`) démarre Metro
séparément : `Ctrl+Shift+P` → `Tasks: Run Task` → `Start Metro Bundler`.
Elle n'est pas liée automatiquement aux configs de debug (l'extension gère
son propre packager) ; démarrez-la manuellement seulement si vous voulez
garder un œil sur les logs Metro dans un terminal dédié.

## Lister les devices/émulateurs connectés

```bash
adb devices
```

Un device physique apparaît avec son numéro de série (ex: `R58N30ABCDE`),
un émulateur avec un nom du type `emulator-5554`.

## Lancer un AVD précis en CLI (sans Android Studio)

```bash
# Lister les AVD disponibles
emulator -list-avds

# Lancer un AVD précis
emulator -avd <nom_de_l_avd>
```

`emulator` doit être dans le `PATH` (dossier `<Android SDK>/emulator`,
généralement `%LOCALAPPDATA%\Android\Sdk\emulator` sur Windows).

## Avant de lancer le debug

**Un émulateur démarré OU un device branché (avec débogage USB activé) est
obligatoire avant de lancer une config de debug.** Sans ça, le lancement
échoue silencieusement ou reste bloqué en timeout sans message clair —
vérifiez toujours `adb devices` en premier si rien ne se passe.

## Nettoyage en cas de bundle corrompu

```bash
cd android && ./gradlew clean
cd ..
npx react-native start --reset-cache
```

## Permissions caméra (premier lancement)

`react-native-vision-camera` est déjà en place, mais la permission caméra
Android doit être accordée manuellement au premier lancement de l'app (popup
système). Si elle est refusée ou pas encore accordée, l'écran de scan reste
noir sans erreur visible : si le scan ne fonctionne pas, vérifiez d'abord les
permissions de l'app dans les réglages Android (Paramètres → Applications →
EcoScan → Autorisations → Appareil photo).
