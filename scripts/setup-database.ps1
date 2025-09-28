# Resort Management Database Setup Script
# PowerShell script to setup SQL Server database

param(
    [string]$Server = "localhost",
    [string]$Username = "sa",
    [string]$Password = "yourStrong(!)Password",
    [string]$Database = "ResortManagement"
)

Write-Host "🏨 Resort Management Database Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if sqlcmd is available
try {
    $sqlcmdVersion = sqlcmd -? 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "sqlcmd not found"
    }
    Write-Host "✅ sqlcmd found" -ForegroundColor Green
} catch {
    Write-Host "❌ sqlcmd not found. Please install SQL Server Command Line Utilities" -ForegroundColor Red
    Write-Host "Download from: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility" -ForegroundColor Yellow
    exit 1
}

# Test connection
Write-Host "🔍 Testing SQL Server connection..." -ForegroundColor Yellow
try {
    $testQuery = "SELECT @@VERSION"
    $result = sqlcmd -S $Server -U $Username -P $Password -Q $testQuery -h -1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL Server connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to SQL Server" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  - SQL Server is running" -ForegroundColor Yellow
    Write-Host "  - Server name: $Server" -ForegroundColor Yellow
    Write-Host "  - Username: $Username" -ForegroundColor Yellow
    Write-Host "  - Password is correct" -ForegroundColor Yellow
    Write-Host "  - SQL Server allows SQL Server Authentication" -ForegroundColor Yellow
    exit 1
}

# Drop database if exists
Write-Host "🗑️  Dropping existing database (if exists)..." -ForegroundColor Yellow
$dropQuery = "IF EXISTS (SELECT * FROM sys.databases WHERE name = '$Database') DROP DATABASE [$Database]"
sqlcmd -S $Server -U $Username -P $Password -Q $dropQuery
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database cleanup completed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database cleanup had issues, continuing..." -ForegroundColor Yellow
}

# Create database
Write-Host "🏗️  Creating database..." -ForegroundColor Yellow
$createQuery = "CREATE DATABASE [$Database]"
sqlcmd -S $Server -U $Username -P $Password -Q $createQuery
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to create database" -ForegroundColor Red
    exit 1
}

# Run migration
Write-Host "📊 Running database migration..." -ForegroundColor Yellow
$migrationFile = Join-Path $PSScriptRoot "..\database\migration_fixed.sql"
if (Test-Path $migrationFile) {
    sqlcmd -S $Server -U $Username -P $Password -d $Database -i $migrationFile
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database migration completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Database migration failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

# Verify tables
Write-Host "🔍 Verifying database structure..." -ForegroundColor Yellow
$verifyQuery = @"
SELECT 
    TABLE_NAME,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as COLUMN_COUNT
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME
"@

$tables = sqlcmd -S $Server -U $Username -P $Password -d $Database -Q $verifyQuery -h -1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database structure verified" -ForegroundColor Green
    Write-Host "📋 Created tables:" -ForegroundColor Cyan
    $tables | ForEach-Object { Write-Host "  - $_" -ForegroundColor White }
} else {
    Write-Host "⚠️  Could not verify database structure" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Database: $Database" -ForegroundColor Cyan
Write-Host "Server: $Server" -ForegroundColor Cyan
Write-Host "Username: $Username" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with the correct database credentials" -ForegroundColor White
Write-Host "2. Run: npm install" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host ""

