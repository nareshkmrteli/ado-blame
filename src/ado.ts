import * as vscode from 'vscode';
import * as azdev from 'azure-devops-node-api';

export class AzureDevOpsService {
    private connection: azdev.WebApi | undefined;
    private organizationUrl: string | undefined;

    constructor() {
        this.initializeConnection();
    }

    private async initializeConnection() {
        try {
            const config = vscode.workspace.getConfiguration('adoblame');
            const pat = config.get<string>('azureDevOps.pat');
            this.organizationUrl = config.get<string>('azureDevOps.organizationUrl');

            if (!pat || !this.organizationUrl) {
                console.log('Azure DevOps PAT or organization URL not configured');
                return;
            }

            const authHandler = azdev.getPersonalAccessTokenHandler(pat);
            this.connection = new azdev.WebApi(this.organizationUrl, authHandler);
        } catch (error) {
            console.error('Failed to initialize Azure DevOps connection:', error);
        }
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
        try {
            if (!this.connection || !this.organizationUrl) {
                await this.initializeConnection();
                if (!this.connection) {
                    return null;
                }
            }

            const workItemTrackingApi = await this.connection.getWorkItemTrackingApi();
            const workItem = await workItemTrackingApi.getWorkItem(
                parseInt(workItemId),
                ['System.Title', 'System.Description']
            );

            if (!workItem || !workItem.fields) {
                return null;
            }

            const title = workItem.fields['System.Title']?.toString() || '';
            const description = workItem.fields['System.Description']?.toString() || '';
            
            return `${title}\n${description}`;
        } catch (error) {
            console.error(`Failed to fetch work item ${workItemId}:`, error);
            return null;
        }
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
