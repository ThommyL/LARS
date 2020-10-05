import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {MAT_SNACK_BAR_DATA, MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';

import {Lecture} from '../datastructures/lecture';
import {Question} from '../datastructures/question';
import {QuestionTypes} from '../datastructures/question-type.enums'
import {Chapter} from '../datastructures/chapter';

import {LectureService} from '../lecture.service';

import {ChapterQuestionPair, QuestionSelectionMethods} from '../helper-classes/question-selection-methods'
import {GlobalDialogsAndSnackbarsComponents} from "../global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {LanguageService} from "../language.service";
import {Router} from "@angular/router";
import {Textoption} from "../datastructures/textOption";
import {QrCodeScannerDialog} from "../welcome-screen/welcome-screen.component";


@Component({
    selector: 'app-create-lecture',
    templateUrl: './create-lecture.component.html',
    styleUrls: ['./create-lecture.component.css']
})
export class CreateLectureComponent implements OnInit {
    lecture: Lecture;
    questionCreation: boolean;
    questionTypes = this.languageService.text.question_types;
    chosenQuestionType;
    chooseOwnTitle = false;
    questionNumber = 0;
    changeTo = '';
    currentQuestionText = '';
    currentQuestionTitle = '';
    displayAnswerLengthLimit = false;
    enumInstance = QuestionTypes;

    currentAnswerLengthLimit = 500;
    currentAnswerLengthLimitResetTo = this.currentAnswerLengthLimit;
    textLengthLimit = 300;
    chapterNameLimit = 50;
    questionTitleLengthLimit = 65;
    textOptionLengthLimit = 120;
    lectureTitleLengthLimit = 100;

    qsm = new QuestionSelectionMethods(this.lectureService, this.changeDetectorRef);

    dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackBar);

    text = this.languageService.text.create_lecture.create_lecture_component;

    studentId: number;

    constructor(
        private dialog: MatDialog,
        private lectureService: LectureService,
        private snackBar: MatSnackBar,
        private languageService: LanguageService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        //Dummy Lecture displayed during loading
        this.lecture = new Lecture('', '', '', new Array<Chapter>(), {
            continuousRating: false,
            enableTrigger: true,
            triggerStrongNegative: 50,
            triggerLightNegative: 30
        }, 0);


        this.lectureService.clearRunningIntervals();

        if (this.lectureService.USE_COOKIES) {
            this.studentId = this.lectureService.studentIdFromCookie;
        } else {
            this.studentId = Number.parseInt(window.location.href.split('/')[window.location.href.split('/').length - 2]);
        }
        if (!this.lectureService.USE_COOKIES && !this.lectureService.USE_LOCAL_STORAGE && (this.studentId === null || this.studentId === undefined)) {
            console.error('Student id: ' + this.studentId);
            this.router.navigate(['/']);
        } else {
            if (this.lectureService.loadLectureCode === undefined && this.lectureService.creation === false || this.lectureService.creation === undefined) {
                let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.studentId.toString();
                this.router.navigate(['welcomeScreen/' + num + '/' + this.languageService.getLanguageAsString()]);
            } else {
                if (!this.lectureService.creation) {
                    this.lectureService.deserialize('/lectureServiceAPI/createAndEdit/receiveLecture/' + this.lectureService.loadLectureCode, true)
                        .then(result => this.lecture = result)
                        .then(() => {
                            //initialize variables
                            this.questionCreation = false;
                            this.chooseOwnTitle = false;
                            this.generateValidAutoTitle();
                            this.lectureService.qrCodeAvailable = false;
                        });
                }
            }
        }

    }

    openTextOptionsDialog(q: Question) {
        this.dialog.open(TextOptionsDialog, {
            width: '500px',
            data: {question: q, textOptionLengthLimit: this.textOptionLengthLimit}
        });
    }

    openStopLectureDialog() {
        this.dialog.open(StopLectureDialogInCreation, {
            width: '400px', data: {callback: this, accessCode: this.lecture.accessCode}
        });
    }

    openMoveToChapterDialog() {
        this.dialog.open(MoveToChapterDialog, {
            width: '700px',
            data: {
                pairs: this.qsm.tickedQuestions,
                chapters: this.lecture.chapters,
                questionTitleLengthLimit: this.questionTitleLengthLimit,
                callback: this,
            }
        });
    }

    openEditChaptersDialog() {
        this.dialog.open(AddOrEditChaptersDialog, {
            width: '500px',
            data: {
                lecture: this.lecture, chapterNameLimit: this.chapterNameLimit
            }
        });
    }

    openQuestionDeletedSnackbar(question: Question, position: number) {
        this.lecture.deleteQuestion(this.qsm.currentChapter, question);
        this.qsm.removeTickedQuestion(question);
        this.snackBar.openFromComponent(QuestionDeletedSnackbarComponent, {
            duration: 3500,
            data: {question: question, position: position, callback: this, qsm: this.qsm}
        });
    }

    openShowAccessCodeDialog() {
        this.dialog.open(ShowAccessCodeDialog, {
            width: '400px',
            data: {accessCode: this.lecture.accessCode}
        });
    }

    openBeforeLectureDeletionDialog(url: string) {
        this.dialog.open(BeforeLectureDeletionDialog, {
            width: '250px',
            data: {url: url, studentId: this.studentId}
        });
    }

    addQuestion() {
        this.generateValidAutoTitle();
        this.questionCreation = true;
    }

    onSubmit() {
        if (!this.lectureService.validateInput(this.currentQuestionText) ||
            this.chooseOwnTitle && !this.lectureService.validateInput(this.currentQuestionTitle)) {
            this.dsc.openSimpleInfoDialog(this.text.input_may_not_contain_infodialogtext, true);
            return;
        }

        if (this.currentQuestionText.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.choose_question_first_infodialogtext, true);
            return;
        }

        if (this.chosenQuestionType === undefined) {
            this.dsc.openSimpleInfoDialog(this.text.choose_question_type_first_infodialogtext, true);
            return;
        }

        if (this.chooseOwnTitle && this.currentQuestionTitle.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.choose_title_first_infodialogtext, true);
            return;
        }

        if (!this.chooseOwnTitle) this.currentQuestionTitle = this.text.question + ' ' + this.questionNumber;

        if (this.currentQuestionTitle.length > this.questionTitleLengthLimit) {
            this.dsc.openSimpleInfoDialog(this.text.limit_reached_title_1 + ' ' + this.questionTitleLengthLimit + ' ' + this.text.limit_reached_title_2, true);
            return;
        }

        if (this.currentQuestionText.length > this.textLengthLimit) {
            this.dsc.openSimpleInfoDialog(this.text.limit_reached_text_1 + ' ' + this.textLengthLimit + ' ' + this.text.limit_reached_text_2, true);
            return;
        }

        if (this.lecture.chapters[0] === undefined) this.lecture.addChapter('First Chapter');


        this.chosenQuestionType = this.languageService.text.question_types.indexOf(this.chosenQuestionType);

        this.lecture.chapters[this.qsm.currentChapter].containsQuestionTitle(this.currentQuestionTitle).then(result => {
            if (result) {
                this.dsc.openSimpleInfoDialog(this.text.title_already_exists_infodialogtext, true);
                return;
            }
        }).then(() => {
            let q = new Question(this.currentQuestionTitle, this.currentQuestionText, this.chosenQuestionType,
                new Array<Textoption>(), this.lecture.chapters[this.qsm.currentChapter].currentQuestionId,
                0, this.lecture.chapters[this.qsm.currentChapter].questions.length, false, this.currentAnswerLengthLimit);

            //reset variables
            this.chosenQuestionType = undefined;
            this.currentQuestionText = '';
            this.currentQuestionTitle = '';
            this.currentAnswerLengthLimit = this.currentAnswerLengthLimitResetTo;
            this.displayAnswerLengthLimit = false;

            this.questionCreation = false;

            if (q.questionType === QuestionTypes.TextOptions) {
                this.openTextOptionsDialog(q);
            }

            this.lecture.addQuestion(this.qsm.currentChapter, q);

            this.dsc.openInfoSnackbar(this.text.question_added_snackbartext);
        });

    }

    onSelect(event) {
        this.displayAnswerLengthLimit = this.languageService.text.question_types.indexOf(event.value) === QuestionTypes.TextField;
        this.chosenQuestionType = event.value;
    }

    deleteQuestion(q: Question) {
        this.openQuestionDeletedSnackbar(q, this.lecture.chapters[this.qsm.currentChapter].questions.indexOf(q));
    }

    undoDeleteQuestion(question: Question, position: number, ticked: boolean) {
        this.lecture.chapters[this.qsm.currentChapter].questions.splice(position, 0, question);

        if (ticked) this.qsm.toggleQuestionSelection(question);
    }

    moveToChapter() {
        this.openMoveToChapterDialog();
    }

    saveLecture() {
        if (this.lecture.lectureTitle === undefined || this.lecture.lectureTitle.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.please_choose_title_for_lecture_first, true);
            return;
        }

        if (this.lecture.accessCode === undefined || this.lecture.accessCode.length === 0) {
            this.lectureService.generateAccessCode().then((accessCodeResult) => {
                this.lecture.accessCode = accessCodeResult;
                this.lectureService.generateLectureCode().then((lectureCodeResult) => {
                    this.lecture.lectureCode = lectureCodeResult;
                    this.openShowAccessCodeDialog();

                    this.lectureService.serialize(this.lecture);
                    let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.studentId.toString();
                    this.router.navigate(['/welcomeScreen/' + num + '/' + this.languageService.getLanguageAsString()]);
                    this.dsc.openInfoSnackbar(this.text.lecture_saved_snackbartext);
                })
            });
        } else {
            this.lectureService.checkIfStillRunning(this.lecture.accessCode).then((isRunning) => {
                if (isRunning) {
                    this.openStopLectureDialog();
                } else {
                    this.lectureService.serialize(this.lecture);

                    let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.studentId.toString();
                    this.router.navigate(['/welcomeScreen/' + num + '/' + this.languageService.getLanguageAsString()]);
                    this.dsc.openInfoSnackbar(this.text.lecture_saved_snackbartext);
                }
            });
        }


    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.lecture.chapters[this.qsm.currentChapter].questions, event.previousIndex, event.currentIndex);
        this.lecture.chapters[this.qsm.currentChapter].reapplyQuestionPositionInArray();
    }

    changeTitle(q: Question) {
        if (this.changeTo.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.enter_new_title_first_infodialogtext, true);
            return;
        }

        if (this.changeTo.length > this.questionTitleLengthLimit) {
            this.dsc.openSimpleInfoDialog(this.text.limit_reached_title_1 + ' ' + this.questionTitleLengthLimit + ' ' + this.text.limit_reached_title_2, true);
            return;
        }

        if (!this.lectureService.validateInput(this.changeTo)) {
            this.dsc.openSimpleInfoDialog(this.text.input_may_not_contain_infodialogtext, true);
            return;
        }

        this.changeTo = this.changeTo.trim();
        this.lecture.chapters[this.qsm.currentChapter].containsQuestionTitle(this.changeTo)
            .then(result => {
                if (result) {
                    this.dsc.openSimpleInfoDialog(this.text.question_title_already_exists_infodialogtext, true);
                    return;
                }

                q.questionTitle = this.changeTo;

                //resetting variable
                this.changeTo = '';
            });
    }

    changeText(q: Question) {
        if (this.changeTo.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.enter_new_question_title_first_infodialogtext, true);
            return;
        }

        if (this.changeTo.length > this.textLengthLimit) {
            this.dsc.openSimpleInfoDialog(this.text.limit_reached_text_1 + ' ' + this.textLengthLimit + ' ' + this.text.limit_reached_text_2, true);
            return;
        }

        if (!this.lectureService.validateInput(this.changeTo)) {
            this.dsc.openSimpleInfoDialog(this.text.input_may_not_contain_infodialogtext, true);
            return;
        }

        q.questionText = this.changeTo;

        //resetting variable
        this.changeTo = '';
    }

    onSelectChange(event, q: Question) {
        if (this.languageService.text.question_types.indexOf(event.value) === QuestionTypes.TextOptions) {
            this.openTextOptionsDialog(q);
        } else {
            q.textOptions = undefined;
        }
        q.questionType = this.languageService.text.question_types.indexOf(event.value);
    }

    onChangeTab(event) {
        this.qsm.currentChapter = event.index;
        this.generateValidAutoTitle();
    }

    editChapters() {
        this.openEditChaptersDialog();
    }

    private generateValidAutoTitle() {
        if (this.lecture.chapters.length === 0) {
            this.questionNumber = 1;
            return;
        }

        this.questionNumber = this.lecture.chapters[this.qsm.currentChapter].questions.length + 1;
        while (true) {
            let resultingTitle = this.text.question + ' ' + this.questionNumber;
            let validTitle = true;

            for (let q of this.lecture.chapters[this.qsm.currentChapter].questions) {
                if (q.questionTitle.localeCompare(resultingTitle.trim()) === 0) {
                    validTitle = false;
                }
            }

            if (!validTitle) {
                this.questionNumber++;
            } else {
                break;
            }
        }
    }

    deleteLecture() {
        this.openBeforeLectureDeletionDialog('lectureServiceAPI/createAndEdit/' + this.lecture.accessCode);
    }
}


