import { GitBlame } from "./blame";
import { StatusBarView } from "./view";
import { GitBlameController } from "./controller";
import { AzureDevOpsService } from "./ado";

import {
  window,
  ExtensionContext,
  StatusBarAlignment,
  workspace,
  commands,
  ViewColumn,
} from "vscode";
import * as fs from "fs";
import * as path from "path";

const gitBlameShell = require("git-blame");

export function activate(context: ExtensionContext) {
  // Workspace not using a folder. No access to git repo.
  if (!workspace.workspaceFolders) {
    return;
  }
  const workspaceRoot = workspace.workspaceFolders[0].uri.fsPath;
  lookupRepo(context, workspaceRoot);
}

function lookupRepo(context: ExtensionContext, repoDir: string) {
  const repoPath = path.join(repoDir, ".git");

  fs.access(repoPath, (err) => {
    if (err) {
      // No access to git repo or no repo, try to go up.
      const parentDir = path.dirname(repoDir);
      if (parentDir != repoDir) {
        lookupRepo(context, parentDir);
      }
    } else {
      const statusBar = window.createStatusBarItem(StatusBarAlignment.Left);
      const gitBlame = new GitBlame(repoPath, gitBlameShell);
      const view = new StatusBarView(statusBar);
      const adoService = new AzureDevOpsService();
      const controller = new GitBlameController(gitBlame, repoDir, view);

      commands.registerCommand("extension.blame", async () => {
        view.setLoading(true)
        await fetchAdoDetails(gitBlame, adoService, repoDir);
        view.setLoading(false);
      });

      context.subscriptions.push(controller);
      context.subscriptions.push(gitBlame);
      context.subscriptions.push(statusBar);
    }
  });
}

async function fetchAdoDetails(gitBlame: GitBlame, adoService: AzureDevOpsService, gitRoot: string) {
  const editor = window.activeTextEditor;
  if (!editor) return;
  const doc = editor.document;
  if (!doc) return;
  if (doc.isUntitled) return;
  const lineNumber = editor.selection.active.line + 1;
  const file = path.relative(gitRoot, editor.document.fileName);
  await gitBlame
    .getBlameInfo(file)
    .then(async (info) => {
      if (lineNumber in info.lines) {
        const hash = info.lines[lineNumber].hash;
        const commitInfo = info.commits[hash];
        try {
          const enrichedMessage = await adoService.enrichBlameInfo(
            commitInfo.summary
          );
          if (enrichedMessage !== commitInfo.summary) {
            showHtmlContent(commitInfo.summary, enrichedMessage);
          }
        } catch (error) {
          console.error("Error fetching Azure DevOps details:", error);
        }
      }
    })
    .catch((error) => {
      console.error("Error getting blame info:", error);
      window.showErrorMessage("Failed to get git blame information.");
    });
}


function showHtmlContent(title: string, content: string) {
  const panel = window.createWebviewPanel(
    'gitBlameInfo',
    title,
    ViewColumn.Beside,
    {
      enableScripts: true,
      localResourceRoots: [], // Add if loading local resources
    }
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}