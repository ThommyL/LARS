import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Lecture} from './datastructures/lecture';

import {SerializationMethods} from "./serializationMethods";

@Injectable({
    providedIn: 'root'
})
export class LectureService {
    public USE_COOKIES = true; //TODO: Changeable parameter: USE_COOKIES (check legislation)
    public USE_LOCAL_STORAGE = false; //TODO: Changeable parameter: USE_LOCAL_STORAGE (Check legislation)

    private _SEPARATOR = '#'; //WARNING: IS ALSO DEFINED IN larsServer.ts AND language.service.ts
    private _ANSWER_OPTIONS_SEPARATOR = '~'; //IS ALSO DEFINED IN language.service.ts

    private _creation;

    private _answeredAvailable = 0;

    private _loadLectureCode;

    private _qrCodeAvailable = false;
    private _qrCodeUrl: string;

    private _chapterGraphDataMap; //variable over which to set received student-answers from server

    private serializationMethods = new SerializationMethods(this.http, this._SEPARATOR);

    private runningIntervals = [];

    private _askedForCookies = false;
    private _studentIdFromCookie: number;

    constructor(private http: HttpClient) {

    }

    async deserialize(dataString: string, isUrl: boolean): Promise<Lecture> {
        return this.serializationMethods.deserialize(dataString, isUrl);
    }

    serialize(store: Lecture) {
        let url = 'lectureServiceAPI/createAndEdit/' + store.accessCode;
        return this.serializationMethods.serialize(store, url, true);
    }

    async deleteLecture(url: string) {
        return new Promise(resolve => {
            this.http.delete(url).subscribe(
                () => resolve()
            );
        });
    }

    validateInput(text: string): boolean {
        if (text === undefined) return true; // Is handled differently and does not matter for saving
        return !(text.includes(this._SEPARATOR) || text.includes(this._ANSWER_OPTIONS_SEPARATOR) || text.includes('\n'));
    }

    set chapterGraphDataMap(value) {
        this._chapterGraphDataMap = value;
    }


    get qrCodeAvailable(): boolean {
        return this._qrCodeAvailable;
    }

    set qrCodeAvailable(value: boolean) {
        this._qrCodeAvailable = value;
    }

    get qrCodeUrl(): string {
        return this._qrCodeUrl;
    }

    set qrCodeUrl(value: string) {
        this._qrCodeUrl = value;
    }

    get answeredAvailable(): number {
        return this._answeredAvailable;
    }

    set answeredAvailable(value: number) {
        this._answeredAvailable = value;
    }

    get loadLectureCode(): string {
        return this._loadLectureCode;
    }

    set loadLectureCode(value: string) {
        this._loadLectureCode = value;
    }

    get creation(): boolean {
        return this._creation;
    }

    set creation(value: boolean) {
        this._creation = value;
    }

    get askedForCookies(): boolean {
        return this._askedForCookies;
    }

    set askedForCookies(value: boolean) {
        this._askedForCookies = value;
    }

    get studentIdFromCookie() {
        return this._studentIdFromCookie;
    }

    set studentIdFromCookie(value) {
        this._studentIdFromCookie = value;
    }


    addInterval(intervall) {
        this.runningIntervals.push(intervall);
    }

    clearRunningIntervals() {
        this.runningIntervals.forEach((interval) => clearInterval(interval));
    }

    retrieveLectureCodeFromUrl(url?: string): string {
        if (url === undefined) url = window.location.href;
        return url.split('/')[url.split('/').length - 3];
    }

    generateLectureCode() {
        return new Promise<string>((resolve) => {
            this.http.get('/lectureServiceAPI/createAndEdit/receiveLectureCode', {responseType: 'text'}).subscribe((code) => resolve(code));
        })
    }

    generateAccessCode() {
        return new Promise<string>((resolve) => {
            this.http.get('/lectureServiceAPI/createAndEdit/receiveAccessCode', {responseType: 'text'}).subscribe((code) => resolve(code));
        })
    }

