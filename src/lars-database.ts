import {Lecture} from "./app/datastructures/lecture";
import {Logger} from "@overnightjs/logger";
import {Chapter} from "./app/datastructures/chapter";
import {Question} from "./app/datastructures/question";
import {Textoption} from "./app/datastructures/textOption";
import {SerializationMethods} from "./app/serializationMethods";


const sqlite3 = require('sqlite3');

class LarsDatabase {
    db;
    serializationMethods = new SerializationMethods(null, this.SEPARATOR);

    //TODO: setable parameters: Delete Timers
    //Note: HOURS_ UNTIL_DELETE_STUDENT_ID should be mre than HOURS_UNTIL_DELETE_RUNNINGLECTURE, since a runnningLecture can be started again to be active for longer
    HOURS_UNTIL_DELETE_STUDENT_ID = 5; //Warning: Also defined inglobal-dialogs-and-snackar-components.ts
    HOURS_UNTIL_DELETE_RUNNINGLECTURE = 4;


    constructor(dbFilePath, private SEPARATOR: string) {
        this.db = new sqlite3.Database(dbFilePath, (err) => {
            if (err) {
                Logger.Err('Could not connect to database', err)
            } else {
                Logger.Info('Connected to database')
            }
        });

        this.db.run('PRAGMA foreign_keys = 1');

        this.initDatabase().then(() => {
            Logger.Info('Database initialized!');

            this.deleteOldContinuousRatings();
            this.deleteUnusedRecords();

            setInterval(() => {
                this.deleteUnusedRecords();
            }, 3600000); //once every hour

            setInterval(() => {
                this.deleteOldContinuousRatings();
            }, 300000); //once every 5 minutes
        });
    }


