import { StatusBarItem } from "vscode";

export interface IView {
  update(text: string): void;
}

export class StatusBarView implements IView {
  private _statusBarItem: StatusBarItem;
  private _loading: boolean;
  private _text: string | null;

  constructor(statusBarItem: StatusBarItem) {
    this._statusBarItem = statusBarItem;
    this._text = null
    this._statusBarItem.command = "extension.blame";
    this._statusBarItem.tooltip = "ADO Blame";
    this._statusBarItem.show();
    this._loading = false;
  }

  update(text: string) {
    this._statusBarItem.text = "$(git-commit) " + text + (this._loading ? "$(sync~spin)" : "");
    if (!this._text) this._statusBarItem.hide();
    else this._statusBarItem.show();
  }
  updateText(text: string) {
    this._text = text;
    this.update(this._text);
  }
  setLoading(loading: boolean) {
    this._loading = loading;
    this.update(this._text || "");
  }
}