interface TextOptionDialogData {
    question: Question;
    textOptionLengthLimit: number
}

@Component({
    selector: 'text-options-dialog',
    styleUrls: ['./dialogs/textOptions-dialog/text-options-dialog.css'],
    templateUrl: 'dialogs/textOptions-dialog/text-options-dialog.html',
})
export class TextOptionsDialog implements OnInit {
    currentTextOption = '';
    edit = false;
    toEdit: string;

    text = this.languageService.text.create_lecture.text_options_dialog;

    addOrSave = this.text.add; //Initialize Button with text "Add"

    dsc: GlobalDialogsAndSnackbarsComponents;

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<TextOptionsDialog>,
        private lectureService: LectureService,
        private languageService: LanguageService,
        private snackbar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private _data: TextOptionDialogData) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit(): void {
        this.dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);
    }

    onOkClick(): void {
        if (this._data.question.textOptions.length >= 2) {
            this.dialogRef.close();
        } else {
            this.dsc.openSimpleInfoDialog(this.text.at_least_two_entries, true)
        }
    }

    addOrSaveTextOption() {
        this.currentTextOption = this.currentTextOption.trim();

        if (this.currentTextOption.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.enter_something_first, true);
            return;
        }

        if (this.currentTextOption.length > this._data.textOptionLengthLimit) {
            this.dsc.openSimpleInfoDialog(this.text.limit_reached_textOption_1 + ' ' + this._data.textOptionLengthLimit + ' ' + this.text.limit_reached_textOption_2, true);
            return;
        }

        if (!this.lectureService.validateInput(this.currentTextOption)) {
            this.dsc.openSimpleInfoDialog(this.text.input_may_not_contain_infodialogtext, true);
            return;
        }

        if (this._data.question.indexOfTextoption(this.currentTextOption) >= 0) {
            this.dsc.openSimpleInfoDialog(this.text.option_already_exists_infodialogtext, true);
            return;
        }


        //this.toEdit contains value of textOption, this.currentTextOption contains value of textbox
        //Making change or open dialog in case the option already exists
        if (this.edit) {
            if (!this._data.question.editTextOption(this.toEdit, this.currentTextOption)) this.dsc.openSimpleInfoDialog(this.text.option_already_exists_infodialogtext, true);
        } else {
            if (!this._data.question.addTextOption(this.currentTextOption)) this.dsc.openSimpleInfoDialog(this.text.option_already_exists_infodialogtext, true);
        }

        //reset variables
        this.edit = false;
        this.addOrSave = this.text.add;
        this.currentTextOption = '';
    }

    editOption(option: Textoption) {
        this.toEdit = option.text;
        this.edit = true;
        this.currentTextOption = option.text; //initialize textbox to value
        this.addOrSave = this.text.save; //set button label
    }

    deleteOption(option: Textoption) {
        this._data.question.deleteTextOption(option);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this._data.question.textOptions, event.previousIndex, event.currentIndex);
        this._data.question.reapplyTextoptionPositionInArray();
    }

    get data(): TextOptionDialogData {
        return this._data;
    }
}


