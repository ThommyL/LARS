import {Question} from './question';
import {Chapter} from './chapter';

export class Lecture {

    constructor(
        private _lectureCode: string,
        private _accessCode: string,
        private _lectureTitle : string,
        private _chapters: Array<Chapter>,
        private _settings = {
            continuousRating: false,
            enableTrigger: true,
            triggerStrongNegative: 25,
            triggerLightNegative: 30
        },
        private _currentChapterId : number
    ) { }

    get lectureTitle(): string {
        return this._lectureTitle;
    }

    set lectureTitle(value: string) {
        this._lectureTitle = value;
    }


    get settings(): { triggerStrongNegative: number; enableTrigger: boolean; continuousRating: boolean; triggerLightNegative: number } {
        return this._settings;
    }

    get lectureCode() {
        return this._lectureCode;
    }

    get accessCode() {
        return this._accessCode;
    }

    addQuestion(chapterIndex: number, q: Question) {
        this._chapters[chapterIndex].addQuestion(q);
    }

    deleteQuestion(chapterIndex: number, q: Question) {

        for (let i = 0; i < this._chapters[chapterIndex].questions.length; i++) {
            if (this._chapters[chapterIndex].questions[i] === q) {
                this._chapters[chapterIndex].questions.splice(i, 1);
            }
        }
    }

    get chapters() {
        return this._chapters;
    }

    set chapters(value: Array<Chapter>) {
        this._chapters = value;
    }

    addChapter(title: string,  id?: number,  positionInArray?: number, currentQuestionId?: number) {
        if(id === undefined) id = this._currentChapterId;
        if(positionInArray === undefined) positionInArray = this.chapters.length;
        if(currentQuestionId === undefined) currentQuestionId = 0;
        this._chapters.push(new Chapter(title, Array<Question>(), id, currentQuestionId, positionInArray));
        this._currentChapterId ++;
    }

    deleteChapter(chapter: Chapter) : boolean {
        const index = this._chapters.indexOf(chapter);
        if (index > -1) {
            this._chapters.splice(index, 1);
        }
        return false;
    }

    async getChapterIndexFromTitle(title: string): Promise<number> {
        return new Promise<number>((resolve) => {
            let pos = 0;
            let index = -1;
            for(let c of this._chapters){
                if(c.title.localeCompare(title) === 0){
                    index = pos;
                    break;
                }
                pos++;
            }

            resolve(index);
        });

    }


    get currentChapterId(): number {
        return this._currentChapterId;
    }

    set currentChapterId(value: number) {
        this._currentChapterId = value;
    }

    reapplyChapterPositionInArray() {
        for(let i = 0; i < this.chapters.length; i++) this.chapters[i].positionInArray = i;
    }


    set lectureCode(value: string) {
        this._lectureCode = value;
    }

    set accessCode(value: string) {
        this._accessCode = value;
    }
}
