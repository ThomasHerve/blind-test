# Vérifie Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python n'est pas installé ou pas dans le PATH." -ForegroundColor Red
    exit 1
}

# Vérifie pip
if (-not (python -m pip --version)) {
    Write-Host "pip n'est pas disponible." -ForegroundColor Red
    exit 1
}

# Installe les dépendances si requirements.txt existe
if (Test-Path "./requirements.txt") {
    Write-Host "Installation des dépendances de l'application..."
    python -m pip install -r requirements.txt
}

# Installe pyinstaller si nécessaire
$pyi_installed = python -m pip show pyinstaller 2>$null
if (-not $pyi_installed) {
    Write-Host "Installation de PyInstaller..."
    python -m pip install pyinstaller
}

# Nom de l'entrée
$entry = "main.py"

# Vérifie le fichier main.py
if (-not (Test-Path $entry)) {
    Write-Host "Le fichier main.py est introuvable." -ForegroundColor Red
    exit 1
}

# Construction avec PyInstaller
Write-Host "Création de l'exécutable..."
python -m PyInstaller `
    --noconfirm `
    --onefile `
    --windowed `
    --name "BlindTestApp" `
    $entry

Write-Host "`n✅ Fichier généré : dist\BlindTestApp.exe" -ForegroundColor Green
