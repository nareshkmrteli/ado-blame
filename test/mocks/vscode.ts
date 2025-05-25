export interface WorkspaceConfiguration {
    get<T>(section: string): T | undefined;
    has(section: string): boolean;
    inspect<T>(section: string): undefined;
    update(section: string, value: any): Promise<void>;
}

export interface TextEditor {
    document: {
        fileName: string;
    };
    selection: {
        active: {
            line: number;
        };
    };
}

export const workspace = {
    getConfiguration: (section?: string): WorkspaceConfiguration => ({
        get: <T>(key: string): T | undefined => undefined,
        has: (key: string): boolean => false,
        inspect: <T>(key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve()
    })
};

export const window = {
    showInformationMessage: () => Promise.resolve(),
    showErrorMessage: () => Promise.resolve(),
    activeTextEditor: undefined as TextEditor | undefined
};

export const commands = {
    registerCommand: () => ({ dispose: () => {} })
};

export const Disposable = {
    from: (...disposables: { dispose: () => any }[]) => ({
        dispose: () => disposables.forEach(d => d.dispose())
    })
}; 