interface EditChaptersDialogData {
    lecture: Lecture;
    chapterNameLimit: number;
}

@Component({
    selector: 'edit-chapters-dialog',
    styleUrls: ['./dialogs/add-or-edit-chapter-dialog/add-or-edit-chapters-dialog.css'],
    templateUrl: 'dialogs/add-or-edit-chapter-dialog/add-or-edit-chapters-dialog.html',
})
export class AddOrEditChaptersDialog implements OnInit {
    currentChapterName = '';
    edit = false;
    toEdit: string;

    text = this.languageService.text.create_lecture.edit_chapters_dialog;
    addOrSave = this.text.add;

    dsc: GlobalDialogsAndSnackbarsComponents;

    constructor(
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<TextOptionsDialog>,
        private lectureService: LectureService,
        private languageService: LanguageService,
        private snackbar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private _data: EditChaptersDialogData) {
    }

    ngOnInit(): void {
        this.dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);
    }

    openBeforeChapterDeletionDialog(c: Chapter) {
        this.dialog.open(BeforeChapterDeletionDialog, {
            width: '250px',
            data: {lecture: this._data.lecture, chapter: c}
        });
    }

    addOrSaveChapter() {
        this.currentChapterName = this.currentChapterName.trim();

        if (!this.lectureService.validateInput(this.currentChapterName)) {
            this.dsc.openSimpleInfoDialog(this.text.input_may_not_contain_infodialogtext, true);
            return;
        }

        if (this.currentChapterName.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.write_something_first, true);
            return;
        }

        if (this.currentChapterName.length > this._data.chapterNameLimit) {
            this.dsc.openSimpleInfoDialog(this.text.limit_reached_chapter_name_1 + ' ' + this._data.chapterNameLimit + ' ' + this.text.limit_reached_chapter_name_2, true);
            return;
        }

        let addChapter = true;
        this._data.lecture.getChapterIndexFromTitle(this.currentChapterName)
            .then(result => {
                if (result > -1) {
                    this.dsc.openSimpleInfoDialog(this.text.chapter_name_already_exists, true);
                    addChapter = false;
                    return;
                }
            })
            .then(() => {
                this._data.lecture.getChapterIndexFromTitle(this.toEdit)
                    .then(result => {
                        if (addChapter) {
                            if (this.edit) {
                                this._data.lecture.chapters[result].title = this.currentChapterName;
                            } else {
                                this._data.lecture.addChapter(this.currentChapterName);
                            }

                            //reset variables
                            this.edit = false;
                            this.addOrSave = this.text.add;
                            this.currentChapterName = '';
                        }
                    });
            });
    }

    editChapter(chapter) {
        this.toEdit = chapter.title;
        this.edit = true;
        this.addOrSave = this.text.save; //set button text
        this.currentChapterName = chapter.title; // initialize textbox to chapter title
    }

    deleteChapter(chapter) {
        this.openBeforeChapterDeletionDialog(chapter);
    }

    onOkClick(): void {
        this.dialogRef.close();
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this._data.lecture.chapters, event.previousIndex, event.currentIndex);
        this._data.lecture.reapplyChapterPositionInArray();
    }

    get data(): EditChaptersDialogData {
        return this._data;
    }
}


