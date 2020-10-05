import {Component, OnInit} from "@angular/core";
import {GlobalDialogsAndSnackbarsComponents} from "../global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {LanguageService} from "../language.service";
import {MatDialog, MatDialogRef, MatSnackBar} from "@angular/material";
import {Router} from "@angular/router";
import {LectureService} from "../lecture.service";

@Component({
    selector: 'language-screen-component',
    styleUrls: ['../welcome-screen/welcome-screen.component.css'],
    templateUrl: '../welcome-screen/welcome-screen.component.html'
})
export class LanguageScreenComponent implements OnInit{
    //Mock Properties for the background: (The language screen is actually a separate component, but uses resources of the welcome screen as background)
    lectureCode = '';
    startOrAccessCode = '';

    create() {
    };

    loadAndEdit() {
    }

    loadAndStart() {
    }

    openQrCodeScannerDialog() {
    }

    onSubmit() {
    }

    text = this.languageService.text.welcome_screen.welcome_screen_component;

    constructor(private dialog: MatDialog, private languageService: LanguageService) { }

    ngOnInit(){
        this.openChangeLanguageDialog();
    }

    openChangeLanguageDialog() {
        this.dialog.open(ChangeLanguageDialog, {
            width: '500px'
        });
    }

}


@Component({
    selector: 'change-language-dialog',
    styleUrls: ['./dialogs/change-language-dialog/change-language-dialog.css'],
    templateUrl: './dialogs/change-language-dialog/change-language-dialog.html',
})
export class ChangeLanguageDialog implements OnInit {

    text = this.languageService.text.change_language_component.change_language_dialog;
    dsc: GlobalDialogsAndSnackbarsComponents;


    constructor(
        private dialogRef: MatDialogRef<ChangeLanguageDialog>,
        private lectureService: LectureService,
        private languageService: LanguageService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.lectureService.clearRunningIntervals();

        this.dialogRef.disableClose = true;
        this.dsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);
    }


    setEnglish() {
        this.dialogRef.close();
        this.dsc.openInfoSnackbar(this.text.loading_language_english);
        // noinspection JSIgnoredPromiseFromCall
        this.router.navigate(['/welcomeScreen/0/english']);
    }

    setGerman() {
        this.dialogRef.close();
        this.dsc.openInfoSnackbar(this.text.loading_language_german);
        // noinspection JSIgnoredPromiseFromCall
        this.router.navigate(['/welcomeScreen/0/german']);
    }
}
