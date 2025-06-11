# Script de Instalação para Conversor de Imagens AVIF/WebP
# Este script instala o aplicativo na pasta Arquivos de Programas e cria atalhos

# Verificar permissões de administrador
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
    Write-Host "Este script precisa ser executado como administrador." -ForegroundColor Red
    Write-Host "Por favor, clique com o botão direito no arquivo e selecione 'Executar como administrador'." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit
}

# Caminho de instalação
$appName = "Conversor de Imagens AVIF-WebP"
$installPath = "$env:ProgramFiles\$appName"
$sourceFolder = "$PSScriptRoot\dist\win-unpacked"

# Verificação
if (-not (Test-Path $sourceFolder)) {
    Write-Host "Pasta de origem não encontrada: $sourceFolder" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

# Iniciar instalação
Write-Host "Instalando $appName..." -ForegroundColor Cyan
Write-Host "Pasta de instalação: $installPath" -ForegroundColor Gray

# Criar pasta de instalação se não existir
if (-not (Test-Path $installPath)) {
    New-Item -Path $installPath -ItemType Directory -Force | Out-Null
    Write-Host "Pasta de instalação criada." -ForegroundColor Green
} else {
    Write-Host "Pasta de instalação já existe. Ela será atualizada." -ForegroundColor Yellow
}

# Copiar arquivos do aplicativo
Write-Host "Copiando arquivos do aplicativo..." -ForegroundColor Cyan
try {
    Copy-Item -Path "$sourceFolder\*" -Destination $installPath -Recurse -Force
    Write-Host "Arquivos copiados com sucesso." -ForegroundColor Green
} catch {
    Write-Host "Erro ao copiar arquivos: $_" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit
}

# Criar atalho na Área de Trabalho
Write-Host "Criando atalho na Área de Trabalho..." -ForegroundColor Cyan
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\$appName.lnk")
$Shortcut.TargetPath = "$installPath\Conversor de Imagens AVIFWebP.exe"
$Shortcut.IconLocation = "$installPath\Conversor de Imagens AVIFWebP.exe,0"
$Shortcut.Description = "Conversor de Imagens AVIF e WebP"
$Shortcut.WorkingDirectory = $installPath
$Shortcut.Save()
Write-Host "Atalho criado na Área de Trabalho." -ForegroundColor Green

# Criar atalho no Menu Iniciar
Write-Host "Criando atalho no Menu Iniciar..." -ForegroundColor Cyan
$startMenuPath = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs"
$startMenuFolder = "$startMenuPath\$appName"
if (-not (Test-Path $startMenuFolder)) {
    New-Item -Path $startMenuFolder -ItemType Directory -Force | Out-Null
}
$Shortcut = $WshShell.CreateShortcut("$startMenuFolder\$appName.lnk")
$Shortcut.TargetPath = "$installPath\Conversor de Imagens AVIFWebP.exe"
$Shortcut.IconLocation = "$installPath\Conversor de Imagens AVIFWebP.exe,0"
$Shortcut.Description = "Conversor de Imagens AVIF e WebP"
$Shortcut.WorkingDirectory = $installPath
$Shortcut.Save()
Write-Host "Atalho criado no Menu Iniciar." -ForegroundColor Green

# Criar script de desinstalação
Write-Host "Criando desinstalador..." -ForegroundColor Cyan
$uninstallScript = @"
# Script de Desinstalação para $appName
# Este script remove o aplicativo e seus atalhos

Write-Host "Desinstalando $appName..." -ForegroundColor Cyan

# Verificar permissões de administrador
`$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not `$admin) {
    Write-Host "Este script precisa ser executado como administrador." -ForegroundColor Red
    Write-Host "Por favor, clique com o botão direito no arquivo e selecione 'Executar como administrador'." -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit
}

# Remover atalhos
`$desktopShortcut = "`$env:USERPROFILE\Desktop\$appName.lnk"
`$startMenuFolder = "`$env:ProgramData\Microsoft\Windows\Start Menu\Programs\$appName"

if (Test-Path `$desktopShortcut) {
    Remove-Item -Path `$desktopShortcut -Force
    Write-Host "Atalho da Área de Trabalho removido." -ForegroundColor Green
}

if (Test-Path `$startMenuFolder) {
    Remove-Item -Path `$startMenuFolder -Recurse -Force
    Write-Host "Atalhos do Menu Iniciar removidos." -ForegroundColor Green
}

# Remover arquivos do aplicativo
`$installPath = "$installPath"
if (Test-Path `$installPath) {
    Remove-Item -Path `$installPath -Recurse -Force
    Write-Host "Arquivos do aplicativo removidos." -ForegroundColor Green
}

Write-Host "$appName foi desinstalado com sucesso!" -ForegroundColor Green
Read-Host "Pressione Enter para sair"
"@

Set-Content -Path "$installPath\Desinstalar.ps1" -Value $uninstallScript

# Criar atalho para desinstalação no Menu Iniciar
$Shortcut = $WshShell.CreateShortcut("$startMenuFolder\Desinstalar.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$installPath\Desinstalar.ps1`""
$Shortcut.IconLocation = "shell32.dll,131"
$Shortcut.Description = "Desinstalar $appName"
$Shortcut.WorkingDirectory = $installPath
$Shortcut.Save()
Write-Host "Desinstalador criado." -ForegroundColor Green

# Finalizar instalação
Write-Host "`n$appName foi instalado com sucesso!" -ForegroundColor Green
Write-Host "Localização: $installPath" -ForegroundColor Gray
Write-Host "Um atalho foi adicionado à Área de Trabalho e ao Menu Iniciar." -ForegroundColor Gray
Write-Host "Para desinstalar, use o atalho 'Desinstalar' no Menu Iniciar ou execute o script 'Desinstalar.ps1'." -ForegroundColor Gray

Read-Host "`nPressione Enter para finalizar a instalação"
