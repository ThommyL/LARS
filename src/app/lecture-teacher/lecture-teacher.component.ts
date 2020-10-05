import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {Lecture} from "../datastructures/lecture";

import {LectureService} from '../lecture.service';
import {Chapter} from "../datastructures/chapter";
import {ChapterQuestionPair, QuestionSelectionMethods} from '../helper-classes/question-selection-methods'
import {LanguageService} from "../language.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {GlobalDialogsAndSnackbarsComponents} from "../global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {MatSnackBar} from "@angular/material/snack-bar";
import {QuestionTypes} from "../datastructures/question-type.enums";
import {ChapterGraphDataMap} from "./graphing-data-methods";
import {BeforeChapterDeletionDialog} from "../create-lecture/create-lecture.component";

@Component({
    selector: 'app-lecture-teacher',
    templateUrl: './lecture-teacher.component.html',
    styleUrls: ['./lecture-teacher.component.css']
})
export class LectureTeacherComponent implements OnInit {
    currentUnderstanding = [0, 0, 0, 0, 0, 0, 0];

    lecture: Lecture;

    questionTypes = this.languageService.text.question_types;

    qsm = new QuestionSelectionMethods(this.lectureService, this.changeDetectorRef);

    cgdMap = new ChapterGraphDataMap(this.lecture, new Array<Chapter>(), this.lectureService);

    asked = false;

    text = this.languageService.text.lecture_teacher.lecture_teacher_component;

