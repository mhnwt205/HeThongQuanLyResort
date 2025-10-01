const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Resort Management Project...\n');

// Check if .env exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from env.example...');
    
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created successfully!');
    } else {
        console.log('❌ env.example file not found!');
        process.exit(1);
    }
} else {
    console.log('✅ .env file already exists');
}

// Check if public/images directory exists
const imagesDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    console.log('📁 Creating public/images directory structure...');
    
    const dirs = [
        'public/images',
        'public/images/home',
        'public/images/services', 
        'public/images/about',
        'public/images/rooms'
    ];
    
    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
} else {
    console.log('✅ public/images directory structure exists');
}

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ uploads directory created');
} else {
    console.log('✅ uploads directory exists');
}

// Check if logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    console.log('📁 Creating logs directory...');
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✅ logs directory created');
} else {
    console.log('✅ logs directory exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure SQL Server is running');
console.log('2. Ensure database "ResortManagement" exists');
console.log('3. Run: npm install');
console.log('4. Run: npm start');
console.log('\n🔗 Access the application at: http://localhost:3000');
