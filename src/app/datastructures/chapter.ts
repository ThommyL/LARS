import {Question} from "./question";


export class Chapter {

    constructor(
        private _title: string,
        private _questions: Array<Question>,
        private _id: number,
        private _currentQuestionId: number,
        private _positionInArray: number) {
    }

    get title() {
        return this._title;
    }

    set title(value) {
        this._title = value;
    }

    get questions() {
        return this._questions;
    }

    set questions(value: Array<Question>) {
        this._questions = value;
    }

    addQuestion(q: Question) {
        this._questions.push(q);
        this._currentQuestionId++;
    }

    async containsQuestionTitle(search: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            for (let q of this._questions) {

                if (q.questionTitle.localeCompare(search) === 0) {

                    resolve(true);
                    return;
                }
            }

            resolve(false);

        });

    }


    deleteQuestion(q: Question) {
        this._questions.splice(this._questions.indexOf(q), 1);
    }


    get id(): number {
        return this._id;
    }

    get currentQuestionId(): number {
        return this._currentQuestionId;
    }

    get positionInArray(): number {
        return this._positionInArray;
    }

    set positionInArray(value) {
        this._positionInArray = value;
    }

  reapplyQuestionPositionInArray() {
    for(let i = 0; i < this.questions.length; i++) this.questions[i].positionInArray = i;
  }
}
