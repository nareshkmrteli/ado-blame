import {Disposable, window, TextEditor, TextEditorSelectionChangeEvent} from 'vscode';
import {GitBlame} from './blame';
import * as path from 'path';
import * as moment from 'moment';
import {AzureDevOpsService} from './ado';

interface BlameInfo {
    lines: {
        [key: string]: {
            hash: string;
        };
    };
    commits: {
        [key: string]: {
            author: {
                name: string;
                timestamp: number;
            };
            summary: string;
            time: number;
        };
    };
}

interface View {
    update: (message: string) => void;
}

interface Editor {
    document: {
        fileName: string;
    };
    selection: {
        active: {
            line: number;
        };
    };
}

export class GitBlameController {
    private _disposable: Disposable;
    private _textDecorator: TextDecorator;
    private adoService: AzureDevOpsService;

    constructor(private gitBlame: GitBlame, private gitRoot: string, private view: View) {
        const self = this;

        this._disposable = Disposable.from();
        this._textDecorator = new TextDecorator();
        this.adoService = new AzureDevOpsService();
    }

    clear() {
        this.view.update('');
    }

    async show(blameInfo: BlameInfo, lineNumber: number): Promise<void> {
        if (lineNumber in blameInfo.lines) {
            const hash = blameInfo.lines[lineNumber].hash;
            const commitInfo = blameInfo.commits[hash];
            await this.showCommitInfo(commitInfo);
        } else {
            // No line info.
            this.clear();
        }
    }

    private async showCommitInfo(commitInfo: BlameInfo['commits'][string]) {
        let message = this._textDecorator.toTextView(new Date(), commitInfo);
        
        try {
            message = await this.adoService.enrichBlameInfo(message);
        } catch (err) {
            console.error('Failed to enrich blame info with ADO data:', err);
        }

        this.view.update(message);
    }

    public async blameLink() {
        const editor = this.getEditor();
        if (!editor) {
            return;
        }

        const file = editor.document.fileName;
        const lineNumber = editor.selection.active.line;

        try {
            const info = await this.gitBlame.getBlameInfo(file);
            const commitInfo = await this.getCommitInfo(info, lineNumber.toString());
            if (commitInfo) {
                const message = await this.enrichCommitMessage(commitInfo);
                this.view.update(message);
            }
        } catch (err) {
            console.error('Failed to get blame info:', err);
        }
    }

    private getCommitInfo(blameInfo: BlameInfo, lineNumber: string) {
        if (lineNumber in blameInfo.lines) {
            const hash = blameInfo.lines[lineNumber].hash;
            const commitInfo = blameInfo.commits[hash];
            return commitInfo;
        }
        return null;
    }

    private async enrichCommitMessage(commit: BlameInfo['commits'][string]) {
        const author = commit.author.name;
        const summary = commit.summary;
        const time = commit.time;

        let message = `${summary} - ${author} (${this.getDateText(time)})`;

        try {
            message = await this.adoService.enrichBlameInfo(message);
        } catch (err) {
            console.error('Failed to enrich blame info with ADO data:', err);
        }

        return message;
    }

    private getDateText(time: number): string {
        const date = new Date(time * 1000);
        return date.toLocaleDateString();
    }

    private getEditor(): Editor | null {
        return window.activeTextEditor as Editor | null;
    }

    dispose() {
        this._disposable.dispose();
    }
}

export class TextDecorator {
    toTextView(dateNow: Date, commit: BlameInfo['commits'][string]): string {
        const author = commit.author.name;
        const dateText = this.toDateText(dateNow, new Date(commit.author.timestamp * 1000));

        return `${commit.summary} - ${author} (${dateText})`;
    }

    private toDateText(dateNow: Date, dateThen: Date): string {
        return moment(dateThen).from(dateNow);
    }
}