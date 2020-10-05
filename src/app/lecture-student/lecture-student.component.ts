import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {MatSnackBar} from '@angular/material/snack-bar';

import {Lecture} from '../datastructures/lecture';

import {Chapter} from '../datastructures/chapter';
import {LectureService} from '../lecture.service';

import {ChapterQuestionMapPair, QuestionAnswerMap} from './question-answer-map';
import {GlobalDialogsAndSnackbarsComponents} from "../global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {LanguageService} from "../language.service";
import {QuestionTypes} from "../datastructures/question-type.enums";
import {Router} from "@angular/router";


@Component({
    selector: 'app-lecture-student',
    templateUrl: './lecture-student.component.html',
    styleUrls: ['./lecture-student.component.css']
})
export class LectureStudentComponent implements OnInit {
    understanding = 0;
    understandingWasSetAtLeastOnce = false;
    submittedUnderstandingSinceLastDialog = false;
    understandingSubmitted = false;
    noAskedQuestions = true;


    //initialize values
    //Dummy lecture to be displayed while lecture is being loaded
    lecture = new Lecture('', '', '', new Array<Chapter>(), {
        continuousRating: false,
        enableTrigger: true,
        triggerStrongNegative: 25,
        triggerLightNegative: 30
    }, 0);

    currentChapter: number;
    answerMap = Array<ChapterQuestionMapPair>();
    text = this.languageService.text.lecture_student.lecture_student_component;
    enumInstance = QuestionTypes;

    studentId;

    lastUnderstandingEventCount = 0;
    lastQuestionEventCount = 0;
    lastReceivedUnderstandingDialog = 0;

    understandingDialogOpen = false; //Making sure those dialogs do not stack up when left unanswered

    dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);

    initializationDone = false;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private dialog: MatDialog,
        private _lectureService: LectureService,
        private snackbar: MatSnackBar,
        private languageService: LanguageService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this._lectureService.clearRunningIntervals();
        const lectureCodeFromUrl = this._lectureService.retrieveLectureCodeFromUrl();

        if (this._lectureService.USE_COOKIES || this._lectureService.USE_LOCAL_STORAGE) {
            this.studentId = this._lectureService.studentIdFromCookie;
        } else {
            this.studentId = Number.parseInt(window.location.href.split('/')[window.location.href.split('/').length - 2]);
        }

        if (!this._lectureService.USE_LOCAL_STORAGE && !this._lectureService.USE_COOKIES && (this.studentId === 0 || this.studentId === null || this.studentId === undefined)) {
            console.error('Studend id: ' + this.studentId);
            this.router.navigate(['/']);
        } else {
            this._lectureService.checkIfLectureExists(lectureCodeFromUrl, true).then((running) => {
                if (running) {
                    this.currentChapter = 0;
                    this._lectureService.deserialize('/lectureServiceAPI/activeLecture/student/receiveLecture/' + lectureCodeFromUrl, true)
                        .then(result => this.lecture = result)
                        .then(() => {
                            for (let chapter of this.lecture.chapters) {
                                this.answerMap[this.currentChapter] = new ChapterQuestionMapPair(chapter, Array<QuestionAnswerMap>());
                                for (let question of chapter.questions) {
                                    let map = new QuestionAnswerMap(this.changeDetectorRef, this._lectureService, question, this.dsc, this.text);

                                    this.answerMap[this.currentChapter].questionTypeMap.push(map);
                                }
                                this.currentChapter++;
                            }
                            this.currentChapter = 0;

                            //set parametrs for QR-Code
                            this._lectureService.qrCodeAvailable = true;
                            this._lectureService.qrCodeUrl = this.lecture.lectureCode;

                        })
                        .then(() => {
                            this.initializationDone = true;

                            this._lectureService.addInterval(setInterval(() => {
                                this.getLectureSettingsData();
                            }, 12000)); // 12 seconds delay

                            this._lectureService.addInterval(setInterval(() => {
                                this.loadActiveQuestions(true);
                            }, 10000)); // 1 seconds delay

                        })
                        .then(() => {
                            this.getLectureSettingsData();
                            this.loadActiveQuestions(false)
                                .then(() => {
                                    this._lectureService.getAlreadyAnsweredQuestionsStudent(this.studentId, this.lecture.lectureCode).then((data) => {
                                        let toggle = true;
                                        let buffer;
                                        data.forEach((piece) => {
                                            if (toggle) {
                                                buffer = piece;
                                            } else {
                                                this.answerMap[buffer].questionTypeMap[piece].sentToServer = true;
                                                this.answerMap[buffer].renderChapter = false; // Only initialized to false, gets updated further down
                                            }
                                            toggle = !toggle;
                                        });
                                    })
                                })
                                .then(() => {
                                    this.updateRenderChapter();
                                });
                        });
                } else {
                    this.router.navigate(['/welcomeScreen/' + this.studentId + '/' + this.languageService.getLanguageAsString()]);
                }
            });
        }
    }

    updateRenderChapter() {
        return new Promise((resolve) => {
            this.answerMap.forEach((chapter) => {
                chapter.renderChapter = false;
                chapter.questionTypeMap.forEach((question) => {
                    if (question.question.wasAsked && !question.sentToServer) {
                        chapter.renderChapter = true;
                    }
                });
            });
            resolve();
        });
    }

    getLectureSettingsData() {
        this._lectureService.checkIfRefreshNecessary(this.lecture.lectureCode, false, true, this.lastUnderstandingEventCount).then((receivedData) => {
            if (receivedData[0] as number > this.lastUnderstandingEventCount) {
                this._lectureService.getUnderstandingStudent(this.studentId, this.lecture.lectureCode)
                    .then((understanding) => {
                        if (this.understanding != understanding) {
                            this.understandingSubmitted = false;
                            if (understanding === 999 && this.submittedUnderstandingSinceLastDialog && this.understandingWasSetAtLeastOnce) {
                                this.dsc.openSimpleInfoDialog(this.text.understanding_reset, false);
                            }

                            if (understanding === 999) {
                                this.understanding = 0;
                            } else {
                                this.understanding = understanding;
                            }
                        }
                    });
                this.lastUnderstandingEventCount = receivedData[0] as number;
            }

            if ((receivedData[2] as string) === undefined) {
                this.dsc.openSimpleInfoDialog(this.text.lecture_was_ended_by_lecture, false);
                this.router.navigate(['/welcomeScreen/' + this.studentId + '/' + this.languageService.getLanguageAsString()]);
            } else {//undefined when lecture is not running anymore
                let cR = (receivedData[2] as string).localeCompare('1') === 0;

                if (cR != this.lecture.settings.continuousRating) {
                    this.understandingSubmitted = false;
                }

                this.lecture.settings.continuousRating = cR;
            }

            if (receivedData[1] as number > this.lastReceivedUnderstandingDialog) {
                if (!this.lecture.settings.continuousRating && !this.understandingDialogOpen) {
                    this.openRateUnderstandingDialog();
                    this.understandingDialogOpen = true;
                }
                this.lastReceivedUnderstandingDialog = receivedData[1] as number;
            }
        });
    }

    loadActiveQuestions(firstRun: boolean) {
        return new Promise((resolve) => {
            this._lectureService.checkIfRefreshNecessary(this.lecture.lectureCode, false, false, this.lastQuestionEventCount)
                .then((actualEventCount) => {
                    if (actualEventCount > this.lastQuestionEventCount) {
                        this._lectureService.receiveActiveQuestions(this.lecture.lectureCode)
                            .then((arr) => {
                                let buffer: number;
                                let toggle = true;

                                let data = arr.split(this._lectureService.SEPARATOR);

                                for (let numberString of data) {
                                    if (toggle) {
                                        buffer = Number.parseInt(numberString);
                                    } else {
                                        this.answerMap[buffer].questionTypeMap[Number.parseInt(numberString)].question.wasAsked = true;
                                        this.noAskedQuestions = false;
                                    }
                                    toggle = !toggle;
                                }
                            })
                            .then(() => {
                                this.updateRenderChapter().then(() => {
                                    this.lastQuestionEventCount = actualEventCount as number;
                                    resolve();
                                });
                            });
                    }
                })
        });
    }

    openSubmitAnswersDialog() {
        this.dialog.open(SubmitAnswersDialog, {
            width: '400px',
            data: {callbackAddress: this}
        });
    }

    openRateUnderstandingDialog() {
        this.dialog.open(RateUnderstandingDialog, {
            width: '400px',
            data: {callbackAddress: this}
        });
    }

    onChangeTab(event) {
        this.currentChapter = event.index;
    }

    submitAnswers() {
        for(let chapter of this.answerMap){
            for (let pair of chapter.questionTypeMap) {
                if(pair.answered && pair.question.questionType === this.enumInstance.TextField && pair.answer.length > pair.question.answerLengthLimit){
                    this.dsc.openSimpleInfoDialog(this.text.there_exists_an_answer_that_is_too_long + pair.question.questionTitle, true);
                    return;
                }
            }
        }
        this.openSubmitAnswersDialog();
    }

    understandingDialogClosedCallback() {
        this.understandingDialogOpen = false;
    }

    //called only by the submitAnswersDialog via callback, removes answered questions and empty chapters
    submitAnswersCallback() {
        for (let chapter of this.answerMap) {
            let containsEnabled = false;
            for (let pair of chapter.questionTypeMap) {
                if (pair.answered && !pair.sentToServer) {
                    if (pair.question.questionType === QuestionTypes.TextOptions && pair.question.multipleChoices) {
                        let send = '';
                        pair.checkedAnswer.forEach((y) => {
                            send += y ? '1' : '0';
                            send += this._lectureService.ANSWER_OPTIONS_SEPARATOR;
                        });
                        send = send.slice(0, send.length - 1);
                        this._lectureService.putAnswer(this.studentId, this.lecture.lectureCode, chapter.chapter.positionInArray, pair.question.positionInArray, send);
                    } else {
                        this._lectureService.putAnswer(this.studentId, this.lecture.lectureCode, chapter.chapter.positionInArray, pair.question.positionInArray, pair.answer);
                    }

                    pair.answered = true;
                    pair.sentToServer = true;
                } else if (pair.question.wasAsked && !pair.answered) {
                    containsEnabled = true;
                }
            }
            if (!containsEnabled) {
                chapter.renderChapter = false;
            }
        }
        this._lectureService.answeredAvailable = 0;
    }

    //callback method for RateUnderstandingDialog
    setUnderstandingCallback(value: number) {
        this.understandingWasSetAtLeastOnce = true;
        this._lectureService.setUnderstanding(this.studentId, this.lecture.lectureCode, value);
        this.dsc.openInfoSnackbar(this.text.sent);
    }

    underStandingSliderChange() {
        this.understandingSubmitted = true;
        this.understandingWasSetAtLeastOnce = true;
        this.submittedUnderstandingSinceLastDialog = true; //User is notified when his rating is reset
        this._lectureService.setUnderstanding(this.studentId, this.lecture.lectureCode, this.understanding);
        this.dsc.openInfoSnackbar(this.text.sent);
    }

    get lectureService(): LectureService {
        return this._lectureService;
    }
}


