import * as moment from 'moment';

export interface CommitInfo {
    author: {
        name: string;
        timestamp: number;
    };
    summary: string;
    time: number;
}

export class TestableTextDecorator {
    toTextView(dateNow: Date, commit: CommitInfo): string {
        const author = commit.author.name;
        const dateText = this.toDateText(dateNow, new Date(commit.author.timestamp * 1000));

        return `${commit.summary} - ${author} (${dateText})`;
    }

    private toDateText(dateNow: Date, dateThen: Date): string {
        return moment(dateThen).from(dateNow);
    }
} 