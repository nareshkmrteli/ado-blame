import * as assert from 'assert';
import * as sinon from 'sinon';
import { TestableAzureDevOpsService } from './testable-ado';

describe('Azure DevOps Service', () => {
    let adoService: TestableAzureDevOpsService;

    beforeEach(() => {
        adoService = new TestableAzureDevOpsService('fake-pat', 'https://dev.azure.com/fake-org');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('extractWorkItemId', () => {
        it('should extract work item ID from commit message with # format', () => {
            const result = adoService.extractWorkItemId('Fix bug #123');
            assert.strictEqual(result, '123');
        });

        it('should extract work item ID from commit message with AB# format', () => {
            const result = adoService.extractWorkItemId('Update feature AB#456');
            assert.strictEqual(result, '456');
        });

        it('should return null for commit message without work item ID', () => {
            const result = adoService.extractWorkItemId('Regular commit message');
            assert.strictEqual(result, null);
        });

        it('should extract first work item ID when multiple are present', () => {
            const result = adoService.extractWorkItemId('Multiple items #123 and AB#456');
            assert.strictEqual(result, '123');
        });
    });

    describe('getWorkItemDescription', () => {
        it('should return null when connection is not initialized', async () => {
            const service = new TestableAzureDevOpsService(); // No PAT or URL
            const result = await service.getWorkItemDescription('123');
            assert.strictEqual(result, null);
        });

        it('should return mock work item description when available', async () => {
            const workItemId = '123';
            const description = 'Test work item description';
            adoService.setMockWorkItem(workItemId, description);

            const result = await adoService.getWorkItemDescription(workItemId);
            assert.strictEqual(result, description);
        });

        it('should return null when work item is not found', async () => {
            const result = await adoService.getWorkItemDescription('999');
            assert.strictEqual(result, null);
        });
    });

    describe('enrichBlameInfo', () => {
        it('should return original message when no work item is found', async () => {
            const message = 'Regular commit message';
            const result = await adoService.enrichBlameInfo(message);
            assert.strictEqual(result, message);
        });

        it('should enrich message with work item description when available', async () => {
            const workItemId = '123';
            const description = 'Test work item description';
            adoService.setMockWorkItem(workItemId, description);

            const message = 'Fix bug #123';
            const result = await adoService.enrichBlameInfo(message);
            assert.strictEqual(result, `${message}\nWork Item #${workItemId}:\n${description}`);
        });

        it('should return original message when work item has no description', async () => {
            const message = 'Fix bug #999';
            const result = await adoService.enrichBlameInfo(message);
            assert.strictEqual(result, message);
        });
    });
}); 