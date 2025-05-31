import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../');

        // The path to the extension test setup script
        const extensionTestsPath = path.resolve(__dirname, '../out/test/integration/setup.js');

        // Set up VS Code download cache path
        const vscodeTestDir = path.resolve(__dirname, '../.vscode-test');

        console.log('Extension development path:', extensionDevelopmentPath);
        console.log('Extension tests path:', extensionTestsPath);
        console.log('VS Code test cache directory:', vscodeTestDir);

        // Download VS Code, unzip it and run the integration test
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                '--disable-workspace-trust',
                '--disable-gpu',
                extensionDevelopmentPath
            ],
            version: '1.100.2', // Lock to specific version
            cachePath: vscodeTestDir // Enable caching
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main(); 