    initDatabase() {
        return new Promise((resolve) => {
            const TABLES_TO_CREATE = 10;
            let tablesCreated = 0;

            try {
                Logger.Info('Attempting initialization of database');

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS lecture (' +
                    'accessCode VARCHAR(9) NOT NULL,' +
                    'lectureCode VARCHAR(9) NOT NULL,' +
                    'lectureTitle VARCHAR NOT NULL,' +
                    'continuousRating BOOLEAN NOT NULL,' +
                    'enableTrigger BOOLEAN NOT NULL,' +
                    'triggerStrongNegative INT NOT NULL,' +
                    'triggerLightNegative INT NOT NULL,' +
                    'currentChapterID INT NOT NULL,' +
                    'PRIMARY KEY (accessCode))', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table lecture!', err);
                        } else {
                            tablesCreated++;
                            Logger.Info('Table lecture exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS chapter (' +
                    'chapterTitle VARCHAR NOT NULL,' +
                    'accessCode VARCHAR(9) NOT NULL,' +
                    'currentQuestionID INT NOT NULL,' +
                    'chapterPositionInArray INT NOT NULL,' +
                    'chapterID INT NOT NULL,' +
                    'PRIMARY KEY (chapterID, accessCode)' +
                    'CONSTRAINT chapterDelete' +
                    '    FOREIGN KEY (accessCode)' +
                    '    REFERENCES lecture (accessCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table chapter!', err)
                        } else {
                            tablesCreated++;
                            Logger.Info('Table chapter exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                )

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS question (' +
                    'questionTitle VARCHAR NOT NULL,' +
                    'questionText VARCHAR NOT NULL,' +
                    'questionType VARCHAR NOT NULL,' +
                    'chapterID INT NOT NULL,' +
                    'multipleChoices BOOLEAN,' +
                    'answerLengthLimit INT,' +
                    'currentTextoptionID INT  NOT NULL,' +
                    'questionPositionInArray INT NOT NULL,' +
                    'questionID INT,' +
                    'accessCode VARCHAR(9) NOT NULL,' +
                    'PRIMARY KEY (questionID, chapterID, accessCode)' +
                    'CONSTRAINT questionDelete' +
                    '    FOREIGN KEY (chapterID, accessCode)' +
                    '    REFERENCES chapter (chapterID, accessCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table question!', err);
                        } else {tablesCreated++;
                            Logger.Info('Table question exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS textOption (' +
                    'text VARCHAR NOT NULL,' +
                    'textOptionID INT NOT NULL,' +
                    'textOptionPositionInArray INT NOT NULL,' +
                    'questionID INT NOT NULL,' +
                    'chapterID INT NOT NULL,' +
                    'accessCode VARCHAR(9) NOT NULL,' +
                    'PRIMARY KEY (textOptionID, questionID, chapterID, accessCode)' +
                    'CONSTRAINT textOptionDelete' +
                    '    FOREIGN KEY (questionID, chapterID, accessCode)' +
                    '    REFERENCES question (questionID, chapterID, accessCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table textOption!', err);
                        } else {
                            tablesCreated++;
                            Logger.Info('Table textOption exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS studentId (' +
                    'studentID INT NOT NULL,' +
                    'lectureCode VarChar(9) NOT NULL,' +
                    'timestamp INT NOT NULL,' +
                    'PRIMARY KEY (studentID))', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table studentId!', err);
                        } else {
                            tablesCreated++;
                            Logger.Info('Table studentId exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS runningLecture (' +
                    'lectureCode VARCHAR(9) NOT NULL,' +
                    'currentAnswerID INT NOT NULL,' +
                    'studentsInLecture INT NOT NULL,' +
                    'timestamp INT NOT NULL,' +
                    'PRIMARY KEY (lectureCode))', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table runningLectures!', err)
                        } else {
                            tablesCreated++;
                            Logger.Info('Table runningLecture exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS activeQuestion (' +
                    'lectureCode VARCHAR NOT NULL,' +
                    'chapterID INT NOT NULL,' +
                    'questionID INT NOT NULL,' +
                    'PRIMARY KEY (lectureCode, questionID, chapterID)' +
                    'CONSTRAINT activeQuestionDelete' +
                    '    FOREIGN KEY (lectureCode)' +
                    '    REFERENCES runningLecture (lectureCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table activeQuestion!', err)
                        } else {
                            tablesCreated++;
                            Logger.Info('Table activeQuestion exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS studentUnderstanding (' +
                    'lectureCode VARCHAR NOT NULL,' +
                    'studentID INT NOT NULL,' +
                    'understanding INT NOT NULL,' +
                    'timestamp INT NOT NULL,' +
                    'isContinuousRating BOOLEAN NOT NULL,' +
                    'PRIMARY KEY (lectureCode, studentID)' +
                    'CONSTRAINT studentUnderstandingDelete' +
                    '    FOREIGN KEY (lectureCode)' +
                    '    REFERENCES runningLecture (lectureCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table studentUnderstanding!', err)
                        } else {
                            tablesCreated++;
                            Logger.Info('studentUnderstanding studentId exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                this.db.run(
                    'CREATE TABLE IF NOT EXISTS refreshNecessary (' +
                    'lectureCode VARCHAR NOT NULL,' +
                    'studentEventCounterQuestion INT NOT NULL,' +
                    'lecturerEventCounterQuestion INT NOT NULL,' +
                    'studentEventCounterUnderstanding INT NOT NULL,' +
                    'lecturerEventCounterUnderstanding INT NOT NULL,' +
                    'lastUnderstandingDialogID INT NOT NULL,' +
                    'continuousRating BOOLEAN NOT NULL,' +
                    'PRIMARY KEY (lectureCode)' +
                    'CONSTRAINT refreshNecessaryDelete' +
                    '    FOREIGN KEY (lectureCode)' +
                    '    REFERENCES runningLecture (lectureCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table refreshNecessary!', err)
                        } else {
                            tablesCreated++;
                            Logger.Info('table refreshNecessary exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );

                //Note: answerID exists only for optimising the loading of the questions and does not serve as a key
                this.db.run(
                    'CREATE TABLE IF NOT EXISTS studentAnswer (' +
                    'lectureCode VARCHAR NOT NULL,' +
                    'answerID INT NOT NULL,' +
                    'studentID INT NOT NULL,' +
                    'chapterID INT NOT NULL,' +
                    'questionID INT NOT NULL,' +
                    'answer VARCHAR NOT NULL,' +
                    'PRIMARY KEY (lectureCode, studentID, chapterID, questionID)' +
                    'CONSTRAINT studentAnswerDelete' +
                    '    FOREIGN KEY (lectureCode)' +
                    '    REFERENCES runningLecture (lectureCode)' +
                    '    ON DELETE CASCADE)', (err) => {
                        if (err) {
                            Logger.Err('ERROR at create table studentUnderstanding!', err)
                        } else {
                            tablesCreated++;
                            Logger.Info('table studentAnswer exists');
                            if (tablesCreated >= TABLES_TO_CREATE) resolve();
                        }
                    }
                );
            } catch (e) {
                Logger.Err(e);
            }
        });
    }

    async saveLecture(lecture: Lecture) {
        try {
            if (lecture === undefined || lecture === null) {
                Logger.Err('Encountered undefined lecture when saving');
                return;
            }
            await this.deleteLecture(lecture.accessCode).then(() => {

                if (lecture != undefined) {
                    Logger.Info('Updating lecture: ' + lecture.accessCode);


                    this.insertLecture(lecture).then(() => {
                        for (let chapter of lecture.chapters) {
                            this.insertChapter(lecture, chapter).then(() => {
                                for (let question of chapter.questions) {
                                    this.insertQuestion(lecture, chapter, question).then(() => {
                                        for (let textOption of question.textOptions) {
                                            this.insertTextoption(lecture, chapter, question, textOption);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertLecture(lecture: Lecture) {
        try {
            return new Promise((resolve, reject) => {
                if (lecture === undefined) resolve();
                this.db.run('INSERT OR REPLACE INTO lecture(' +
                    'accessCode, lectureCode, lectureTitle, continuousRating, enableTrigger, triggerStrongNegative, triggerLightNegative' +
                    ', currentChapterID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
                    lecture.accessCode,
                    lecture.lectureCode,
                    lecture.lectureTitle,
                    lecture.settings.continuousRating,
                    lecture.settings.enableTrigger,
                    lecture.settings.triggerStrongNegative,
                    lecture.settings.triggerLightNegative,
                    lecture.currentChapterId
                ], (err) => {
                    if (err) {
                        Logger.Err('ERROR! at insert lecture', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertChapter(lecture: Lecture, chapter: Chapter) {
        try {
            return new Promise((resolve, reject) => {

                this.db.run('INSERT OR REPLACE INTO chapter(chapterTitle, accessCode, currentQuestionID, chapterPositionInArray, chapterID) VALUES (?, ?, ?, ?, ?)', [
                    chapter.title,
                    lecture.accessCode,
                    chapter.currentQuestionId,
                    chapter.positionInArray,
                    chapter.id
                ], (err) => {
                    if (err) {
                        Logger.Err('ERROR at insert chapter!', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertQuestion(lecture: Lecture, chapter: Chapter, question: Question) {
        try {
            if (lecture === undefined || chapter === undefined || question === undefined) return new Promise((resolve => resolve()));

            return new Promise((resolve, reject) => {
                this.db.run('INSERT OR REPLACE INTO question(questionTitle, questionText, questionType, multipleChoices, answerLengthLimit, chapterID, currentTextoptionID, questionPositionInArray, questionID, accessCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                    question.questionTitle,
                    question.questionText,
                    question.questionType,
                    question.multipleChoices,
                    question.answerLengthLimit,
                    chapter.id,
                    question.currentTextOptionsId,
                    question.positionInArray,
                    question.id,
                    lecture.accessCode
                ], (err) => {
                    if (err) {
                        Logger.Err('ERROR at insert question!', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertTextoption(lecture: Lecture, chapter: Chapter, question: Question, textOption: Textoption) {
        try {
            if (lecture === undefined || chapter === undefined || question === undefined || textOption === undefined) return new Promise((resolve => resolve()));

            return new Promise((resolve, reject) => {
                this.db.run('INSERT OR REPLACE INTO textOption(text, textOptionID, textOptionPositionInArray, questionID, chapterID, accessCode) VALUES(?, ?, ?, ?, ?, ?)', [
                    textOption.text,
                    textOption.id,
                    textOption.positionInArray,
                    question.id,
                    chapter.id,
                    lecture.accessCode
                ], (err) => {
                    if (err) {
                        Logger.Err('ERROR at insert textOption!', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    deleteLecture(accessCode: string) {
        try {
            return new Promise((resolve, reject) => {
                this.db.get('SELECT COUNT() as amount FROM lecture WHERE accessCode = ?', [accessCode],
                    (err, row) => {
                        if (err) {
                            Logger.Err('ERROR at delete Lecture!', err);
                            reject(err);
                        } else {
                            if (row.amount > 0) {
                                this.db.run('DELETE FROM lecture WHERE accessCode = ?', [accessCode],
                                    (err) => {
                                        if (err) {
                                            Logger.Err('ERROR at delete Lecture!', err);
                                            reject(err);
                                        } else {
                                            Logger.Info('Deleted lecture ' + accessCode);
                                            resolve();
                                        }
                                    });
                            } else {
                                Logger.Info('Cannot delete. No entry in db for ' + accessCode);
                                resolve();
                            }
                        }
                    });

            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    getLecture(code: string, hideAccessCode: boolean) {
        try {
            return new Promise((resolve) => {
                    const getAccessCode = function (db, code: string): Promise<string> {
                        try {
                            return new Promise<string>((resolve, reject) => {
                                if (code.startsWith('A-')) {
                                    resolve(code);
                                } else if (code.startsWith('L-')) {
                                    db.get('Select accessCode from lecture where lectureCode = ?', [code], (err, row) => {
                                        if (err) {
                                            Logger.Err('Error getting count of lecture');
                                            reject(err);
                                            resolve(null);
                                        } else {
                                            row === undefined ? resolve(null) : resolve(row.accessCode);
                                        }
                                    });
                                } else {
                                    resolve(null);
                                }
                            });
                        } catch (e) {
                            Logger.Err(e);
                            resolve(null)
                        }
                    };

                    getAccessCode(this.db, code)
                        .then((accessCode) => {
                            if (accessCode === null) {
                                resolve(null);
                            } else {
                                return this.reconstructLecture(accessCode)
                            }
                        })
                        .then((lecture) => {
                                if (lecture != null) {
                                    if (hideAccessCode) {
                                        lecture.accessCode = '';
                                    }

                                    this.serializationMethods.serialize(lecture, '', false)
                                        .then((data) => {
                                            resolve(data)
                                        })
                                } else {
                                    resolve('');
                                }
                            }
                        );
                }
            );
        } catch (e) {
            Logger.Err(e);
        }
    }

    reconstructLecture(accessCode): Promise<Lecture> {
        try {
            return new Promise<Lecture>((resolve, reject) => {
                this.db.get('select COUNT() as amount from lecture where accessCode = ?', [accessCode], (err, row) => {
                    Logger.Info('Lecture exists, loading...');
                    let loaded: Lecture;
                    this.db.get('select *, COUNT() as amount from lecture where accessCode = ?', [accessCode], (lectureErr, lectureRow) => {
                        if (lectureErr) {
                            Logger.Err('Error getting count of lecture');
                            Logger.Err(lectureErr);
                            reject(lectureErr);
                        } else {
                            if (lectureRow.amount > 0) {
                                loaded = new Lecture(lectureRow.lectureCode, lectureRow.accessCode, lectureRow.lectureTitle, Array<Chapter>(), {
                                    continuousRating: lectureRow.continuousRating,
                                    enableTrigger: lectureRow.enableTrigger,
                                    triggerStrongNegative: lectureRow.triggerStrongNegative,
                                    triggerLightNegative: lectureRow.triggerLightNegative
                                }, lectureRow.currentChapterID);

                                this.reconstructChapters(accessCode)
                                    .then((chapters) => {
                                        chapters.forEach((chapter) => {
                                            loaded.chapters.push(chapter);
                                        });
                                        Logger.Info('Loaded lecture: ' + accessCode);
                                        this.sortLecturePositions(loaded).then((result) => resolve(result));
                                    });

                            } else {
                                Logger.Warn('No entry in database for ' + accessCode);
                                resolve(null);
                            }
                        }
                    });
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    reconstructChapters(accessCode: string): Promise<Array<Chapter>> {
        try {
            let chapters = Array<Chapter>();
            return new Promise<Array<Chapter>>((resolve, reject) => {
                let count;
                let currentCount = 0;
                this.db.get('Select COUNT() as amount from chapter where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('Error getting count of chapter');
                        Logger.Err(err);
                        reject(err);
                    } else {
                        count = row.amount;

                        if (count === 0) {
                            Logger.Info('No chapters in lecture ' + accessCode);
                            resolve(chapters);
                        } else {
                            this.db.all('select * from chapter where accessCode = ?', [accessCode], (chapterErr, chapterRows) => {
                                if (chapterErr) {
                                    Logger.Err('Error getting chapter');
                                    Logger.Err(chapterErr);
                                    reject(chapterErr);
                                } else {
                                    chapterRows.forEach((chapterRow) => {
                                        let curChapter = new Chapter(chapterRow.chapterTitle, Array<Question>(), chapterRow.chapterID, chapterRow.currentQuestionID, chapterRow.chapterPositionInArray);

                                        let questionsContained;
                                        this.db.get('Select COUNT() as questionsContained from question where accessCode = ? AND chapterID = ?', [accessCode, curChapter.id], (questionsContainedErr, questionsContainedRow) => {
                                            questionsContained = questionsContainedRow.questionsContained;
                                            if (questionsContained > 0) {
                                                this.reconstructQuestions(accessCode, curChapter.id, questionsContained).then((questions) => {
                                                    questions.forEach((question) => curChapter.questions.push(question));
                                                    chapters.push(curChapter);
                                                    currentCount++;
                                                    if (currentCount >= count) {
                                                        resolve(chapters);
                                                    }
                                                });
                                            } else {
                                                chapters.push(curChapter);
                                                currentCount++;
                                                if (currentCount >= count) {
                                                    resolve(chapters);
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    reconstructQuestions(accessCode: string, chapterID: number, questionsContained: number): Promise<Array<Question>> {
        try {
            let questions = Array<Question>();
            return new Promise<Array<Question>>((resolve, reject) => {

                let currentCount = 0;

                this.db.all('select * from question where accessCode = ? AND chapterID = ?', [accessCode, chapterID], (questionErr, questionRows) => {
                    if (questionErr) {
                        Logger.Err('Error getting question');
                        Logger.Err(questionErr);
                        reject(questionErr);
                    } else {
                        questionRows.forEach((questionRow) => {
                            let curQuestion =
                                new Question(questionRow.questionTitle, questionRow.questionText, questionRow.questionType,
                                    Array<Textoption>(), questionRow.questionID, questionRow.currentTextoptionID,
                                    questionRow.questionPositionInArray, questionRow.multipleChoices, questionRow.answerLengthLimit);

                            let textOptionsContained;
                            this.db.get('Select COUNT() as textOptionsContained from textOption where accessCode = ? AND chapterID = ? AND questionID = ?', [accessCode, chapterID, curQuestion.id], (textOptionsContainedErr, textOptionsContainedRow) => {
                                textOptionsContained = textOptionsContainedRow.textOptionsContained;


                                if (textOptionsContained > 0) {
                                    this.reconstructTextoptions(accessCode, chapterID, curQuestion.id, textOptionsContained).then((textOptions) => {
                                        textOptions.forEach((textOption) => {
                                            curQuestion.textOptions.push(textOption);
                                        });
                                        questions.push(curQuestion);

                                        currentCount++;
                                        if (currentCount >= questionsContained) {
                                            resolve(questions);
                                        }
                                    });
                                } else {
                                    questions.push(curQuestion);
                                    currentCount++;
                                    if (currentCount >= questionsContained) {
                                        resolve(questions);
                                    }
                                }
                            });
                        });
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    reconstructTextoptions(accessCode: string, chapterID: number, questionID: number, textOptionsContained: number): Promise<Array<Textoption>> {
        try {
            let textOptions = Array<Textoption>();
            return new Promise<Array<Textoption>>((resolve, reject) => {
                let currentCount = 0;
                if (textOptionsContained === 0) {
                    Logger.Warn('No questions in chapter, method should not have been called. ChapterID: ' + chapterID);
                    resolve(textOptions);
                }

                this.db.all('select * from textOption where accessCode = ? AND chapterID = ? AND questionID = ?', [accessCode, chapterID, questionID], (TextoptionErr, TextoptionRows) => {
                    if (TextoptionErr) {
                        Logger.Err('Error getting textOption');
                        Logger.Err(TextoptionErr);
                        reject(TextoptionErr);
                    } else {
                        TextoptionRows.forEach((textOptionsRow) => {
                            textOptions.push(new Textoption(textOptionsRow.text, textOptionsRow.textOptionID, textOptionsRow.textOptionPositionInArray));
                            currentCount++;
                            if (currentCount >= textOptionsContained) resolve(textOptions);
                        });
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    sortLecturePositions(lecture: Lecture): Promise<Lecture> {
        try {
            return new Promise<Lecture>((resolve) => {
                let chapters = Array<Chapter>();
                let chaptersAdded = 0;

                //sort chapters
                for (let i = 0; i < lecture.chapters.length; i++) {
                    for (let j = 0; j < lecture.chapters.length; j++) {
                        if (lecture.chapters[j].positionInArray === i) {
                            chapters.push(lecture.chapters[j]);
                            chaptersAdded++;
                            break;
                        }
                    }
                }

                if (chaptersAdded != lecture.chapters.length) {
                    try {
                        window.alert('There has been an error loading the lecture, check the console for details');
                    } catch (e) {
                        console.warn('There has been an error loading the lecture, check the console for details');
                    }
                    console.warn('Number of chapters before sorting: ' + lecture.chapters.length + '\nNumber of chapters after sorting: ' + chaptersAdded);
                } else {
                    lecture.chapters = chapters;
                }

                //Sort questions
                for (let chapter of lecture.chapters) {
                    let questions = Array<Question>();
                    let questionsAdded = 0;
                    for (let i = 0; i < chapter.questions.length; i++) {
                        for (let j = 0; j < chapter.questions.length; j++) {
                            if (chapter.questions[j].positionInArray === i) {
                                questions.push(chapter.questions[j]);
                                questionsAdded++;
                                break;
                            }
                        }
                    }

                    if (questionsAdded != chapter.questions.length) {
                        try {
                            window.alert('There has been an error loading the lecture, check the console for details');
                        } catch (e) {
                            console.warn('There has been an error loading the lecture, check the console for details');
                        }
                        console.warn('Number of questions before sorting: ' + chapter.questions.length + '\nNumber of questions after sorting: ' + questionsAdded);
                    } else {
                        chapter.questions = questions;
                    }
                }

                //Sort textOptions
                for (let chapter of lecture.chapters) {
                    for (let question of chapter.questions) {
                        let textOptions = Array<Textoption>();
                        let textOptionsAdded = 0;
                        for (let i = 0; i < question.textOptions.length; i++) {
                            for (let j = 0; j < question.textOptions.length; j++) {
                                if (question.textOptions[j].positionInArray === i) {
                                    textOptions.push(question.textOptions[j]);
                                    textOptionsAdded++;
                                    break;
                                }
                            }
                        }

                        if (textOptionsAdded != question.textOptions.length) {
                            try {
                                window.alert('There has been an error loading the lecture, check the console for details');
                            } catch (e) {
                                console.warn('There has been an error loading the lecture, check the console for details');
                            }
                            console.warn('Number of textOptions before sorting: ' + question.textOptions.length + '\nNumber of textOptions after sorting: ' + textOptionsAdded);
                        } else {
                            question.textOptions = textOptions;
                        }
                    }
                }
                resolve(lecture);
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    validateCode(accessCode: string, forAccessCode: boolean): Promise<boolean> {
        try {
            return new Promise<boolean>((resolve, reject) => {
                let statement: string;
                if (forAccessCode) {
                    statement = 'select COUNT() as amount from lecture where accessCode = ?';
                } else {
                    statement = 'select COUNT() as amount from lecture where lectureCode = ?';
                }

                this.db.get(statement, [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('Error checking validity of code');
                        Logger.Err(err);
                        reject(err);
                    } else {
                        resolve(row.amount === 0);
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    validateStudentId(id: number): Promise<boolean> {
        try {
            return new Promise<boolean>((resolve, reject) => {

                this.db.get('select COUNT() as amount from studentId where studentID = ?', [id], (err, row) => {
                    if (err) {
                        Logger.Err('Error checking validity of studentId');
                        Logger.Err(err);
                        reject(err);
                    } else {
                        resolve(id != 0 && row.amount === 0);
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertStudentID(id: number) {
        try {
            Logger.Info('Inserting Student ID: ' + id);
            return new Promise((resolve, reject) => {
                this.db.run('INSERT OR REPLACE INTO studentId(studentId, lectureCode, timestamp) VALUES (?, ?, ?)', [
                    id,
                    'undefined',
                    Math.floor(Date.now() / 60000) // Unix time in minutes
                ], (err) => {
                    if (err) {
                        Logger.Err('ERROR at insert studentId!', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    checkIfLectureIsRunning(code: string, mustAlsoBeRunning: boolean) {
        try {
            return new Promise<boolean>((resolve, reject) => {

                let isAccessCode = code.startsWith('A-');
                let stmnt = 'select COUNT() as amount from lecture where ';
                stmnt += isAccessCode ? 'accessCode' : 'lectureCode';
                stmnt += ' = ?';

                this.db.get(stmnt, [code], (err, row) => {
                    if (err) {
                        Logger.Err('Error checking existence of code');
                        Logger.Err(err);
                        reject(err);
                    } else {
                        const getCount = function (db) {
                            if (row.amount != 0) {
                                db.get('select COUNT() as amount from runningLecture where lectureCode = ?', [code], (err, row) => {
                                    if (err) {
                                        Logger.Err('Error checking existence of code in checkIfLectureIsRunning');
                                        Logger.Err(err);
                                        reject(err);
                                    } else {
                                        resolve(row.amount != 0);
                                    }
                                });
                            } else {
                                resolve(false);
                            }
                        };

                        if (isAccessCode) {
                            if (!mustAlsoBeRunning) {
                                resolve(row.amount != 0);
                            } else {
                                this.db.get('select lectureCode from lecture where accessCode = ?', [code], (err, row) => {
                                    if (err) {
                                        Logger.Err('Error getting lectureCode in checkIfLectureIsRunning');
                                        Logger.Err(err);
                                        reject(err);
                                    } else {
                                        code = row.lectureCode;
                                        getCount(this.db);
                                    }
                                });
                            }
                        } else {
                            if (!mustAlsoBeRunning) {
                                resolve(row.amount != 0);
                            } else {
                                getCount(this.db);
                            }
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertRunningLecture(accessCode: string) {
        try {
            Logger.Info('Inserted as running lecture, Code: ' + accessCode);
            return new Promise((resolve, reject) => {
                let lectureCode: string;

                this.db.get('select lectureCode from lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('Error checking existence of lectureCode');
                        Logger.Err(err);
                        reject(err);
                    } else {
                        lectureCode = row.lectureCode;
                        this.db.get('Select COUNT() as amount from runningLecture where lectureCode = ?', [lectureCode], (err, row) => {
                            if (row.amount === 0) {
                                this.db.run('INSERT OR REPLACE INTO runningLecture(lectureCode, currentAnswerID, studentsInLecture, timestamp) VALUES (?, ?, ?, ?)', [
                                    lectureCode, 0, 0, Math.floor(Date.now() / 60000) // Unix time in minutes
                                ], (err) => {
                                    if (err) {
                                        Logger.Err('ERROR at insert running Lecture!', err);
                                        reject(err);
                                    } else {

                                        let continuousRating;

                                        this.db.get('Select continuousRating from lecture where accessCode = ?', [accessCode], (err, row) => {
                                            if (err) {
                                                Logger.Err('ERROR at fetching continuous rating for running Lecture!', err);
                                                reject(err);
                                            } else {
                                                continuousRating = row.continuousRating;
                                                this.db.run('INSERT OR REPLACE INTO refreshNecessary(lectureCode, studentEventCounterQuestion, studentEventCounterUnderstanding, lecturerEventCounterQuestion, lecturerEventCounterUnderstanding, lastUnderstandingDialogID, continuousRating) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                                    [lectureCode, 0, 0, 0, 0, 0, continuousRating], (err) => {
                                                        if (err) {
                                                            Logger.Err('ERROR at insert refreshNecessary (at insert running Lecture)!', err);
                                                            reject(err);
                                                        } else {
                                                            resolve();
                                                        }
                                                    });
                                            }
                                        });
                                    }
                                });

                            } else { //If already running, just update the timestamp
                                this.db.run('UPDATE runninglecture set timestamp = ?', [Math.floor(Date.now() / 60000)], (err) => {
                                    if (err) {
                                        Logger.Err('ERROR at update running Lecture!', err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertActiveQuestions(chapterIDs: number[], questionIDs: number[], lectureCode: string) {
        try {
            Logger.Info('Inserting active questions: ' + lectureCode);
            return new Promise<boolean>((resolve, reject) => {

                for (let i = 0; i < chapterIDs.length; i++) {
                    this.db.get('select COUNT() as amount from runningLecture where lectureCode = ?', [lectureCode], (err, row) => {
                        if (err) {
                            Logger.Err('Error checking existence of activeLecture in insertActiveQuestions');
                            Logger.Err(err);
                            reject(err);
                        } else {
                            if (row.amount === 0) {
                                resolve(false);
                            } else {
                                this.db.run('INSERT OR REPLACE INTO activeQuestion(lectureCode, chapterID, questionID) VALUES (?, ?, ?)', [
                                    lectureCode,
                                    chapterIDs[i],
                                    questionIDs[i]
                                ], (err) => {
                                    if (err) {
                                        Logger.Err('ERROR at insert active Question!', err);
                                        reject(err);
                                    } else {
                                        this.incrementEventCounter(lectureCode, true, false).then(() => resolve(true));
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    retrieveActiveQuestions(lectureCode: string): Promise<string> {
        try {
            let arr = '';
            return new Promise<string>((resolve, reject) => {
                let currentCount = 0;
                let amount: number;


                this.db.get('select COUNT() as amount from activeQuestion where lectureCode = ?', [lectureCode], (err, row) => {
                    amount = row.amount;

                    if (amount === 0) {
                        resolve(arr);
                    } else {
                        this.db.all('select * from activeQuestion where lectureCode = ?', [lectureCode], (err, rows) => {
                            if (err) {
                                Logger.Err('Error retrieving active questions');
                                Logger.Err(err);
                                reject(err);
                            } else {
                                rows.forEach((row) => {
                                    arr += row.chapterID + this.SEPARATOR;
                                    arr += row.questionID + this.SEPARATOR;
                                    currentCount++;
                                    if (currentCount >= amount) resolve(arr);
                                });
                            }
                        });
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    endLecture(accessCode: string) {
        try {
            return new Promise((resolve, reject) => {
                this.db.get('Select lectureCode from lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at endLecture!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            Logger.Warn('Undefined Row in endLecture');
                            resolve();
                        } else {
                            let lectureCode = row.lectureCode;

                            this.db.run('Delete from runningLecture where lectureCode = ?', [lectureCode], (err) => {
                                if (err) {
                                    Logger.Err('ERROR at endLecture, delete!', err);
                                    reject(err);
                                } else {
                                    Logger.Info('Ended lecture ' + lectureCode);
                                    resolve();
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    insertStudentUnderstanding(lectureCode: string, studentId: number, understanding: number) {
        try {
            return new Promise((resolve, reject) => {
                this.db.get('Select continuousRating from lecture where lectureCode = ?', [lectureCode],
                    (err, row) => {
                        if (err) {
                            Logger.Err('ERROR at insert StudentUnderstanding!', err);
                            reject(err);
                        } else {
                            if (row === undefined) {
                                Logger.Warn('Undefined Row in insertStudentUnderstanding');
                                resolve();
                            } else {
                                const isContinuousRating = row.continuousRating;
                                this.db.run('INSERT OR REPLACE INTO studentUnderstanding(lectureCode, studentID, understanding, timestamp, isContinuousRating) VALUES (?, ?, ?, ?, ?)', [
                                    lectureCode,
                                    studentId,
                                    understanding,
                                    Math.floor(Date.now() / 60000), // Unix time in minutes
                                    isContinuousRating
                                ], (err) => {
                                    if (err) {
                                        Logger.Err('ERROR at insert StudentUnderstanding!', err);
                                        reject(err);
                                    } else {
                                        this.incrementEventCounter(lectureCode, false, true).then(() => {
                                            resolve()
                                        });
                                    }
                                });
                            }
                        }
                    });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    retrieveStudentUnderstanding(accessCode: string): Promise<string> {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.get('SELECT lectureCode FROM lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lecture Code at StudentUnderstanding!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            Logger.Warn('Undefined Row in retrieveStudentUnderstanding');
                            resolve('');
                        } else {
                            let lectureCode = row.lectureCode;
                            this.db.all('SELECT * FROM studentUnderstanding where lectureCode = ?', [lectureCode], (err, rows) => {
                                if (err) {
                                    Logger.Err('ERROR at insert StudentUnderstanding!', err);
                                    reject(err);
                                } else {
                                    let arr = '';
                                    rows.forEach((row) => {
                                        arr += row.understanding + this.SEPARATOR;
                                    });
                                    resolve(arr.slice(0, arr.length - 1));
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    retrieveUnderstandingForStudent(studentId: number, lectureCode: string) {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.get('SELECT understanding FROM studentUnderstanding where lectureCode = ? AND studentID = ?', [lectureCode, studentId], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at retrieveUnderstandingForStudent!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            resolve('999'); // Not yet answered
                        } else {
                            resolve(row.understanding);
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    resetUnderstanding(accessCode: string) {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.get('SELECT lectureCode FROM lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lectureCode in resetUnderstanding!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            resolve();
                        } else {
                            let lectureCode = row.lectureCode;
                            this.db.run('DELETE FROM studentUnderstanding where lectureCode = ?', [lectureCode], (err) => {
                                if (err) {
                                    Logger.Err('ERROR at deletion in resetUnderstanding!', err);
                                    reject(err);
                                } else {
                                    this.incrementEventCounter(lectureCode, true, true).then(() => resolve());
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }


    returnEventCount(lectureCode: string, isLecturer: boolean, concernsUnderstanding: boolean): Promise<string> {
        try {
            return new Promise<string>((resolve, reject) => {
                let select: string;
                if (isLecturer) {
                    select = concernsUnderstanding ? 'studentEventCounterUnderstanding' : 'studentEventCounterQuestion';
                } else {
                    select = concernsUnderstanding ? 'lecturerEventCounterUnderstanding, lastUnderstandingDialogID, continuousRating' : 'lecturerEventCounterQuestion';
                }

                this.db.get('SELECT ' + select + ' FROM refreshNecessary where lectureCode = ?', [lectureCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at retrieveUnderstandingForStudent!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            if (isLecturer) {
                                resolve('0');
                            } else {
                                concernsUnderstanding ? resolve('0,0,undefined') : resolve('0');
                            }
                        } else {
                            if (isLecturer) {
                                concernsUnderstanding ? resolve(row.studentEventCounterUnderstanding) : resolve(row.studentEventCounterQuestion);
                            } else {
                                concernsUnderstanding ? resolve(row.lecturerEventCounterUnderstanding + this.SEPARATOR + row.lastUnderstandingDialogID + this.SEPARATOR + row.continuousRating) : resolve(row.lecturerEventCounterQuestion);
                            }
                        }
                    }
                });
            });
        } catch
            (e) {
            Logger.Err(e);
        }
    }

    incrementLastUnderstandingDialogID(accessCode: string) {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.get('SELECT lectureCode FROM lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lectureCode in incrementLastUnderstandingDialogID!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            Logger.Warn('Undefined Row in incrementLastUnderstandingDialogID');
                            resolve();
                        } else {
                            let lectureCode = row.lectureCode;
                            this.db.run('Update refreshNecessary Set lastUnderstandingDialogID = lastUnderstandingDialogID +1 where lectureCode = ?', [lectureCode], (err) => {
                                if (err) {
                                    Logger.Err('ERROR at incrementation in incrementLastUnderstandingDialogID!', err);
                                    reject(err);
                                } else {
                                    this.incrementEventCounter(lectureCode, true, true).then(() => resolve());
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    updateLectureSettings(accessCode: string, continuousRating: boolean, triggerStrongNegative: number, triggerLightNegative: number, enableTrigger: boolean) {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.get('SELECT lectureCode FROM lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lectureCode in updateContinuousRating!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            Logger.Warn('Undefined Row in updateLectureSettings');
                            resolve();
                        } else {
                            let lectureCode = row.lectureCode;
                            this.db.run('Update refreshNecessary Set continuousRating = ? where lectureCode = ?', [continuousRating, lectureCode], (err) => {
                                if (err) {
                                    Logger.Err('ERROR at UPDATE refreshNecessary in updateLectureSettings!', err);
                                    reject(err);
                                } else {
                                    this.db.run('Update lecture Set continuousRating = ?, triggerStrongNegative = ?, triggerLightNegative = ?, enableTrigger = ? where accessCode = ?', [continuousRating, triggerStrongNegative, triggerLightNegative, enableTrigger, accessCode], (err) => {
                                        if (err) {
                                            Logger.Err('ERROR at UPDATE lecture in updateLectureSettings!', err);
                                            reject(err);
                                        } else {
                                            this.incrementEventCounter(lectureCode, true, true).then(() => resolve());
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    updateStudentIDLectureCode(studentID: number, lectureCode: string) {
        try {
            return new Promise((resolve, reject) => {
                this.db.run('Update studentId set lectureCode = ? where studentID = ?', [lectureCode, studentID], (err) => {
                    if (err) {
                        Logger.Err('ERROR at incrementEventcounter!', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    incrementEventCounter(lectureCode: string, isLecturer: boolean, concernsUnderstanding: boolean) {
        try {
            return new Promise((resolve, reject) => {
                let select: string;

                if (isLecturer) {
                    select = concernsUnderstanding ? 'lecturerEventCounterUnderstanding' : 'lecturerEventCounterQuestion';
                } else {
                    select = concernsUnderstanding ? 'studentEventCounterUnderstanding' : 'studentEventCounterQuestion';
                }

                let stmnt = 'Update refreshNecessary Set ' + select + ' = ' + select + ' +1 where lectureCode = ?';

                this.db.run(stmnt, [lectureCode], (err) => {
                    if (err) {
                        Logger.Err('ERROR at incrementEventcounter!', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    incrementStudentsInLectureCounter(lectureCode: string, studentId) {
        try {
            return new Promise((resolve, reject) => {
                this.db.get('Select Count() as amount from studentId where lectureCode = ? and studentID = ?', lectureCode, studentId, (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting count in incrementStudentsInLectureCounter!', err);
                        reject(err);
                    } else {
                        if (row.amount === 0) {
                            this.db.run('Update runningLecture set studentsInLecture = studentsInLecture + 1 where lectureCode = ?', [lectureCode], (err) => {
                                if (err) {
                                    Logger.Err('ERROR at incrementation in incrementStudentsInLectureCounter!', err);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    getStudentsInLectureCount(accessCode: string): Promise<number> {
        try {
            return new Promise<number>((resolve, reject) => {
                this.db.get('Select lectureCode from lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lectureCode in getStudentsInLectureCount!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            resolve(0);
                        } else {
                            const lectureCode = row.lectureCode;
                            this.db.get('Select studentsInLecture from runningLecture where lectureCode = ?', [lectureCode], (err, row) => {
                                if (err) {
                                    Logger.Err('ERROR at getting count in getStudentsInLectureCount!', err);
                                    reject(err);
                                } else {
                                    if (row === undefined) {
                                        Logger.Warn('Undefined Row in getStudentsInLectureCount');
                                        resolve(0);
                                    } else {
                                        resolve(row.studentsInLecture);
                                    }
                                }
                            });
                        }
                    }
                });
            });
        } catch
            (e) {
            Logger.Err(e);
        }
    }

    insertStudentAnswer(lectureCode: string, studentID: number, chapterID: number, questionID: number, answer: string) {
        try {
            return new Promise((resolve, reject) => {
                this.db.get('Select currentAnswerID from runningLecture where lectureCode = ?', [lectureCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lectureCode in insertStudentAnswer!', err);
                        reject(err);
                    } else {

                        if (row === undefined) {
                            Logger.Warn('Undefined Row in getStudentsInLectureCount');
                            resolve();
                        } else {
                            const answerID = row.currentAnswerID + 1;

                            this.db.run('Update runningLecture SET currentAnswerID = currentAnswerID + 1 where lectureCode = ?', [lectureCode], (err) => {
                                if (err) {
                                    Logger.Err('ERROR at getting lectureCode in insertStudentAnswer!', err);
                                    reject(err);
                                } else {
                                    this.db.run('INSERT OR REPLACE INTO studentAnswer (lectureCode, answerID, studentID, chapterID, questionID, answer) VALUES(?, ?, ?, ?, ?, ?)',
                                        [
                                            lectureCode,
                                            answerID,
                                            studentID,
                                            chapterID,
                                            questionID,
                                            answer
                                        ]
                                        , (err) => {
                                            if (err) {
                                                Logger.Err('ERROR at insert in insertStudentAnswer!', err);
                                                reject(err);
                                            } else {
                                                this.incrementEventCounter(lectureCode, false, false).then(() => resolve());
                                            }
                                        });
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    getStudentAnswers(accessCode: string, lastLoadedAnswerID: number) {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.get('Select lectureCode from lecture where accessCode = ?', [accessCode], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at getting lectureCode in getStudentAnswers!', err);
                        reject(err);
                    } else {
                        if (row === undefined) {
                            resolve('');
                        } else {
                            const lectureCode = row.lectureCode;
                            this.db.all('Select chapterID, questionID, answer, answerID from studentAnswer where lectureCode = ? AND answerID > ?', [lectureCode, lastLoadedAnswerID], (err, rows) => {
                                if (err) {
                                    Logger.Err('ERROR at getting count in getStudentAnswers!', err);
                                    reject(err);
                                } else {
                                    let resultString = '';
                                    let highestIdNumber = 0;

                                    rows.forEach((row) => {
                                        resultString += row.chapterID + this.SEPARATOR + row.questionID + this.SEPARATOR + row.answer + this.SEPARATOR;
                                        if (Number.parseInt(row.answerID) > highestIdNumber) highestIdNumber = Number.parseInt(row.answerID);
                                    });

                                    resolve(highestIdNumber + this.SEPARATOR + resultString.slice(0, resultString.length - 1));
                                }
                            });
                        }
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    getAnsweredQuestionsStudent(studentId: number, lectureCode: string): Promise<string> {
        try {
            return new Promise<string>((resolve, reject) => {
                this.db.all('Select chapterID, questionID from studentAnswer where lectureCode = ? AND studentID = ?', [lectureCode, studentId], (err, rows) => {
                    if (err) {
                        Logger.Err('ERROR at in getStudentAnswers!', err);
                        reject(err);
                    } else {
                        let resultString = '';

                        rows.forEach((row) => {
                            resultString += row.chapterID + this.SEPARATOR + row.questionID + this.SEPARATOR;
                        });

                        resolve(resultString.slice(0, resultString.length - 1));
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    isStillRunning(code: string) {
        try {
            return new Promise<boolean>((resolve, reject) => {
                const getLectureCode = function (db, code: string): Promise<string> {
                    try {
                        return new Promise<string>((resolve, reject) => {
                            if (code.startsWith('L-')) {
                                resolve(code);
                            } else if (code.startsWith('A-')) {
                                db.get('Select lectureCode from lecture where accessCode = ?', [code], (err, row) => {
                                    if (err) {
                                        Logger.Err('Error getting count of lecture');
                                        reject(err);
                                        resolve(null);
                                    } else {
                                        row === undefined ? resolve(null) : resolve(row.lectureCode);
                                    }
                                });
                            } else {
                                resolve(null);
                            }
                        });
                    } catch (e) {
                        Logger.Err(e);
                        resolve(null)
                    }
                };


                getLectureCode(this.db, code).then((lectureCode) => {
                    if (lectureCode === undefined) {
                        resolve(false);
                    } else {
                        this.db.get('Select COUNT() as amount from runningLecture where lectureCode = ?', [lectureCode], (err, row) => {
                            if (err) {
                                Logger.Err('ERROR at getting count in isStillRunning!', err);
                                reject(err);
                            } else {
                                resolve(row.amount != 0);
                            }
                        });
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

    getAnswerCountForQuestion(lectureCode: string, chapterId: number, questionId: number): Promise<number> {
        try {
            return new Promise<number>((resolve, reject) => {
                this.db.get('Select COUNT() as amount from studentAnswer where lectureCode = ? AND chapterId = ? AND questionId = ?', [lectureCode, chapterId, questionId], (err, row) => {
                    if (err) {
                        Logger.Err('ERROR at in getStudentAnswers!', err);
                        reject(err);
                    } else {
                        resolve(row.amount);
                    }
                });
            });
        } catch (e) {
            Logger.Err(e);
        }
    }

//meant to be run once every hour
    deleteUnusedRecords() {
        try {
            Logger.Warn('Running delete records routine');
            //If the time periods are changed update language.service.ts (all languages)
            this.db.run('Delete from studentId where timestamp < ' + (Math.floor(Date.now() / 60000) - this.HOURS_UNTIL_DELETE_STUDENT_ID * 60)); //Deleting records older than 5 hours
            this.db.run('Delete from runningLecture where timestamp < ' + (Math.floor(Date.now() / 60000) - this.HOURS_UNTIL_DELETE_RUNNINGLECTURE * 60)); //Deleting records older than 4 hours
        } catch (e) {
            Logger.Err(e);
        }
    }

    deleteOldContinuousRatings() {
        try {
            Logger.Info('Deleting old continuous ratings');
            this.db.run('Delete from studentUnderstanding where timestamp < ' + (Math.floor(Date.now() / 60000) - 15)); //Deleting records older than 15 mins
            this.db.run('UPDATE refreshNecessary set studentEventCounterUnderstanding = studentEventCounterUnderstanding + 1'); //Causes refresh at lecturer Component
        } catch (e) {
            Logger.Err(e);
        }
    }
}

export default LarsDatabase;