interface BeforeChapterDeletionDialogData {
    lecture: Lecture;
    chapter: Chapter;
}

@Component({
    selector: 'dialogs/before-chapter-deletion-dialog/before-chapter-deletion-dialog',
    templateUrl: 'dialogs/before-chapter-deletion-dialog/before-chapter-deletion-dialog.html',
})
export class BeforeChapterDeletionDialog {

    text = this.languageService.text.create_lecture.before_chapter_deletion_dialog;

    constructor(
        private dialogRef: MatDialogRef<BeforeChapterDeletionDialog>,
        private languageService: LanguageService,
        @Inject(MAT_DIALOG_DATA) private data: BeforeChapterDeletionDialogData) {
    }

    deleteChapter() {
        this.data.lecture.deleteChapter(this.data.chapter);
        this.dialogRef.close();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

}

interface BeforeLectureDeletionDialogData {
    url: string;
    studentId: number;
}

@Component({
    selector: 'dialogs/before-lecture-deletion-dialog/before-lecture-deletion-dialog',
    templateUrl: 'dialogs/before-lecture-deletion-dialog/before-lecture-deletion-dialog.html',
})
export class BeforeLectureDeletionDialog {

    text = this.languageService.text.create_lecture.before_lecture_deletion_dialog;

    constructor(
        private dialogRef: MatDialogRef<BeforeChapterDeletionDialog>,
        private languageService: LanguageService,
        private lectureService: LectureService,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) private data: BeforeLectureDeletionDialogData) {
    }

