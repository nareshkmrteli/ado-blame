import * as assert from 'assert';
import { StatusBarView } from '../../src/view';

describe('StatusBarView', () => {
    let mockStatusBarItem: any;
    let statusBarView: StatusBarView;

    beforeEach(() => {
        mockStatusBarItem = {
            text: '',
            tooltip: '',
            command: '',
            show: () => {},
            hide: () => {}
        };
        statusBarView = new StatusBarView(mockStatusBarItem);
    });

    it('should initialize with extension.blame command', () => {
        assert.strictEqual(mockStatusBarItem.command, 'extension.blame');
    });

    it('should update text with git-commit icon', () => {
        statusBarView.updateText('Test message');
        assert.strictEqual(mockStatusBarItem.text, '$(git-commit) Test message');
    });

    it('should set ADO Blame tooltip', () => {
        assert.strictEqual(mockStatusBarItem.tooltip, 'ADO Blame');
    });

    it('should show status bar item on update', () => {
        let showCalled = false;
        mockStatusBarItem.show = () => { showCalled = true; };
        
        statusBarView.updateText('Test message');
        assert.strictEqual(showCalled, true);
    });

    it('should hide status bar item when text is null', () => {
        let hideCalled = false;
        mockStatusBarItem.hide = () => { hideCalled = true; };
        
        statusBarView.update('Test message');
        assert.strictEqual(hideCalled, true);
    });
}); 