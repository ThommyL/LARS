import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ScrollingModule} from '@angular/cdk/scrolling'

import {AppComponent} from './app.component';
import {ShowQrCodeDialog, TopBarComponent} from './top-bar/top-bar.component';
import {
    QrCodeScannerDialog,
    StopLectureDialog,
    WelcomeScreenComponent
} from './welcome-screen/welcome-screen.component';
import {
    LectureStudentComponent,
    RateUnderstandingDialog,
    SubmitAnswersDialog
} from './lecture-student/lecture-student.component';
import {
    CookieConsentDialog,
    InfoSnackbarComponent,
    SimpleInfoDialog
} from "./global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {
    AddOrEditChaptersDialog,
    BeforeChapterDeletionDialog,
    BeforeLectureDeletionDialog,
    CreateLectureComponent,
    MoveToChapterDialog,
    QuestionDeletedSnackbarComponent,
    QuestionTitlesNotValidDialog,
    ShowAccessCodeDialog,
    StopLectureDialogInCreation,
    TextOptionsDialog
} from './create-lecture/create-lecture.component';
import {LectureService} from './lecture.service';
import {LanguageService} from "./language.service";
import {DemoMaterialModule} from './material-module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    BeforeEndLectureDialog,
    LectureSettingsDialog,
    LectureTeacherComponent
} from './lecture-teacher/lecture-teacher.component';
import {ChangeLanguageDialog, LanguageScreenComponent} from "./language-screen/language-screen-component";

import {ChartsModule} from 'ng2-charts';
import {ZXingScannerModule} from '@zxing/ngx-scanner';
import {QRCodeModule} from 'angular2-qrcode';
import {CookieService} from "ngx-cookie-service";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        DemoMaterialModule,
        BrowserAnimationsModule,
        ScrollingModule,
        ChartsModule,
        QRCodeModule,
        ZXingScannerModule,
        RouterModule.forRoot([
            {path: '', component: LanguageScreenComponent},
            {path: 'welcomeScreen/:studentId/:language', component: WelcomeScreenComponent},
            {path: 'lectureStudent/:lectureId/:studentId/:language', component: LectureStudentComponent},
            {path: 'createLecture/:studentId/:language', component: CreateLectureComponent},
            {path: 'runningLecture/:studentId/:language', component: LectureTeacherComponent}
        ])
    ],
    entryComponents: [
        AppComponent,
        TextOptionsDialog,
        AddOrEditChaptersDialog,
        BeforeChapterDeletionDialog,
        SimpleInfoDialog,
        MoveToChapterDialog,
        InfoSnackbarComponent,
        QuestionDeletedSnackbarComponent,
        SubmitAnswersDialog,
        RateUnderstandingDialog,
        ChangeLanguageDialog,
        ShowQrCodeDialog,
        BeforeLectureDeletionDialog,
        ShowAccessCodeDialog,
        LectureSettingsDialog,
        QrCodeScannerDialog,
        StopLectureDialog,
        BeforeEndLectureDialog,
        StopLectureDialogInCreation,
        QuestionTitlesNotValidDialog,
        CookieConsentDialog
    ],
    declarations: [
        AppComponent,
        TopBarComponent,
        TextOptionsDialog,
        AddOrEditChaptersDialog,
        SimpleInfoDialog,
        MoveToChapterDialog,
        BeforeChapterDeletionDialog,
        InfoSnackbarComponent,
        QuestionDeletedSnackbarComponent,
        WelcomeScreenComponent,
        LectureStudentComponent,
        CreateLectureComponent,
        LectureTeacherComponent,
        SubmitAnswersDialog,
        RateUnderstandingDialog,
        ChangeLanguageDialog,
        ShowQrCodeDialog,
        ShowAccessCodeDialog,
        LectureSettingsDialog,
        QrCodeScannerDialog,
        BeforeLectureDeletionDialog,
        LanguageScreenComponent,
        StopLectureDialog,
        BeforeEndLectureDialog,
        StopLectureDialogInCreation,
        QuestionTitlesNotValidDialog,
        CookieConsentDialog
    ],
    bootstrap: [AppComponent],
    providers: [LectureService, LanguageService, CookieService]
})
export class AppModule {
}


/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