    deleteLecture() {
        this.lectureService.deleteLecture(this.data.url);
        let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.data.studentId.toString();
        this.router.navigate(['welcomeScreen/' + num + '/' + this.languageService.getLanguageAsString()]).then(() => this.dialogRef.close());
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

}


interface ShowAccessCodeDialogData {
    accessCode: string;
}

@Component({
    selector: 'dialogs/show-edit-code-dialog/show-edit-code-dialog',
    templateUrl: 'dialogs/show-edit-code-dialog/show-edit-code-dialog.html',
})

/*
A dialog just for showing the access code. The reason for this is in order to not expose this code when the lecturer
edits the lecture while the projector is on.
 */
export class ShowAccessCodeDialog {

    text = this.languageService.text.create_lecture.show_access_code_dialog;

    constructor(
        private dialogRef: MatDialogRef<ShowAccessCodeDialog>,
        private languageService: LanguageService,
        @Inject(MAT_DIALOG_DATA) private _data: ShowAccessCodeDialogData) {
    }


    onOkClick(): void {
        this.dialogRef.close();
    }

    get data(): ShowAccessCodeDialogData {
        return this._data;
    }
}


interface MoveToChapterDialogData {
    pairs: Array<ChapterQuestionPair>;
    chapters: Array<Chapter>;
    callback: CreateLectureComponent;
    questionTitleLengthLimit: number
}

@Component({
    selector: 'move-to-chapter-dialog',
    styleUrls: ['./dialogs/move-to-chapter-dialog/move-to-chapter-dialog.css'],
    templateUrl: 'dialogs/move-to-chapter-dialog/move-to-chapter-dialog.html',
})
export class MoveToChapterDialog {

