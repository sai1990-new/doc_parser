// 检查项目设置
const fs = require('fs');
const path = require('path');

console.log('检查项目设置...\n');

// 检查目录
const dirs = ['server', 'client'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✓ ${dir} 目录存在`);
  } else {
    console.log(`✗ ${dir} 目录不存在`);
  }
});

// 检查 package.json
dirs.forEach(dir => {
  const pkgPath = path.join(__dirname, dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    console.log(`✓ ${dir}/package.json 存在`);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    console.log(`  - 名称: ${pkg.name}`);
    console.log(`  - 版本: ${pkg.version || 'N/A'}`);
  } else {
    console.log(`✗ ${dir}/package.json 不存在`);
  }
});

// 检查 node_modules
dirs.forEach(dir => {
  const nodeModulesPath = path.join(__dirname, dir, 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`✓ ${dir}/node_modules 存在`);
  } else {
    console.log(`✗ ${dir}/node_modules 不存在 - 需要运行 npm install`);
  }
});

console.log('\n建议操作：');
console.log('1. 确保已安装所有依赖：');
console.log('   cd server && npm install');
console.log('   cd ../client && npm install');
console.log('\n2. 启动服务：');
console.log('   终端1: cd server && npm run dev');
console.log('   终端2: cd client && npm run dev');
console.log('\n3. 检查端口是否被占用：');
console.log('   Windows: netstat -ano | findstr :3000');
console.log('   Windows: netstat -ano | findstr :3001');

