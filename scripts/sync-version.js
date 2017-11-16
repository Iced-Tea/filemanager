let path = require('path');
let fs = require('fs');

module.exports = function syncVersion(packagePath, version) {
  let packageJsonPath = path.resolve(packagePath, './package.json');
  let packageJsonContent = require(packageJsonPath);
  packageJsonContent.version = version;

  let packageJsonFileContent = JSON.stringify(packageJsonContent, null, 2);
  fs.writeFileSync(packageJsonPath, packageJsonFileContent, { encoding: 'utf-8' });
};