    text = this.languageService.text.create_lecture.move_to_chapter_dialog;
    dsc = new GlobalDialogsAndSnackbarsComponents(this._dialog, this.snackbar);
    invalidQuestions = Array<ChapterQuestionPair>();

    constructor(
        private _dialogRef: MatDialogRef<MoveToChapterDialog>,
        private languageService: LanguageService,
        private _dialog: MatDialog,
        private snackbar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private _data: MoveToChapterDialogData) {
    }

    onOkClick(): void {
        this._dialogRef.close();
    }

    moveHere(chapter: Chapter) {
        this.invalidQuestions = Array<ChapterQuestionPair>();

        for (let pair of this._data.pairs) {
            for (let question of chapter.questions) {
                if (pair.question.questionTitle.localeCompare(question.questionTitle) === 0 && pair.chapter != chapter.positionInArray) {
                    this.invalidQuestions.push(pair);
                }
            }
        }

        if (this.invalidQuestions.length > 0) {
            this.openChapterTitlesNotValidDialog(chapter);
            return;
        }

        for (let pair of this._data.pairs) {
            this._data.chapters[pair.chapter].deleteQuestion(pair.question);
            chapter.questions.push(pair.question);
        }
        this._data.callback.qsm.afterActivation(false);
        this._dialogRef.close();
    }