interface DialogCallbackData {
    callbackAddress: LectureStudentComponent;
}

@Component({
    selector: 'submit-answers-dialog',
    templateUrl: 'Dialogs/SubmitAnswers/submit-answers-dialog.html',
})
export class SubmitAnswersDialog implements OnInit {
    text = this.languageService.text.lecture_student.submit_answers_dialog;

    dsc: GlobalDialogsAndSnackbarsComponents;

    constructor(
        private languageService: LanguageService,
        private dialogRef: MatDialogRef<SubmitAnswersDialog>,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private data: DialogCallbackData
    ) {
    }

    ngOnInit() {
        this.dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.callbackAddress.submitAnswersCallback();
        this.dsc.openInfoSnackbar(this.text.answer_submitted_snackbartext);
        this.dialogRef.close();
    }
}


@Component({
    selector: 'rate-understanding-dialog',
    templateUrl: 'Dialogs/RateUnderstanding/rate-understanding-dialog.html',
})
export class RateUnderstandingDialog implements OnInit {
    understanding: number;
    text = this.languageService.text.lecture_student.rate_understanding_dialog;

    dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);

    constructor(
        private languageService: LanguageService,
        private dialogRef: MatDialogRef<RateUnderstandingDialog>,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private data: DialogCallbackData) {
    }

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
    }

    onCancelClick(): void {
        this.dialogRef.close();
        this.data.callbackAddress.understandingDialogClosedCallback();
    }

    onOkClick(): void {
        this.data.callbackAddress.setUnderstandingCallback(this.understanding);
        this.dsc.openInfoSnackbar(this.text.answer_submitted_snackbartext);
        this.data.callbackAddress.understandingDialogClosedCallback();
        this.dialogRef.close();
    }
}

