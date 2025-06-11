#define MyAppName "Conversor de Imagens AVIF/WebP"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Converter Imagem"
#define MyAppURL "https://sua-url.com/"
#define MyAppExeName "Conversor de Imagens AVIFWebP.exe"
#define MyAppIcoName "icone.ico"

[Setup]
; Obrigatório
AppId={{DDABA647-8958-49AF-A4F8-7A8B011E9292}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DisableProgramGroupPage=yes
; Configurações para remover arquivos temporários:
;Uninstallable=yes
;UninstallFilesDir={app}\uninst

; Configuração de interface
OutputDir=dist
OutputBaseFilename=Conversor-AVIF-WebP-Instalador
SetupIconFile=assets\{#MyAppIcoName}
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "portugues"; MessagesFile: "compiler:Languages\Portuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "dist\win-unpacked\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