    openChapterTitlesNotValidDialog(targetChapter: Chapter) {
        this._dialog.open(QuestionTitlesNotValidDialog, {
            width: '700px',
            data: {
                pairs: this.invalidQuestions,
                questionTitleLengthLimit: this._data.questionTitleLengthLimit,
                targetChapter: targetChapter,
                callback: this,
            }
        });
    }

    renameAndMove(pairsChanged: string[], targetChapter: Chapter) {
        for(let i = 0; i < this.invalidQuestions.length; i++){
            this.invalidQuestions[i].question.questionTitle = pairsChanged[i];
        }
        this.moveHere(targetChapter);
    }

    get data(): MoveToChapterDialogData {
        return this._data;
    }

    set data(value: MoveToChapterDialogData) {
        this._data = value;
    }

    get dialog(): MatDialog {
        return this._dialog;
    }
}

interface ChapterTitlesNotValidDialogData {
    pairs: Array<ChapterQuestionPair>;
    questionTitleLengthLimit: number;
    targetChapter: Chapter;
    callback: MoveToChapterDialog;
}

@Component({
    selector: 'question-titles-not-valid-dialog',
    styleUrls: ['./dialogs/question-titles-not-valid-dialog/question-titles-not-valid-dialog.css'],
    templateUrl: 'dialogs/question-titles-not-valid-dialog/question-titles-not-valid-dialog.html',
})
export class QuestionTitlesNotValidDialog implements OnInit{

    pairsToChange = new Array<string>();
    pairsChanged = new Array<string>();

    text = this.languageService.text.create_lecture.question_titles_not_valid_dialog;
    dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);

    currentQuestionTitle = '';
    edit = false;
    toEdit: string;
    oldTitle: string;

    alreadyUsedTitles= new Array<string>();

    saveOrNext = this.text.next; //Initialize Button with text "Add"
    questionNumber: number;

