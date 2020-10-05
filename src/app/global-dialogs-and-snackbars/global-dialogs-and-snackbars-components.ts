import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MAT_SNACK_BAR_DATA, MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import {LanguageService} from "../language.service";
import {LectureService} from "../lecture.service";
import {CookieService} from "ngx-cookie-service";

export interface SimpleInfoDialogData {
    textProperty: string;
    isError: boolean;
}

export interface InfoSnackbarData {
    snackBarText: string;
}

@Component({
    selector: 'info-snackbar',
    templateUrl: './info-snackbar/info-snackbar.html',
})

export class InfoSnackbarComponent implements OnInit {
    text = this.languageService.text.global_dialogs_and_snackbars_component.info_snackbar;
    snackBarText;

    constructor(
        private languageService: LanguageService,
        @Inject(MAT_SNACK_BAR_DATA) private data: InfoSnackbarData
    ) {
    }

    ngOnInit(): void {
        this.snackBarText = this.data.snackBarText;
    }
}

@Component({
    selector: 'simple-info-dialog',
    templateUrl: './simple-info-dialog/simple-info-dialog.html',
})
export class SimpleInfoDialog {

    text = this.languageService.text.global_dialogs_and_snackbars_component.simple_info_dialog;

    constructor(
        private languageService: LanguageService,
        private dialogRef: MatDialogRef<SimpleInfoDialog>,
        @Inject(MAT_DIALOG_DATA) private _data: SimpleInfoDialogData) {
    }

    close(): void {
        this.dialogRef.close();
    }

    get data(): SimpleInfoDialogData {
        return this._data;
    }
}

@Component({
    selector: 'cookie-consent-dialog',
    templateUrl: './cookie-consent-dialog/cookie-consent-dialog.html',
})
export class CookieConsentDialog implements OnInit {

    text = this.languageService.text.global_dialogs_and_snackbars_component.cookie_consent_dialog;
    leaveToUrl = 'https://www.google.com/'; //TODO: Change the url to the page where the user should be redirected to in case of no consent

    //TODO: setable parameter: Delete Timer
    HOURS_UNTIL_DELETE_STUDENT_ID = 5; //Warning: Also defined in lars-database.ts

    constructor(
        private languageService: LanguageService,
        private dialogRef: MatDialogRef<SimpleInfoDialog>,
        private lectureService: LectureService,
        private cookieService: CookieService
    ) {
    }

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
    }

    consent(): void {
        this.lectureService.askedForCookies = true;

        let cookieValue = '';
        let validValueFound = false;

        if (this.lectureService.USE_LOCAL_STORAGE) {
            //Checking that the Cookie is not older than 5 hours:
            if (localStorage.getItem('LarsStudentId') != null &&
                Number.parseInt(localStorage.getItem('LarsStudentId').split('#')[1]) >
                (Math.floor(Date.now() / 60000) - this.HOURS_UNTIL_DELETE_STUDENT_ID * 60)) {
                cookieValue = localStorage.getItem('LarsStudentId').split('#')[0];
                validValueFound = true;
            }
        } else if (this.lectureService.USE_COOKIES) {
            cookieValue = this.cookieService.get('LarsStudentId');
            if(cookieValue.length > 0) validValueFound = true;
        }

        if (!validValueFound) {
            this.lectureService.getUniqueStudentID().then((studentId) => {
                this.lectureService.studentIdFromCookie = studentId;
                this.updateCookie(studentId.toString());
                this.dialogRef.close();
            });
        } else {
            this.lectureService.studentIdFromCookie = Number.parseInt(cookieValue);

            //refreshing timestamps, as the server does that too on log-in
            this.updateCookie(this.lectureService.studentIdFromCookie.toString());
            this.dialogRef.close();
        }


    }

    updateCookie(val: string) {
        if (this.lectureService.USE_COOKIES) {
            let expire = new Date(Date.now());
            expire.setHours(expire.getHours() + this.HOURS_UNTIL_DELETE_STUDENT_ID);
            this.cookieService.set('LarsStudentId', val, expire, '/');
        }
        if (this.lectureService.USE_LOCAL_STORAGE) {
            //adding time in minutes
            localStorage.setItem('LarsStudentId', val + '#' + Math.floor(Date.now() / 60000));
        }
    }

    noConsent(): void {
        window.location.href = this.leaveToUrl;
        this.dialogRef.close();
    }

}

export class GlobalDialogsAndSnackbarsComponents {

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {

    }

    openSimpleInfoDialog(dialogText: string, isError) {
        this.dialog.open(SimpleInfoDialog, {
            width: '400px',
            data: {textProperty: dialogText, isError: isError}
        });
    }


    openInfoSnackbar(snackBarText: string) {
        this.snackBar.openFromComponent(InfoSnackbarComponent, {
            duration: 2000,
            data: {snackBarText: snackBarText}
        });
    }

    openAskForCookieConsentDialog() {
        this.dialog.open(CookieConsentDialog, {
            width: '400px'
        });
    }
}
