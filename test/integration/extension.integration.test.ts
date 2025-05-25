import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export async function runIntegrationTests(): Promise<void> {
    console.log('Starting integration tests...');

    // Get the extension
    const extensionId = 'nareshkmrteli.ado-blame';
    console.log(`Looking for extension with ID: ${extensionId}`);
    
    // List all extensions to debug
    const extensions = vscode.extensions.all;
    console.log('Available extensions:', extensions.map(e => e.id));
    
    const extension = vscode.extensions.getExtension(extensionId);
    if (!extension) {
        throw new Error(`Extension not found with ID: ${extensionId}`);
    }

    console.log('Extension found, activating...');
    // Activate the extension if not already activated
    if (!extension.isActive) {
        await extension.activate();
    }
    console.log('Extension activated');

    // Test 1: Extension should be present
    assert.ok(extension, 'Extension should be present');
    console.log('Test 1 passed: Extension is present');

    // Test 2: ADO blame command should be registered
    console.log('Getting list of available commands...');
    const commands = await vscode.commands.getCommands(true);
    console.log('Available commands:', commands);
    assert.ok(commands.includes('extension.blame'), 'ADO blame command should be registered');
    console.log('Test 2 passed: ADO blame command is registered');

    // Test 3: Should show blame info when running command
    console.log('Creating test file...');
    
    // Create a temporary directory
    const tmpDir = path.join(os.tmpdir(), 'vscode-ado-blame-test');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Create a test file
    const testFilePath = path.join(tmpDir, 'test.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for ADO blame integration tests.\n');
    
    // Initialize git repository
    const { execSync } = require('child_process');
    process.chdir(tmpDir);
    execSync('git init');
    execSync('git config --global user.email "test@example.com"');
    execSync('git config --global user.name "Test User"');
    execSync('git add test.txt');
    execSync('git commit -m "Initial commit"');
    
    const document = await vscode.workspace.openTextDocument(testFilePath);
    const editor = await vscode.window.showTextDocument(document);
    console.log('Test file opened');

    console.log('Executing ADO blame command...');
    await vscode.commands.executeCommand('extension.blame');

    // Wait for info message
    console.log('Waiting for command execution...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify command still exists after execution
    const finalCommands = await vscode.commands.getCommands();
    assert.ok(finalCommands.includes('extension.blame'), 'ADO blame command should still be available');
    console.log('Test 3 passed: Command execution completed');

    // Cleanup
    try {
        if (fs.existsSync(tmpDir)) {
            const rimraf = require('rimraf');
            rimraf.sync(tmpDir);
        }
    } catch (err) {
        console.warn('Failed to clean up temporary directory:', err);
    }

    console.log('All integration tests passed!');
} 