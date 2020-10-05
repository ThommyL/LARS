import {ChangeDetectorRef} from "@angular/core";
import {Question} from "../datastructures/question";
import {QuestionTypes} from "../datastructures/question-type.enums";
import {Chapter} from "../datastructures/chapter";
import {LectureService} from "../lecture.service";
import {GlobalDialogsAndSnackbarsComponents} from "../global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";

export class QuestionAnswerMap {

    private _answer; // only manipulable through setter, since it should set 'answered' to true
    checkedAnswer = [];
    private _answered = false;
    private _sentToServer = false;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private lectureService: LectureService,
        private _question: Question,
        private dsc: GlobalDialogsAndSnackbarsComponents,
        private text
    ) {
        let length = 0;
        switch (this.question.questionType) {
            case QuestionTypes.YesNo:
                length = 2;
                break;
            case QuestionTypes.Grades || QuestionTypes.ScaleOfHappiness:
                length = 5;
                break;
            case QuestionTypes.TextOptions:

                length = this.question.textOptions.length;
                if (this.question.multipleChoices) {
                    /*
                    Since with multiple choice questions also the questions which were not ticked are being sent
                    There would be a difference if an option was never clicked (->undefined) or if it was clicked twice
                    (->false). This initialization step serves the unification of this value.
                     */
                    for (let i = 0; i < length; i++) this.checkedAnswer.push(false);
                }
                break;
        }
    }

    get sentToServer(): boolean {
        return this._sentToServer;
    }

    set sentToServer(value: boolean) {
        this._sentToServer = value;
    }

    get answer() {
        return this._answer;
    }

    set answer(value) {
        this.answered = true;
        this._answer = value;

        if(this._question.questionType === QuestionTypes.TextField && value === ''){
            this.resetAnswer();
        }
    }

    get answered(): boolean {
        return this._answered;
    }

    set answered(value: boolean) {
        if (!this.answered) this.lectureService.answeredAvailable++;
        this._answered = value;
    }

    /*
    Other Answers are not resettable, but in case of Textfield and Textoptions (when multiple choices = true) answers there
    is no good way to "keep the last input" that is not annoying for the user.
     */
    resetAnswer(){
        this.answered = false;
        this.lectureService.answeredAvailable--;
    }

    setChecked(change: number) {
        this.changeDetectorRef.detectChanges();

        this.answered = true;

        if (this._question.questionType === QuestionTypes.TextOptions && this._question.multipleChoices) {
            let empty = true;

            for (let i = 0; i < this.checkedAnswer.length; i++) {
                if (this.checkedAnswer[i]) empty = false;
            }

            if (empty) {
                this.checkedAnswer[change] = true; //Cant send an empty answer
                this.dsc.openInfoSnackbar(this.text.at_least_one_ticked)
            }
        } else {
            for (let i = 0; i < this.checkedAnswer.length; i++) {
                this.checkedAnswer[i] = i === change;
            }
        }

        this.answer = change;
    }

    get question(): Question {
        return this._question;
    }

    /*
    Helper method that returns an array with keys for each textOption, since static Array methods are not callable from html
     */
    getKeyArray() {
        if (this.question.textOptions === undefined) return [];
        return Array.from(Array(this.question.textOptions.length).keys());
    }

    initIfNecessary() {
        if (this.answer === undefined) this.answer = 0;
    }
}


export class ChapterQuestionMapPair {
    private _renderChapter = false; //variable that is set to true once a chapter contains a question that was set to asked by the lecturer

    constructor(private _chapter: Chapter, private _questionTypeMap: Array<QuestionAnswerMap>) {
    };

    get renderChapter(): boolean {
        return this._renderChapter;
    }

    set renderChapter(value: boolean) {
        this._renderChapter = value;
    }

    get chapter(): Chapter {
        return this._chapter;
    }

    set chapter(value: Chapter) {
        this._chapter = value;
    }

    get questionTypeMap(): Array<QuestionAnswerMap> {
        return this._questionTypeMap;
    }

    set questionTypeMap(value: Array<QuestionAnswerMap>) {
        this._questionTypeMap = value;
    }
}
