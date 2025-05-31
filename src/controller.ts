import {
  Disposable,
  window,
  TextEditor,
  TextEditorSelectionChangeEvent,
} from "vscode";
import { GitBlame } from "./blame";
import * as path from "path";
import { workItemPattern } from './const';

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
  updateText: (message: string) => void;
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

  constructor(
    private gitBlame: GitBlame,
    private gitRoot: string,
    private view: View
  ) {
    const self = this;

    const disposables: Disposable[] = [];

    // Add event listeners
    window.onDidChangeActiveTextEditor(
      this.onTextEditorChange,
      this,
      disposables
    );
    window.onDidChangeTextEditorSelection(
      this.onTextEditorSelectionChange,
      this,
      disposables
    );

    this._disposable = Disposable.from(...disposables);
    this._textDecorator = new TextDecorator();
    
  }

  private async onTextEditorChange(editor: TextEditor | undefined) {
    if (!editor) {
      this.clear();
      return;
    }

    const file = path.relative(this.gitRoot, editor.document.fileName);
    const lineNumber = editor.selection.active.line + 1;

    try {
      const info = await this.gitBlame.getBlameInfo(file);
      await this.show(info, lineNumber);
    } catch (err) {
      console.error("Error in text editor change handler:", err);
      this.clear();
    }
  }

  private async onTextEditorSelectionChange(
    event: TextEditorSelectionChangeEvent
  ) {
    this.onTextEditorChange(event.textEditor);
    const editor = event.textEditor;
    const file = path.relative(this.gitRoot, editor.document.fileName);
    const lineNumber = editor.selection.active.line + 1;

    try {
      const info = await this.gitBlame.getBlameInfo(file);
      await this.show(info, lineNumber);
    } catch (err) {
      console.error("Error in selection change handler:", err);
      this.clear();
    }
  }

  clear() {
    this.view.updateText("");
  }

  async show(blameInfo: BlameInfo, lineNumber: number): Promise<void> {
    if (lineNumber in blameInfo.lines) {
      const hash = blameInfo.lines[lineNumber].hash;
      const commitInfo = blameInfo.commits[hash];
      let message = this._textDecorator.toTextView(commitInfo);
      if (message) {
        this.view.updateText(message);
      } else {
        this.clear();
      }
    } else {
      this.clear();
    }
  }

  dispose() {
    this._disposable.dispose();
  }
}

export class TextDecorator {
  toTextView(commit: BlameInfo["commits"][string]): string | null {
    const summary = commit.summary;
    const workItemId = this.extractWorkItemId(summary);
    return workItemId ? "ADO#" + workItemId : null;
  }

  private extractWorkItemId(commitMessage: string): string | null {
    const match = commitMessage.match(workItemPattern);
    if (match) {
      return match[1] || match[2];
    }
    return null;
  }
}
