const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando dependências...');

const nodeModulesExists = fs.existsSync(path.join(__dirname, 'node_modules'));
console.log('📁 node_modules:', nodeModulesExists ? '✅ Existe' : '❌ Não existe');

try {
    require.resolve('mysql2/promise');
    console.log('📦 mysql2/promise: ✅ Instalado');
} catch (error) {
    console.log('📦 mysql2/promise: ❌ Não instalado');
    console.log('💡 Execute: npm install mysql2@^3.6.5 --save');
    process.exit(1);
}

const dependencies = ['express', 'jsonwebtoken', 'bcryptjs', 'cors', 'dotenv'];
dependencies.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`📦 ${dep}: ✅ Instalado`);
    } catch (error) {
        console.log(`📦 ${dep}: ❌ Não instalado`);
    }
});

console.log('🚀 Iniciando servidor...');
require('./server.js');