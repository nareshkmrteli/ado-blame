import {StatusBarItem} from 'vscode';

export interface IView {
    update(text: string): void;
}

export class StatusBarView implements IView {
    private _statusBarItem: StatusBarItem;
    
    constructor(statusBarItem: StatusBarItem) {
        this._statusBarItem = statusBarItem;
        this._statusBarItem.command = "extension.blame"
    }

    update(text: string) {
        this._statusBarItem.text = '$(git-commit) ' + text;
        this._statusBarItem.tooltip = 'ADO Blame';
        this._statusBarItem.show();
    }
}