    sendActiveQuestions(lectureCode: string, chapterIDs: number[], questionIDs: number[]) {
        return new Promise((resolve) => {
            this.http.put('/lectureServiceAPI/activeLecture/lecturer/setActiveQuestions/' + lectureCode, {
                "chapterIDs": chapterIDs,
                "questionIDs": questionIDs
            }).subscribe((exists) => resolve(exists));
        });
    }

    receiveActiveQuestions(lectureCode: string) {
        return new Promise<string>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/receiveActiveQuestions/' + lectureCode, {responseType: 'text'}).subscribe((questions) => resolve(questions));
        })
    }

    endLecture(accessCode: string) {
        return new Promise<string>((resolve) => {
            this.http.delete('/lectureServiceAPI/activeLecture/endLecture/' + accessCode, {responseType: 'text'}).subscribe((done) => resolve(done));
        });
    }

    resetUnderstanding(accessCode: string) {
        return new Promise<string>((resolve) => {
            this.http.delete('/lectureServiceAPI/activeLecture/lecturer/resetUnderstanding/' + accessCode, {responseType: 'text'}).subscribe((done) => resolve(done));
        });
    }

    receiveStudentUnderstandingLecturer(accessCode: string) {
        return new Promise<string>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/lecturer/receiveStudentUnderstanding/' + accessCode, {responseType: 'text'}).subscribe((questions) => {
                resolve(questions);
            });
        })
    }

    setUnderstanding(studentId: number, lectureCode: string, understanding: number) {
        return new Promise<boolean>((resolve) => {
            if (Number.isNaN(understanding)) understanding = 0; //happens when slider was not moved, is equal to pos = 0
            this.http.put('/lectureServiceAPI/activeLecture/student/setUnderstanding/' + studentId + '/' + lectureCode, {
                "understanding": understanding //The '=' is necessary since otherwise the 0 would be interpreted as null
            }).subscribe(() => resolve());
        });
    }

    updateLectureSettings(accessCode: string, continuousRating: boolean, triggerStrongNegative: number, triggerLightNegative: number, enableTrigger: boolean) {
        return new Promise<boolean>((resolve) => {
            this.http.put('/lectureServiceAPI/activeLecture/lecturer/updateLectureSettings/' + accessCode, {
                "continuousRating": continuousRating,
                "triggerStrongNegative": triggerStrongNegative,
                "triggerLightNegative": triggerLightNegative,
                "enableTrigger": enableTrigger
            }).subscribe(() => resolve());
        });
    }

    getUnderstandingStudent(studentId: number, lectureCode: string): Promise<number> {
        return new Promise<number>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/student/getUnderstanding/' + studentId + '/' + lectureCode, {responseType: 'text'}).subscribe((understanding) => {
                resolve(Number.parseInt(understanding.substr(1, understanding.length)));
            });
        });
    }

    checkIfRefreshNecessary(lectureCode: string, isLecturer: boolean, concernsUnderstanding: boolean, currentCount: number) {
        return new Promise((resolve) => {
            let url = '/lectureServiceAPI/activeLecture/isRefreshNecessary/' + lectureCode + '/';
            url += isLecturer ? 'lecturer' : 'student';
            url += '/';
            url += concernsUnderstanding ? 'true' : 'false';
            url += '/' + currentCount;

            this.http.get(url, {responseType: 'text'}).subscribe((eventCount) => {
                if (!isLecturer && concernsUnderstanding) {
                    const dataString = eventCount.slice(1, eventCount.length);
                    const data = [];
                    data.push(Number.parseInt(dataString.split(this._SEPARATOR)[0]));
                    data.push(Number.parseInt(dataString.split(this._SEPARATOR)[1])); //last received rateUnderstanding Dialog
                    data.push(dataString.split(this._SEPARATOR)[2]); // 'true', 'false' or 'undefined' (in case the lecture is not running anymore)
                    resolve(data);
                } else {
                    resolve(Number.parseInt(eventCount.slice(1, eventCount.length)));
                }
            });
        });
    }

    checkIfLectureExists(code: string, mustAlsoBeRunning: boolean) {
        return new Promise<boolean>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/checkIfLectureIsRunning/' + code + '/' + mustAlsoBeRunning, {responseType: 'text'}).subscribe((exists) => {
                resolve(exists.localeCompare('true') === 0);
            });
        });
    }

    incrementDialogCounter(accessCode: string) {
        return new Promise<boolean>((resolve) => {
            this.http.put('/lectureServiceAPI/activeLecture/incrementDialogCounter/' + accessCode, {}).subscribe(() => resolve());
        });
    }

    updateStudentIdLectureCode(lectureCode: string, studentId: number) {
        return new Promise<boolean>((resolve) => {
            this.http.put('/lectureServiceAPI/activeLecture/student/updateLectureCode/' + studentId + '/' + lectureCode, {}).subscribe(() => resolve());
        });
    }

    getStudentsInLectureCount(accessCode: string) {
        return new Promise<number>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/studentsInLectureCount/' + accessCode, {responseType: 'text'}).subscribe((count) => {
                resolve(Number.parseInt(count.slice(1, count.length)))
            });
        });
    }

    putAnswer(studentId: number, lectureCode: string, chapterId: number, questionId: number, answer: string) {
        return new Promise((resolve) => {
            this.http.put('/lectureServiceAPI/activeLecture/student/putAnswer/' + studentId + '/' + lectureCode + '/' + chapterId + '/' + questionId, {
                "answer": answer
            }).subscribe(() => resolve());
        });
    }

    receiveStudentAnswers(accessCode: string, lastLoadedAnswer: number) {
        return new Promise<Array<string>>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/lecturer/getStudentAnswers/' + accessCode + '/' + lastLoadedAnswer, {responseType: 'text'}).subscribe((answersString) => {
                resolve(answersString.split(this._SEPARATOR))
            });
        });
    }

    getAlreadyAnsweredQuestionsStudent(studentId: number, lectureCode: string) {
        return new Promise<Array<number>>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/student/getAnsweredQuestions/' + studentId + '/' + lectureCode, {responseType: 'text'}).subscribe((answersString) => {
                let answersStringArray = answersString.trim().split(this._SEPARATOR);
                let answers = [];
                answersStringArray.forEach((x) => answers.push(Number.parseInt(x)));
                resolve(answers);
            });
        });
    }

    getUniqueStudentID() {
        return new Promise<number>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/receiveUniqueStudentId', {responseType: 'text'}).subscribe((studentId) => {
                resolve(Number.parseInt(studentId));
            });
        });
    }

    startLecture(accessCode: string) {
        return new Promise((resolve) => {
            this.http.put('lectureServiceAPI/activeLecture/lecturer/startLecture/' + accessCode, {}).subscribe(() =>
                resolve()
            );
        });
    }

    get SEPARATOR(): string {
        return this._SEPARATOR;
    }

    checkIfStillRunning(code: string) {
        return new Promise<boolean>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/isStillRunning/' + code, {responseType: 'text'}).subscribe((isRunning) => {
                resolve(isRunning.localeCompare('true') === 0);
            });
        });
    }

    get ANSWER_OPTIONS_SEPARATOR(): string {
        return this._ANSWER_OPTIONS_SEPARATOR;
    }

    getAnswerCountOf(lectureCode: string, qId: number, cId: number) {
        return new Promise<number>((resolve) => {
            this.http.get('/lectureServiceAPI/activeLecture/getAnswerCountForQuestion/' + lectureCode + '/' + qId + '/' + cId, {responseType: 'text'}).subscribe((count) => {
                resolve(Number.parseInt(count.slice(1, count.length)));
            });
        });
    }
}
