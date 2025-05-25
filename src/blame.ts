interface BlameInfo {
    lines: {
        [key: string]: BlameLineInfo;
    };
    commits: {
        [key: string]: BlameCommitInfo;
    };
}

interface BlameLineInfo {
    finalLine: number;
    hash: string;
}

interface BlameCommitInfo {
    hash: string;
    summary: string;
    author: {
        name: string;
        timestamp: number;
    };
    time: number;
}

interface GitBlameProcess {
    (repo: string, options: { file: string }): {
        on(event: 'data', callback: (type: string, data: any) => void): any;
        on(event: 'error', callback: (err: Error) => void): any;
        on(event: 'end', callback: () => void): any;
    };
}

export class GitBlame {
    private _blamed: { [key: string]: BlameInfo };
    
    constructor(private repoPath: string, private gitBlameProcess: GitBlameProcess) {
        this._blamed = {};
    }
    
    getBlameInfo(fileName: string): Promise<BlameInfo> {
        const self = this;
        return new Promise<BlameInfo>((resolve, reject) => {
            if (self.needsBlame(fileName)) {
                self.blameFile(self.repoPath, fileName).then((blameInfo) => {
                    self._blamed[fileName] = blameInfo;
                    resolve(blameInfo);
                }, (err) => {
                    reject(err);
                });
            } else {
                resolve(self._blamed[fileName]);
            }
        });
    }
    
    needsBlame(fileName: string): boolean {
        return !(fileName in this._blamed);
    }
    
    blameFile(repo: string, fileName: string): Promise<BlameInfo> {
        const self = this;
        return new Promise<BlameInfo>((resolve, reject) => {
            const blameInfo: BlameInfo = {
                lines: {},
                commits: {}
            };
            
            self.gitBlameProcess(repo, {
                file: fileName
            }).on('data', (type: string, data: BlameLineInfo | BlameCommitInfo) => {
                // outputs in Porcelain format.
                if (type === 'line') {
                    const lineData = data as BlameLineInfo;
                    blameInfo.lines[lineData.finalLine] = lineData;
                } else if (type === 'commit' && !(data.hash in blameInfo.commits)) {
                    const commitData = data as BlameCommitInfo;
                    if (!commitData.time) {
                        commitData.time = commitData.author.timestamp;
                    }
                    blameInfo.commits[commitData.hash] = commitData;
                }
            }).on('error', (err: Error) => {
                reject(err);
            }).on('end', () => {
                resolve(blameInfo);
            });
        });
    }
    
    dispose() {
        // Nothing to release.
    }
}

