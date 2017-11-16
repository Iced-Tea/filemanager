let path = require('path');
let execSync = require('child_process').execSync;
let version = require('./version');
let syncVersion = require('./sync-version');

function buildClientReact() {
  let packagePath = path.resolve(__dirname, '../client-react');
  syncVersion(packagePath, version);
  execSync('npm install', { cwd: packagePath, stdio: 'inherit' });
  execSync('npm run npm-build', { cwd: packagePath, stdio: 'inherit' });
}

buildClientReact();

// module.exports = {
//   clientReact: {
//     name: 'client-react',
//     path: ,
//     dependsOn: [],
//     build: [
//       'echo "build client!"'
//       // 'yarn install',
//       // 'npm run npm-build'
//     ],
//     publish: [
//       'echo "publish client!"'
//       // 'npm publish'
//     ]
//   },
//   {
//     name: 'client-react-connector-google-drive-v2',
//     path: path.resolve(__dirname, '../client-react-connectors/google_drive_v2'),
//     dependsOn: [
//       { name: 'client-react', goals: ['build'] },
//       { name: 'client-react-connector-node-js-v1', goals: ['build'] }
//     ],
//     build: [
//       'echo "build google!"'
//       // 'yarn install',
//       // 'npm run npm-build'
//     ],
//     publish: [
//       'echo "publish google!"'
//     ]
//   },
//   {
//     name: 'client-react-connector-node-js-v1',
//     path: path.resolve(__dirname, '../client-react-connectors/google_drive_v2'),
//     dependsOn: [{ name: 'client-react', goals: ['build'] }],
//     build: [
//       'echo "build drive!"'
//       // 'yarn install',
//       // 'npm run npm-build'
//     ],
//     publish: [
//       'echo "publish drive!"'
//     ]
//   }
// };
