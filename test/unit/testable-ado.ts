export class TestableAzureDevOpsService {
    private pat: string | undefined;
    private organizationUrl: string | undefined;
    private mockWorkItems: Map<string, string>;

    constructor(pat?: string, organizationUrl?: string) {
        this.pat = pat;
        this.organizationUrl = organizationUrl;
        this.mockWorkItems = new Map();
    }

    public setMockWorkItem(workItemId: string, description: string) {
        this.mockWorkItems.set(workItemId, description);
    }

    public extractWorkItemId(commitMessage: string): string | null {
        // Match common Azure DevOps work item patterns like "#123", "AB#123"
        const workItemPattern = /#(\d+)|AB#(\d+)/;
        const match = commitMessage.match(workItemPattern);
        
        if (match) {
            return match[1] || match[2];
        }
        return null;
    }

    public async getWorkItemDescription(workItemId: string): Promise<string | null> {
        if (!this.pat || !this.organizationUrl) {
            return null;
        }
        return this.mockWorkItems.get(workItemId) || null;
    }

    public async enrichBlameInfo(commitMessage: string): Promise<string> {
        const workItemId = this.extractWorkItemId(commitMessage);
        if (!workItemId) {
            return commitMessage;
        }

        const description = await this.getWorkItemDescription(workItemId);
        if (!description) {
            return commitMessage;
        }

        return `${commitMessage}\nWork Item #${workItemId}:\n${description}`;
    }
} 