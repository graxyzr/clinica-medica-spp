const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Verificando e instalando dependências...');

try {
    if (!fs.existsSync('package.json')) {
        console.log('❌ package.json não encontrado!');
        process.exit(1);
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    const requiredDeps = ['express', 'jsonwebtoken', 'bcryptjs', 'cors', 'mysql2', 'dotenv'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep]);

    if (missingDeps.length > 0) {
        console.log('📦 Instalando dependências faltantes:', missingDeps.join(', '));
        execSync(`npm install ${missingDeps.join(' ')} --save`, { stdio: 'inherit' });
    } else {
        console.log('✅ Todas as dependências estão no package.json');
    }

    if (!fs.existsSync('node_modules')) {
        console.log('📦 node_modules não encontrado. Instalando dependências...');
        execSync('npm install', { stdio: 'inherit' });
    }

    console.log('✅ Dependências verificadas com sucesso!');
    console.log('🚀 Iniciando servidor...');

    require('./server.js');

} catch (error) {
    console.error('❌ Erro durante a verificação:', error.message);
    process.exit(1);
}