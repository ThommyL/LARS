import {Component, OnInit} from '@angular/core';
import {LectureService} from "./lecture.service";
import {GlobalDialogsAndSnackbarsComponents} from "./global-dialogs-and-snackbars/global-dialogs-and-snackbars-components";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CookieService} from 'ngx-cookie-service';
import {Router} from "@angular/router";


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
    gdsc = new GlobalDialogsAndSnackbarsComponents(this.dialog, this.snackbar);

    constructor(
        private lectureService: LectureService,
        private dialog: MatDialog,
        private snackbar: MatSnackBar,
        private router: Router,
        private cookieService: CookieService
    ) { }

  ngOnInit(): void {
    if (this.lectureService.USE_COOKIES || this.lectureService.USE_LOCAL_STORAGE) {
        if(this.lectureService.USE_COOKIES && this.cookieService.get('LarsStudentId').length === 0){
            this.router.navigate(['/']);
        }

        if(this.lectureService.USE_LOCAL_STORAGE && localStorage.getItem('LarsStudentId') === null){
            this.router.navigate(['/']);
        }
      /*
        Could be saved in the cookie too, then the dialog would not have to open every time someone revisits the website,
        but if you are here to change exactly that, check the legislation before.
         */
      if (!this.lectureService.askedForCookies) this.gdsc.openAskForCookieConsentDialog();
    }
  }

    openImpressum() {
        window.open("https://www.google.com/"); //TODO: Change URL appropriately
    }

    openDatenschutz() {
        window.open("https://www.google.com/"); //TODO: Change URL appropriately
    }
}

//This header is left from the Getting-Started project of Angular https://angular.io/start
/*
Copyright Google LLC. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