    private dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);

    studentId: number;

    lastUnderstandingEventCount = 0;
    lastQuestionEventCount = 0;
    lastReceivedAnswer = 0;

    studentsInLecture = 0;
    firstUpdate = true;
    understandingDataAvailable = false;

    dataInitialized;

    private sevenColors = [
        {
            backgroundColor: [
                'rgba(129,199,132 ,1)',
                'rgba(174,213,129 ,1)',
                'rgba(220,231,117 ,1)',
                'rgba(255,241,118 ,1)',
                'rgba(255,213,79 ,1)',
                'rgba(255,183,77 ,1)',
                'rgba(255,138,101 ,1)',

            ]
        }
    ];

    constructor(
        private lectureService: LectureService,
        private languageService: LanguageService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit() {
        this.lectureService.clearRunningIntervals();

        this.studentId = Number.parseInt(window.location.href.split('/')[window.location.href.split('/').length - 2]);

        //dummy lecture displayed during loading
        this.lecture = new Lecture('', '', '', new Array<Chapter>(), {
            continuousRating: false,
            enableTrigger: true,
            triggerStrongNegative: 25,
            triggerLightNegative: 30
        }, 0);

        if (this.lectureService.loadLectureCode === undefined) {
            //Could be saved in a cookie to make it reloadable
            this.router.navigate(['welcomeScreen/' + this.studentId + '/' + this.languageService.getLanguageAsString()]);
        } else {
            this.lectureService.deserialize('/lectureServiceAPI/createAndEdit/receiveLecture/' + this.lectureService.loadLectureCode, true)
                .then(result => this.lecture = result)
                .then(() => {
                    this.lectureService.chapterGraphDataMap = new ChapterGraphDataMap(this.lecture, this.lecture.chapters, this.lectureService);
                })
                .then(() => {
                    this.cgdMap = new ChapterGraphDataMap(this.lecture, this.lecture.chapters, this.lectureService);

                    //set parameters for QR-Code
                    this.lectureService.qrCodeAvailable = true;
                    let baseUrl = this.router.url.slice(0, this.router.url.indexOf('/runningLecture/'));
                    this.lectureService.qrCodeUrl = this.lecture.lectureCode;
                })
                .then(() => this.lectureService.receiveActiveQuestions(this.lecture.lectureCode).then((arr) => {
                        let buffer: number;
                        let toggle = true;

                        let data = arr.split(this.lectureService.SEPARATOR);

                        for (let numberString of data) {
                            if (toggle) {
                                buffer = Number.parseInt(numberString);
                            } else {
                                this.lecture.chapters[buffer].questions[Number.parseInt(numberString)].wasAsked = true;
                            }
                            toggle = !toggle;
                        }
                    })
                )
                .then(() => {//fetch data for initialization
                    this.lectureService.getStudentsInLectureCount(this.lecture.accessCode).then((studentsInLecture) => {
                        this.studentsInLecture = studentsInLecture;
                    });
                    this.updateUnderstanding();
                    this.updateAnswers();
                })
                .then(() => {//start intervals
                    this.dataInitialized = true;
                    this.lectureService.addInterval(setInterval(() => {
                        this.updateUnderstanding();
                    }, 5000)); // 5 seconds delay

                    this.lectureService.addInterval(setInterval(() => {
                        this.updateAnswers();
                    }, 10000)); // 10 seconds delay

                    this.lectureService.addInterval(setInterval(() => {
                        this.lectureService.getStudentsInLectureCount(this.lecture.accessCode).then((studentsInLecture) => {
                            this.studentsInLecture = studentsInLecture;
                        });
                    }, 10000)); // 10 seconds delay

                    this.lectureService.addInterval(setInterval(() => {
                        this.checkIfStillRunning()
                    }, 300000)); // 5 minutes delay
                });
        }
    }

    checkIfStillRunning() {
        this.lectureService.checkIfStillRunning(this.lecture.lectureCode).then((isRunning) => {
            if (!isRunning) {
                this.dsc.openSimpleInfoDialog(this.text.lecture_timed_out, false);
                this.router.navigate(['/welcomeScreen/' + this.studentId + '/' + this.languageService.getLanguageAsString()]);
            }
        })
    }

    updateAnswers() {
        this.lectureService.checkIfRefreshNecessary(this.lecture.lectureCode, true, false, this.lastQuestionEventCount).then((actualEventCount) => {
                if (actualEventCount as number > this.lastQuestionEventCount) {
                    this.lectureService.receiveStudentAnswers(this.lecture.accessCode, this.lastReceivedAnswer)
                        .then((data) => {
                            this.lastReceivedAnswer = Number.parseInt(data.splice(0, 1)[0]); //reading and removing the first value
                            let counter = 0;

                            let chapterId: number;
                            let questionId: number;

                            data.forEach((val) => {
                                if (counter % 3 === 0) {
                                    chapterId = Number.parseInt(val);
                                } else if (counter % 3 === 1) {
                                    questionId = Number.parseInt(val);
                                } else {
                                    if (this.cgdMap.chapterData[chapterId].pairs[questionId].question.questionType === QuestionTypes.TextField) {
                                        this.cgdMap.chapterData[chapterId].pairs[questionId].graphData.data.push(val);
                                    } else {
                                        const isMC = (this.cgdMap.chapterData[chapterId].pairs[questionId].question.questionType === QuestionTypes.TextOptions &&
                                            this.cgdMap.chapterData[chapterId].pairs[questionId].question.multipleChoices);

                                        let pos = Array<number>();

                                        if (isMC) { //Special case: Multiple Choice
                                            let incrementAnswerCounterAt = val.split(this.lectureService.ANSWER_OPTIONS_SEPARATOR);
                                            for (let i = 0; i < incrementAnswerCounterAt.length; i++) {
                                                if (incrementAnswerCounterAt[i].localeCompare('1') === 0) pos.push(i);
                                            }
                                        } else {
                                            pos.push(Number.parseInt(val));
                                        }

                                        if (this.cgdMap.chapterData[chapterId].pairs[questionId].question.questionType === QuestionTypes.Slider) {
                                            //reverse order of answers so from slider, so that negative values are on the left side
                                            pos[0] *= -1;

                                            //To counter that the values of the Slider range from -3 to 3:
                                            pos[0] += 3;
                                        }


                                        const newVal = [];

                                        for (let i = 0; i < pos.length; i++) {
                                            newVal[i] = this.cgdMap.chapterData[chapterId].pairs[questionId].graphData.data[pos[i]] + 1;
                                        }

                                        /*
                                        Note as to why copying to arr[] is necessary:
                                        The changeDetection does not react to changes in the content of an array, so the simplest,
                                        albeit not most elegant solution is to just point to a different array. This could be done
                                        in a prettier way by making my own controller (which is overkill for using it to solve the
                                        problem at just this one place) or to initialize the charts in this file and reference them
                                        in the html. This way the update() method from ChartJS could be called on the chart, which
                                        as I understand it would also solve this problem. However, this solution would be very verbose
                                        and the implementation below does not require a lot of additional calculations since the arrays
                                        (except Textoptions) have at most an array size of 5.
                                         */
                                        const arr = [];
                                        for (let i = 0; i < this.cgdMap.chapterData[chapterId].pairs[questionId].graphData.data.length; i++) {
                                            arr.push(this.cgdMap.chapterData[chapterId].pairs[questionId].graphData.data[i]);
                                        }
                                        for (let i = 0; i < pos.length; i++) {
                                            arr[pos[i]] = newVal[i];
                                        }

                                        this.changeDetectorRef.detectChanges();
                                        this.cgdMap.chapterData[chapterId].pairs[questionId].graphData.data = arr;
                                        this.cgdMap.chapterData[chapterId].pairs[questionId].graphData.refreshAnswerCount();

                                    }
                                    this.cgdMap.chapterData[chapterId].pairs[questionId].setExpand(true, true);
                                }
                                counter++;
                            });
                        })
                        .then(() => {
                            // this.dataInitialized = true;
                            this.lastQuestionEventCount = actualEventCount as number;
                        })
                }
            }
        );
    }


    updateUnderstanding() {
        this.lectureService.checkIfRefreshNecessary(this.lecture.lectureCode, true, true, this.lastUnderstandingEventCount).then((actualEventCount) => {
            if (actualEventCount as number > this.lastUnderstandingEventCount) {
                this.lectureService.receiveStudentUnderstandingLecturer(this.lecture.accessCode)
                    .then((arrayData) => {
                        let dataAvailable = false;
                        this.currentUnderstanding = [0, 0, 0, 0, 0, 0, 0];
                        arrayData.split(this.lectureService.SEPARATOR).forEach(x => {
                            dataAvailable = true;

                            //incrementing, but in reverse order (Grade +3 should be the rightmost and -3 the leftmost)
                            this.currentUnderstanding[6 - (Number.parseInt(x) + 3)]++
                        });

                        this.lastUnderstandingEventCount = actualEventCount as number;

                        if (this.firstUpdate) {
                            this.asked = dataAvailable; //opens the panel and un-renders button if dataAvailable
                            this.firstUpdate = false;
                        }

                        this.understandingDataAvailable = dataAvailable;

                    });
            }
        });
    }

    onChangeTab(event) {
        this.qsm.currentChapter = event.index;
    }

    askTickedQuestions() {
        this.qsm.afterActivation(true, this.lecture.lectureCode);
    }

    askAllQuestionsInChapter() {
        this.qsm.tickedQuestions = Array<ChapterQuestionPair>(); //Resetting first, so no question is double
        for (let question of this.lecture.chapters[this.qsm.currentChapter].questions) {
            this.qsm.toggleQuestionSelection(question);
        }

        this.askTickedQuestions();

        this.dsc.openInfoSnackbar(this.text.all_questions_in_current_chapter_asked)
    }

    askUnderstanding() {
        this.resetCurrentUnderstandingGraph();
        this.lectureService.incrementDialogCounter(this.lecture.accessCode);
        this.asked = true;
        this.dsc.openInfoSnackbar(this.text.asked_understanding)
    }

    containsUnaskedQuestion(chapter: number
    ) {
        for (let i = 0; i < this.lecture.chapters[chapter].questions.length; i++) {
            if (!this.lecture.chapters[chapter].questions[i].wasAsked) {
                return true;
            }
        }
        return false;
    }


    get answeredAmount(): number {
        let sum = 0;
        this.currentUnderstanding.forEach(x => sum += x);
        return sum;
    }

    openLectureSettingsDialog() {
        this.dialog.open(LectureSettingsDialog, {
            width: '400px',
            data: {lecture: this.lecture, callback: this}
        });
    }

    openBeforeEndLectureDialog() {
        this.dialog.open(BeforeEndLectureDialog, {
            width: '400px',
            data: {lecture: this.lecture, studentId: this.studentId, dsc: this.dsc}
        });
    }

    resetCurrentUnderstandingGraph() {
        this.lectureService.resetUnderstanding(this.lecture.accessCode);
        this.currentUnderstanding = [0, 0, 0, 0, 0, 0, 0];
    }

    getUnderstandingBackgroundColor(): number {
        if (this.lecture.settings.enableTrigger) {
            if (this.answeredAmount >= 5) {
                let sum = 0;
                for (let amount of this.currentUnderstanding) sum += amount;

                let negative = this.currentUnderstanding[5] + this.currentUnderstanding[6];

                if (negative * 100 / sum > this.lecture.settings.triggerStrongNegative) {
                    return 2;
                } else if (negative * 100 / sum > this.lecture.settings.triggerLightNegative) {
                    return 1
                }
                return 0;
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

}


interface LectureSettingsDialogData {
    lecture: Lecture;
    callback: LectureTeacherComponent;
}

@Component({
    selector: 'lecture-settings-dialog',
    styleUrls: ['dialogs/lecture-settings-dialog/lecture-settings-dialog.css'],
    templateUrl: 'dialogs/lecture-settings-dialog/lecture-settings-dialog.html',
})
export class LectureSettingsDialog implements OnInit {

    text = this.languageService.text.lecture_teacher.lecture_settings_dialog;

    constructor(
        private languageService: LanguageService,
        private lectureService: LectureService,
        private dialogRef: MatDialogRef<LectureSettingsDialog>,
        @Inject(MAT_DIALOG_DATA) private _data: LectureSettingsDialogData) {
    }

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
    }

    onCloseClick(): void {
        this.dialogRef.close();
        this.lectureService.updateLectureSettings(
            this._data.lecture.accessCode,
            this._data.lecture.settings.continuousRating,
            this._data.lecture.settings.triggerStrongNegative,
            this._data.lecture.settings.triggerLightNegative,
            this._data.lecture.settings.enableTrigger);
    }

    adjustStrongTrigger() {
        if (this._data.lecture.settings.triggerLightNegative > this._data.lecture.settings.triggerStrongNegative) {
            this._data.lecture.settings.triggerStrongNegative = this._data.lecture.settings.triggerLightNegative;
        }
    }

    get data(): LectureSettingsDialogData {
        return this._data;
    }
}

interface EndLectureDialogData {
    lecture: Lecture,
    studentId: number,
    dsc: GlobalDialogsAndSnackbarsComponents
}

@Component({
    selector: 'dialogs/before-end-lecture-dialog/before-end-lecture-dialog',
    templateUrl: 'dialogs/before-end-lecture-dialog/before-end-lecture-dialog.html',
})
export class BeforeEndLectureDialog {

    text = this.languageService.text.create_lecture.before_end_lecture_dialog;

    constructor(
        private dialogRef: MatDialogRef<BeforeChapterDeletionDialog>,
        private languageService: LanguageService,
        private lectureService: LectureService,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) private data: EndLectureDialogData) {
    }

    endLecture() {
        this.lectureService.endLecture(this.data.lecture.accessCode);
        this.dialogRef.close();
        this.data.dsc.openInfoSnackbar('Lecture ended 👋');
        this.router.navigate(['/welcomeScreen/' + this.data.studentId + '/' + this.languageService.getLanguageAsString()]);
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

}