    constructor(
        private dialogRef: MatDialogRef<MoveToChapterDialog>,
        private lectureService: LectureService,
        private languageService: LanguageService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) private _data: ChapterTitlesNotValidDialogData) {
    }

    ngOnInit(): void {
        for (let pair of this._data.pairs) {
            this.pairsToChange.push(pair.question.questionTitle); //Elements get removed from here (and therefor from view) when edited
            this.pairsChanged.push(pair.question.questionTitle); //Elements get adapted when edited
        }
    }

    onOkClick(): void {
        this.dialogRef.close();
    }

    saveOrNextQuestionTitle() {
        if (this.saveOrNext.localeCompare(this.text.next) === 0 && this.pairsToChange.length >= 1) {
            this.editTitle(this.pairsToChange[0]);
        } else {
            this.currentQuestionTitle = this.currentQuestionTitle.trim();

            if (this.currentQuestionTitle.length === 0) {
                this.dsc.openSimpleInfoDialog(this.text.enter_something_first, true);
                return;
            }

            if (this.currentQuestionTitle.length > this._data.questionTitleLengthLimit) {
                this.dsc.openSimpleInfoDialog(this.text.limit_reached_question_title_1 + ' ' + this._data.questionTitleLengthLimit + ' ' + this.text.limit_reached_question_title_2, true);
                return;
            }

            if (!this.lectureService.validateInput(this.currentQuestionTitle)) {
                this.dsc.openSimpleInfoDialog(this.text.input_may_not_contain_infodialogtext, true);
                return;
            }

            let alreadyContained = false;

            for (let question of this._data.targetChapter.questions) {
                if (this.currentQuestionTitle.localeCompare(question.questionTitle) === 0) {
                    alreadyContained = true;
                    break;
                }
            }

            if (!alreadyContained) {
                for (let usedTitle of this.alreadyUsedTitles) {
                    if (this.currentQuestionTitle.localeCompare(usedTitle) === 0) {
                        alreadyContained = true;
                        break;
                    }
                }

                if (!alreadyContained) {
                    this.setNewTitle(this.oldTitle, this.currentQuestionTitle);
                }

            } else
                this.dsc.openSimpleInfoDialog(this.text.already_contained, true);
        }

    }

    editTitle(pair: string) {
        this.toEdit = pair;
        this.oldTitle = pair;
        this.edit = true;
        this.currentQuestionTitle = pair; //initialize textbox to value
        this.saveOrNext = this.text.save; //set button label
    }

    autoGenerateTitle(oldTitle: string) {
        this.questionNumber = this._data.targetChapter.questions.length + 1;
        while (true) {
            let resultingTitle = this.text.question + ' ' + this.questionNumber;
            let validTitle = true;

            for (let question of this.alreadyUsedTitles) {
                if (question.localeCompare(resultingTitle.trim()) === 0) {
                    validTitle = false;
                }
            }

            for (let question of this._data.targetChapter.questions) {
                if (question.questionTitle.localeCompare(resultingTitle.trim()) === 0) {
                    validTitle = false;
                }
            }

            if (!validTitle) {
                this.questionNumber++;
            } else {
                break;
            }
        }

        this.setNewTitle(oldTitle, this.text.question + ' ' + this.questionNumber);
    }

    setNewTitle(formerTitle: string, newTitle: string) {

        this.edit = false;
        this.saveOrNext = this.text.next;
        this.currentQuestionTitle = '';

        this.alreadyUsedTitles.push(newTitle);

        for(let i = 0; i < this.pairsChanged.length; i++){
            if (this.pairsChanged[i].localeCompare(formerTitle) === 0) {
                this.pairsChanged[i] = newTitle;
            }
        }


        for(let i = 0; i < this.pairsToChange.length; i++){
            if (this.pairsToChange[i].localeCompare(formerTitle) === 0) {
                this.pairsToChange.splice(i, 1);
            }
        }

        if (this.pairsToChange.length === 0) {
            this._data.callback.renameAndMove(this.pairsChanged, this._data.targetChapter);
            this.dialogRef.close();
        }
    }

    get data(): ChapterTitlesNotValidDialogData {
        return this._data;
    }
}




interface QuestionDeletedSnackbarData {
    question: Question;
    position: number;
    callback: CreateLectureComponent;
    qsm: QuestionSelectionMethods;
}

@Component({
    selector: 'question-deleted-snackbar',
    templateUrl: 'snackbars/questions-deleted-snackbar/question-deleted-snackbar.html',
})

export class QuestionDeletedSnackbarComponent {
    title;
    text = this.languageService.text.create_lecture.question_deleted_snackbar;
    ticked = this.data.qsm.questionTickedInCurrentChapter(this.data.question);

    constructor(
        private languageService: LanguageService,
        private snackBarRef: MatSnackBarRef<QuestionDeletedSnackbarComponent>,
        @Inject(MAT_SNACK_BAR_DATA) private data: QuestionDeletedSnackbarData) {
    }

    undo() {
        this.snackBarRef.dismiss();
        this.data.callback.undoDeleteQuestion(this.data.question, this.data.position, this.ticked);
    }
}

interface StopLectureDialogData {
    callback: CreateLectureComponent,
    accessCode: string
}

@Component({
    selector: './dialogs/stop-lecture-dialog/stop-lecture-dialog',
    templateUrl: './dialogs/stop-lecture-dialog/stop-lecture-dialog.html',
})
export class StopLectureDialogInCreation {

    text = this.languageService.text.welcome_screen.stop_lecture_dialog;

    constructor(
        private languageService: LanguageService,
        private lectureService: LectureService,
        private dialogRef: MatDialogRef<QrCodeScannerDialog>,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) private data: StopLectureDialogData
    ) {
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onStopLectureClick() {
        this.lectureService.endLecture(this.data.accessCode).then(() => {
            this.data.callback.saveLecture();
            this.dialogRef.close();
        });
    }
}

