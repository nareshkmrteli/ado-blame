import { runIntegrationTests } from './extension.integration.test';

export async function run(): Promise<void> {
    try {
        await runIntegrationTests();
    } catch (err) {
        console.error('Test failed:', err);
        throw err;
    }
} 