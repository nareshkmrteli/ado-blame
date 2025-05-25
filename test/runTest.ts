import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../');

        // The path to the extension test setup script
        const extensionTestsPath = path.resolve(__dirname, '../out/test/integration/setup.js');

        console.log('Extension development path:', extensionDevelopmentPath);
        console.log('Extension tests path:', extensionTestsPath);

        // Download VS Code, unzip it and run the integration test
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                '--disable-workspace-trust',
                '--disable-gpu',
                extensionDevelopmentPath
            ]
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main(); 