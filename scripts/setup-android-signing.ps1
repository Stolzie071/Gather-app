param()

$ErrorActionPreference = "Stop"

$projectRootPath = Split-Path -Parent $PSScriptRoot
$signingDirectoryPath = Join-Path $projectRootPath ".signing"
$keystorePath = Join-Path $signingDirectoryPath "gather-release.keystore"
$gradleDirectoryPath = Join-Path ([Environment]::GetFolderPath("UserProfile")) ".gradle"
$gradlePropertiesPath = Join-Path $gradleDirectoryPath "gradle.properties"
$passwordPropertyName = "GATHER_RELEASE_STORE_PASSWORD"

if (Test-Path -LiteralPath $keystorePath) {
    throw "The permanent Gather keystore already exists at $keystorePath. It was not overwritten."
}

$securePassword = Read-Host "Create a password for the Gather release key" -AsSecureString
$securePasswordConfirmation = Read-Host "Repeat the password" -AsSecureString

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$confirmationPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePasswordConfirmation)

try {
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
    $plainPasswordConfirmation = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($confirmationPointer)

    if ($plainPassword -ne $plainPasswordConfirmation) {
        throw "The passwords do not match. No key was created."
    }

    if ($plainPassword.Length -lt 12) {
        throw "Use a password containing at least 12 characters. No key was created."
    }

    if ($plainPassword -notmatch '^[A-Za-z0-9!@#$%^&*_.-]+$') {
        throw "Use only Latin letters, digits, and !@#$%^&*_.- in the password."
    }

    $keytoolCommand = Get-Command keytool -ErrorAction SilentlyContinue
    $keytoolPath = if ($keytoolCommand) {
        $keytoolCommand.Source
    } else {
        $javaHomePath = [Environment]::GetEnvironmentVariable("JAVA_HOME")
        $androidStudioKeytoolPath = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
        $javaHomeKeytoolPath = if ($javaHomePath) {
            Join-Path $javaHomePath "bin\keytool.exe"
        } else {
            $null
        }

        if ($javaHomeKeytoolPath -and (Test-Path -LiteralPath $javaHomeKeytoolPath)) {
            $javaHomeKeytoolPath
        } elseif (Test-Path -LiteralPath $androidStudioKeytoolPath) {
            $androidStudioKeytoolPath
        } else {
            throw "keytool was not found in PATH, JAVA_HOME, or the Android Studio JBR."
        }
    }
    New-Item -ItemType Directory -Path $signingDirectoryPath -Force | Out-Null

    & $keytoolPath `
        -genkeypair `
        -v `
        -storetype PKCS12 `
        -keystore $keystorePath `
        -storepass $plainPassword `
        -keypass $plainPassword `
        -alias "gather-release" `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -dname "CN=Gather, OU=Stolzies Team, O=Stolzies Team, L=Moscow, ST=Moscow, C=RU"

    if ($LASTEXITCODE -ne 0) {
        throw "keytool failed with exit code $LASTEXITCODE."
    }

    New-Item -ItemType Directory -Path $gradleDirectoryPath -Force | Out-Null

    $existingProperties = if (Test-Path -LiteralPath $gradlePropertiesPath) {
        [System.IO.File]::ReadAllLines($gradlePropertiesPath)
    } else {
        @()
    }

    $updatedProperties = @(
        $existingProperties | Where-Object {
            $_ -notmatch "^$([regex]::Escape($passwordPropertyName))="
        }
    )
    $updatedProperties += "$passwordPropertyName=$plainPassword"

    [System.IO.File]::WriteAllLines(
        $gradlePropertiesPath,
        $updatedProperties,
        [System.Text.UTF8Encoding]::new($false)
    )

    Write-Host ""
    Write-Host "The permanent Gather release key was created successfully." -ForegroundColor Green
    Write-Host "Keystore: $keystorePath"
    Write-Host "Gradle credentials: $gradlePropertiesPath"
    Write-Host "Back up the keystore and save its password in a password manager." -ForegroundColor Yellow
}
finally {
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    if ($confirmationPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($confirmationPointer)
    }
    $plainPassword = $null
    $plainPasswordConfirmation = $null
}
