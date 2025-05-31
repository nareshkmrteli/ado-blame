import { workspace } from 'vscode';
const config = workspace.getConfiguration('adoblame');
const pattern = config.get<string>("azureDevOps.ado_pattern") || "";
export const workItemPattern = new RegExp(pattern);
