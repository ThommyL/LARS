import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {LectureService} from '../lecture.service';
import {Lecture} from '../datastructures/lecture';
import {LanguageService} from "../language.service";
import {MatDialog, MatDialogRef} from "@angular/material";
import {GlobalDialogsAndSnackbarsComponents} from "../global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
    selector: 'welcome-screen',
    templateUrl: './welcome-screen.component.html',
    styleUrls: ['./welcome-screen.component.css']
})
export class WelcomeScreenComponent implements OnInit {
    private _lectureCode: string;
    private _startOrAccessCode: string;
    lecture: Lecture;
    text = this.languageService.text.welcome_screen.welcome_screen_component;
    private dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);
    studentId: number;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private lectureService: LectureService,
        private languageService: LanguageService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
    ) {
    }

    ngOnInit(): void {
        this.lectureService.clearRunningIntervals();

        this.lectureService.qrCodeAvailable = false; //Not available from this view

        const urlStudentId = window.location.href.split('/')[window.location.href.split('/').length - 2];

        if (this.lectureService.USE_COOKIES) {
            this.studentId = this.lectureService.studentIdFromCookie;
        } else {
            this.studentId = Number.parseInt(urlStudentId);
        }
    }

    onSubmit(passedLectureCode?: string) { //joining a lecture as student
        if (passedLectureCode != undefined) this._lectureCode = passedLectureCode;
        if (this._lectureCode === undefined || this._lectureCode.length === 0) {
            this.dsc.openSimpleInfoDialog(this.text.no_lectureCode_entered, true);
        } else if (!this._lectureCode.startsWith('L-')) {
            this.dsc.openSimpleInfoDialog(this.text.did_not_start_with_l, true);
        } else if (this._lectureCode.length != 9) {
            this.dsc.openSimpleInfoDialog(this.text.lecture_code_should_consist_of, true);
        } else {
            this.lectureService.checkIfLectureExists(this._lectureCode, true).then((exists) => {
                if (exists) {
                    this.dsc.openSimpleInfoDialog(this.text.no_identifiers, false);
                    if (!this.lectureService.USE_COOKIES && this.studentId === 0) {
                        this.lectureService.getUniqueStudentID().then((studentId) => this.studentId = studentId).then(() => {
                            this.lectureService.updateStudentIdLectureCode(this._lectureCode, this.studentId).then(() => {
                                this.router.navigate(['/lectureStudent/' + this._lectureCode + '/' +
                                this.studentId + '/' + this.languageService.getLanguageAsString()]).then(() => this._lectureCode = '')
                            });
                        });
                    } else {
                        this.lectureService.updateStudentIdLectureCode(this._lectureCode, this.studentId).then(() => {
                            this.router.navigate(['/lectureStudent/' + this._lectureCode + '/' +
                            this.studentId + '/' + this.languageService.getLanguageAsString()]).then(() => this._lectureCode = '')
                        });
                    }
                } else {
                    this.dsc.openSimpleInfoDialog(this.text.lecture_code_not_found_or_not_active, true);
                }
            });
        }
    }

    loadAndStart() {//starting a lecture as lecturer
        this.checkAccessCode(this._startOrAccessCode).then((result) => {
            if (result) {
                this.dsc.openSimpleInfoDialog(this.text.timelimit_info, false);
                this.lectureService.loadLectureCode = this._startOrAccessCode;
                this.lectureService.startLecture(this._startOrAccessCode).then(() => {
                    let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.studentId.toString();
                    this.router.navigate(['runningLecture/' + num + '/' + this.languageService.getLanguageAsString()])
                });
            }
        })
    }

    loadAndEdit() {
        this.checkAccessCode(this._startOrAccessCode).then((result) => {
            if (result) {
                this.lectureService.creation = false;
                this.lectureService.loadLectureCode = this._startOrAccessCode;
                this.lectureService.checkIfLectureExists(this._startOrAccessCode, true).then((exists) => {
                    if (exists) {
                        this.openStopLectureDialog();
                    } else {
                        let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.studentId.toString();
                        this.router.navigate(['/createLecture/' + num + '/' + this.languageService.getLanguageAsString()]);
                    }
                });
            }
        });

    }

    private checkAccessCode(accessCode: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (accessCode === undefined || accessCode.length === 0) {
                this.dsc.openSimpleInfoDialog(this.text.no_access_code_entered, true);
            } else if (!accessCode.startsWith('A-')) {
                this.dsc.openSimpleInfoDialog(this.text.did_not_start_with_a, true)
            } else if (accessCode.length != 9) {
                this.dsc.openSimpleInfoDialog(this.text.access_code_should_consist_of, true);
            } else {
                this.lectureService.checkIfLectureExists(accessCode, false).then((exists) => {
                    if (exists) {
                        resolve(true);
                    } else {
                        this.dsc.openSimpleInfoDialog(this.text.lecture_does_not_exist, true);
                        resolve(false);
                    }
                });
            }
        });
    }

    create() {
        this.lectureService.creation = true;
        // noinspection JSIgnoredPromiseFromCall

        if (!this.lectureService.USE_COOKIES && !this.lectureService.USE_LOCAL_STORAGE && this.studentId === 0) {
            this.lectureService.getUniqueStudentID().then((studentId) => this.studentId = studentId).then(() => {
                this.router.navigate(['/createLecture/' + this.studentId + '/' + this.languageService.getLanguageAsString()]);
            });
        } else {
            let num = this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE ? 'noId' : this.studentId.toString();
            this.router.navigate(['/createLecture/' + num + '/' + this.languageService.getLanguageAsString()]);
        }
    }

    openQrCodeScannerDialog() {
        this.dialog.open(QrCodeScannerDialog, {
            width: '400px', data: {callback: this}
        });
    }

    openStopLectureDialog() {
        this.dialog.open(StopLectureDialog, {
            width: '400px', data: {callback: this, accessCode: this._startOrAccessCode}
        });
    }

    get lectureCode(): string {
        return this._lectureCode;
    }

    set lectureCode(value: string) {
        this._lectureCode = value;
    }

    get startOrAccessCode(): string {
        return this._startOrAccessCode;
    }

    set startOrAccessCode(value: string) {
        this._startOrAccessCode = value;
    }
}


interface CallbackData {
    callback: WelcomeScreenComponent
}

@Component({
    selector: './dialogs/qr-code-scanner-dialog/qr-code-scanner-dialog',
    templateUrl: './dialogs/qr-code-scanner-dialog/qr-code-scanner-dialog.html',
})
export class QrCodeScannerDialog {

    text = this.languageService.text.welcome_screen.qr_code_scanner_dialog;


    constructor(
        private languageService: LanguageService,
        private lectureService: LectureService,
        private dialogRef: MatDialogRef<QrCodeScannerDialog>,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) private data: CallbackData
    ) {
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

    onSuccess(url: string
    ) {
        this.data.callback.onSubmit(url);
        this.dialogRef.close();
    }
}

interface StopLectureDialogData {
    callback: WelcomeScreenComponent,
    accessCode: string
}

@Component({
    selector: './dialogs/stop-lecture-dialog/stop-lecture-dialog',
    templateUrl: './dialogs/stop-lecture-dialog/stop-lecture-dialog.html',
})
export class StopLectureDialog {

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
            this.data.callback.loadAndEdit();
            this.dialogRef.close();
        });
    }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
