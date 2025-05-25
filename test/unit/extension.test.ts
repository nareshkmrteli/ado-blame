import * as assert from 'assert';
import { TestableTextDecorator } from './testable-controller';

describe('Extension Tests', () => {
    it('TextDecorator formats commit info correctly', () => {
        const decorator = new TestableTextDecorator();
        const now = new Date(2015, 4); // May 2015
        const commitInfo = {
            author: {
                name: 'Test Author',
                timestamp: new Date(2015, 1).getTime() / 1000 // February 2015
            },
            summary: 'Test commit',
            time: new Date(2015, 1).getTime() / 1000
        };

        const result = decorator.toTextView(now, commitInfo);
        assert.equal(result, 'Test commit - Test Author (3 months ago)');
    });

    it('TextDecorator handles recent dates correctly', () => {
        const decorator = new TestableTextDecorator();
        const now = new Date(2015, 1, 5); // February 5, 2015
        const commitInfo = {
            author: {
                name: 'Test Author',
                timestamp: new Date(2015, 1, 1).getTime() / 1000 // February 1, 2015
            },
            summary: 'Test commit',
            time: new Date(2015, 1, 1).getTime() / 1000
        };

        const result = decorator.toTextView(now, commitInfo);
        assert.equal(result, 'Test commit - Test Author (4 days ago)');
    });
}); 