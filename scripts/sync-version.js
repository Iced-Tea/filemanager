const path = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs');

const version = '1.0.0-beta.1';
const packages = [
  { path: path.resolve(__dirname, '../client-react') },
  { path: path.resolve(__dirname, '../client-react-connectors/google_drive_v2') }
];

function syncVersion(packages, version) {
  packages.forEach((package) => {
    let packageJsonPath = path.resolve(package.path, './package.json');
    let packageJsonContent = require(packageJsonPath);
    packageJsonContent.version = version;

    let packageJsonFileContent = JSON.stringify(packageJsonContent, null, 4);
    fs.writeFileSync(packageJsonPath, packageJsonFileContent, { encoding: 'utf-8' });
  });
}


syncVersion(packages, version);
