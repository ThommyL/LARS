import {Component} from '@angular/core';
import {LanguageService} from "../language.service";
import {MatDialog, MatDialogRef} from "@angular/material";

import {LectureService} from "../lecture.service";


@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
    text = this._languageService.text.top_bar.top_bar_component;


    constructor(
        private _languageService: LanguageService,
        private lectureService: LectureService,
        private dialog: MatDialog,
    ) { }

    openShowQrCodeDialog() {
        this.dialog.open(ShowQrCodeDialog, {
            width: '500px',
            data: {}
        });
    }

    getStudentId() {
        return window.location.href.split('/')[window.location.href.split('/').length - 2];
    }

    get languageService(): LanguageService {
        return this._languageService;
    }
}

@Component({
    selector: 'change-language-dialog',
    styleUrls: ['./dialogs/show-qr-code-dialog/show-qr-code-dialog.css'],
    templateUrl: 'dialogs/show-qr-code-dialog/show-qr-code-dialog.html',
})
export class ShowQrCodeDialog {

    text = this.languageService.text.top_bar.show_qr_code_dialog;

    constructor(
        private dialogRef: MatDialogRef<ShowQrCodeDialog>,
        private _lectureService: LectureService,
        private languageService: LanguageService
    ) {
    }

    onOkClick(): void {
        this.dialogRef.close();
    }

    get lectureService(): LectureService {
        return this._lectureService;
    }
}

/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
