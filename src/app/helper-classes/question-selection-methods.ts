import {Question} from "../datastructures/question";
import {LectureService} from "../lecture.service";
import {ChangeDetectorRef} from "@angular/core";

/*
A specialized version of a list, containing those chapters and questions that are selected
 */
export class ChapterQuestionPair {
    constructor(private _chapter: number,
                private _question: Question) {
    }

    get chapter(): number {
        return this._chapter;
    }

    set chapter(value: number) {
        this._chapter = value;
    }

    get question(): Question {
        return this._question;
    }

    set question(value: Question) {
        this._question = value;
    }
}

export class QuestionSelectionMethods {
    tickedQuestions = Array<ChapterQuestionPair>();
    currentChapter = 0;

    constructor(private lectureService: LectureService, private changeDetectorRef: ChangeDetectorRef) {
    }


    toggleQuestionSelection(q: Question) {
        let tickedInChapter = Array<string>();

        //account for the fact that question titles are only unique within a chapter
        for (let pair of this.tickedQuestions) {
            if (pair.chapter === this.currentChapter) tickedInChapter.push(pair.question.questionTitle);
        }

        if (tickedInChapter.includes(q.questionTitle)) {
            this.removeTickedQuestion(q);
        } else {
            this.tickedQuestions.push(new ChapterQuestionPair(this.currentChapter, q));
        }
    }

    removeTickedQuestion(q) {
        let position = 0;
        for (let pair of this.tickedQuestions) {
            /*
            current chapter as a requirement, because question titles are unique only within a chapter and it is not
            possible to unselect a question that is not in the current chapter.
             */
            if (pair.chapter === this.currentChapter && pair.question.questionTitle.localeCompare(q.questionTitle) === 0) {
                this.tickedQuestions.splice(position, 1);
                break;
            }
            position++;
        }
    }


    /**
     * Method that should be called after performing a task on ticked questions in order to un-tick them and mark
     them as asked (the latter is important for lecture-teacher)
     * @param fromLectureTeacherComponent: If true lecture is send to the server for saving
     * @param lectureCode LectureTeacherComponent needs to add the lectureCode in order to save the activeQuestions to the server
     */
    afterActivation(fromLectureTeacherComponent: boolean, lectureCode?: string) {
        let chapterIDs = Array<number>();
        let questionIDs = Array<number>();

        for (let pair of this.tickedQuestions) {
            pair.question.isSelected = false;
            if (fromLectureTeacherComponent) {
                chapterIDs.push(pair.chapter);
                questionIDs.push(pair.question.positionInArray);

                pair.question.wasAsked = true;
            }
        }

        if (fromLectureTeacherComponent) {
            this.lectureService.sendActiveQuestions(lectureCode, chapterIDs, questionIDs).then(() => this.tickedQuestions = Array<ChapterQuestionPair>());
        }

        this.changeDetectorRef.detectChanges();
        this.tickedQuestions = Array<ChapterQuestionPair>();

    }

    questionTickedInCurrentChapter(question: Question): boolean {
        for(let tq of this.tickedQuestions){
            if(tq.chapter === this.currentChapter && tq.question.questionTitle.localeCompare(question.questionTitle) === 0) return true;
        }
        return false;
    }


}
