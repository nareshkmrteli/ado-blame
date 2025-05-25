import * as assert from 'assert';
import { GitBlame } from '../../src/blame';

describe('GitBlame', () => {
    let mockGitBlameProcess: any;
    let gitBlame: GitBlame;
    let eventHandlers: { [key: string]: Function };

    beforeEach(() => {
        eventHandlers = {};
        mockGitBlameProcess = (repo: string, options: { file: string }) => ({
            on: (event: string, callback: Function) => {
                eventHandlers[event] = callback;
                return mockGitBlameProcess(repo, options);
            }
        });
        gitBlame = new GitBlame('/test/repo/.git', mockGitBlameProcess);
    });

    describe('getBlameInfo', () => {
        it('should cache blame info for subsequent calls', async () => {
            const blameInfo = {
                lines: {
                    '1': { hash: 'abc123', finalLine: 1 }
                },
                commits: {
                    'abc123': {
                        hash: 'abc123',
                        summary: 'Test commit',
                        author: { name: 'Test Author', timestamp: 1234567890 },
                        time: 1234567890
                    }
                }
            };

            const promise = gitBlame.getBlameInfo('test.ts');
            
            // Simulate git-blame process events
            eventHandlers['data']('line', { hash: 'abc123', finalLine: 1 });
            eventHandlers['data']('commit', {
                hash: 'abc123',
                summary: 'Test commit',
                author: { name: 'Test Author', timestamp: 1234567890 }
            });
            eventHandlers['end']();

            const result = await promise;
            assert.deepStrictEqual(result, blameInfo);

            // Second call should return cached result
            const secondResult = await gitBlame.getBlameInfo('test.ts');
            assert.strictEqual(result, secondResult);
        });

        it('should handle errors from git-blame process', async () => {
            const promise = gitBlame.getBlameInfo('test.ts');
            
            // Simulate error
            eventHandlers['error'](new Error('Test error'));

            try {
                await promise;
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.ok(err instanceof Error);
            }
        });

        it('should set time from author timestamp if not provided', async () => {
            const promise = gitBlame.getBlameInfo('test.ts');
            
            // Simulate git-blame process events with commit missing time
            eventHandlers['data']('commit', {
                hash: 'abc123',
                summary: 'Test commit',
                author: { name: 'Test Author', timestamp: 1234567890 }
            });
            eventHandlers['end']();

            const result = await promise;
            assert.strictEqual(result.commits['abc123'].time, 1234567890);
        });
    });

    describe('needsBlame', () => {
        it('should return true for uncached files', () => {
            assert.strictEqual(gitBlame.needsBlame('test.ts'), true);
        });

        it('should return false for cached files', async () => {
            const promise = gitBlame.getBlameInfo('test.ts');
            eventHandlers['end']();
            await promise;

            assert.strictEqual(gitBlame.needsBlame('test.ts'), false);
        });
    });
}); 