import {Injectable} from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    SEPARATOR = '#'; //WARNING: IS ALSO DEFINED IN larsServer.ts AND lecture.service.ts
    private ANSWER_OPTIONS_SEPARATOR = '~'; //IS ALSO DEFINED IN lecture.service.ts


    private english = {
        question_types: ['Grades', 'Yes / No', 'Textfield', 'Slider', 'Text Options', 'Happiness'],
        create_lecture: {
            create_lecture_component:{
                creating_a_lecture: 'Creating a lecture',
                first_things_first: 'First Things First!',
                your_unique_lecture_code_is: 'Your unique lecture code for loading and editing the lecture is:',
                warning: 'Warning:',
                do_not_show_this_code: 'Be careful not to display this code while your are using a projector or the likes, ' +
                    'as anyone can edit the lecture with it',
                show_access_code_button: 'Display Access Code',
                please_note_this_code_down: 'Please note this code down, as you will need it to access your lecture',
                the_unique_code_that_your_students_will_need: 'The unique code that your students can use to load the lecture is:',
                lecture_code: 'Lecture Code:',
                questions: 'Questions:',
                no_questions_so_far: 'No questions so far, Click on the button to add some!',
                add_question_button: 'Add question',
                you_can_change_the_order_of_questions: 'You can change the order of the questions by dragging and dropping them!',
                choose_your_own_title_toggletext: 'Choose own question title',
                question: 'Question',
                change_title: 'Change Title',
                change_question: 'Change Question',
                type: 'Type',
                edit_textOptions_button: 'Edit answer options',
                limit_answer_length: 'Determine how many characters an answer may consist of',
                delete_question_button: 'Delete',
                questions_checked: 'Questions Checked',
                move_to_chapter_button: 'Move to chapter',
                add_or_edit_chapters_button: 'Add or Edit Chapters',
                save_lecture_button: 'Save Lecture',
                input_may_not_contain_infodialogtext: 'The input may not contain new line symbols, ' + this.SEPARATOR + ' or ' + this.ANSWER_OPTIONS_SEPARATOR,
                choose_question_first_infodialogtext: 'Please choose a question Text first!',
                choose_question_type_first_infodialogtext: 'Please choose a question Type first!',
                choose_title_first_infodialogtext: 'Please choose a title for your question or set the toggle to name it automatically.',
                title_already_exists_infodialogtext: 'The title you chose already exists, please choose another one.',
                question_added_snackbartext: 'Question added! ✔',
                lecture_saved_snackbartext: 'Lecture saved! 😃',
                enter_new_title_first_infodialogtext: 'Please enter a new Title into the text-box first!',
                question_title_already_exists_infodialogtext: 'This Question title already exists, please choose another one!',
                enter_new_question_title_first_infodialogtext: 'Please enter a new question text into the text-box first!',
                limit_reached_text_1: 'Your question text exceeds the limit of',
                limit_reached_text_2: 'characters.',
                limit_reached_title_1: 'Your question title exceeds the limit of',
                limit_reached_title_2: 'characters.',
                please_choose_title_for_lecture_first: 'Please choose a title for your lecture first!',
                delete_lecture_button: 'Delete lecture',
                change_to_placeholder: 'Change to',
                lecture_title_placeholder: 'Lecture title',
                title_placeholder: 'Title',
                question_text_placeholder: 'Question Text',
                question_type_placeholder: 'Question Type',
                you_can_add_emojis: 'You can add emojis to any text! If you are using Windows, you can do so by pressing the Windows- and the \'.\'-Key! 😃',
                question_title: 'Question Title',
                question_text: 'Question Text',
                out_of: 'out of',
                drag_and_drop: 'Questions can be rearranged by drag&drop!'
            },
            before_chapter_deletion_dialog: {
                warning: 'Warning',
                deleting_chapter_will_also_delete_questions:'Deleting a chapter will also delete any questions in there. Are you sure you want to go ahead?',
                cancel_button: 'Cancel',
                ok_button: 'Delete'
            },
            before_lecture_deletion_dialog: {
                warning: 'Warning',
                do_you_really_want_to_delete_lecture:'Deleting the lecture cannot be undone. Are you sure you want to go ahead?',
                cancel_button: 'Cancel',
                ok_button: 'Delete',
            },
            edit_chapters_dialog: {
                add: 'Add',
                save: 'Save',
                input_may_not_contain_infodialogtext: 'The input may not contain new line symbols, ' + this.SEPARATOR + ' or ' + this.ANSWER_OPTIONS_SEPARATOR,
                add_or_edit_chapters: 'Add or edit chapters',
                rearrange_them_via_drag_and_drop: 'Rearrange them via drag & drop',
                chapter: 'Chapter',
                edit_button: 'Edit',
                delete_button: 'Delete',
                ok_button: 'Ok',
                chapter_name_already_exists: 'The chapter title you have chosen already exists. Please choose another one.',
                limit_reached_chapter_name_1: 'The chapter title exceeds the maximum length of',
                limit_reached_chapter_name_2: 'characters',
                chapter_name_placeholder: 'Chapter name',
                out_of: 'out of',
                write_something_first: 'You have not yet given a name for the chapter'
            },
            move_to_chapter_dialog: {
                chapter_select: 'Chapter Select',
                selected_questions: 'Selected Questions',
                choose_chapter_to_which_to_move: 'Choose a chapter to which to move the selected Questions',
                move_here_button: 'move here',
                ok_button: 'Ok',
                chapter: 'Chapter'
            },
            text_options_dialog: {
                add: 'Add',
                save: 'Save',
                enter_something_first: 'Please enter an answer option first',
                limit_reached_textOption_1: 'Your answer option exceeds the maximum length of',
                limit_reached_textOption_2: 'characters.',
                input_may_not_contain_infodialogtext: 'The input may not contain new line symbols, ' + this.SEPARATOR + ' or ' + this.ANSWER_OPTIONS_SEPARATOR,
                option_already_exists_infodialogtext: 'This option already exists',
                at_least_two_entries: 'Please create at least two entries',
                edit_or_add_options: 'Edit or Add options',
                edit: 'Edit',
                delete: 'Delete',
                allow_selection_of_multiple_choices: 'Allow selection of multiple choices',
                ok: 'Ok',
                out_of: 'out of'
            },
            show_access_code_dialog: {
                your_access_code_is: 'Your access code is:',
                note_down: 'Please note this code down as you will need it to edit and start your lecture!'
            },
            question_deleted_snackbar: {},
            question_titles_not_valid_dialog: {
                next: 'Next',
                enter_something_first: 'Please enter something first.',
                limit_reached_question_title_1: 'Your question title exceeds the limit of',
                limit_reached_question_title_2: 'characters',
                input_may_not_contain_infodialogtext: 'The input may not contain new line symbols, ' + this.SEPARATOR + ' or ' + this.ANSWER_OPTIONS_SEPARATOR,
                save: 'Save',
                out_of: 'out of',
                ok: 'Ok',
                cancel: 'Cancel',
                double_question_titles: 'Double Question Titles',
                question_titles_already_contained_in_target_chapter: 'There are questions with titles already contained in the target chapter',
                already_contained: 'The Title you chose already exists in the target lecture or within the questions you are trying to move.',
                edit: 'Edit',
                generate_auto_title: 'Generate title automatically',
                question: 'Question'
            },
            before_end_lecture_dialog: {
                warning: 'Warning',
                do_you_really_want_to_end_lecture: 'All answers will be deleted. Do you really want to end this lecture?',
                cancel_button: 'Cancel',
                end_lecture_button: 'End lecture',
            }
        },
        global_dialogs_and_snackbars_component:{
            info_snackbar:{

            },
            simple_info_dialog:{
                oops: 'Oops...',
                info: 'Info:',
                ok: 'Ok'
            },
            cookie_consent_dialog: {
                cookies: 'Cookies',
                this_website_uses_cookies_english: 'This website uses a cookie to save a randomly assigned ID for each user.',
                this_website_uses_cookies_german: 'Diese Webseite benutzt Cookies um eine zufällig zugewiese ID für Benutzer zu speichern',
                consent_button: 'Continue / Fortfahren',
                no_consent_button: 'Leave / Verlassen'
            }
        },
        lecture_student:{
            lecture_student_component:{
                welcome_to_the_lecture: 'Welcome to the lecture',
                how_much_do_you_understand: 'How much do you understand whats being taught right now?',
                chapters_explanation: 'Note that the questions are sorted into chapters that you can switch through by clicking the tabs.',
                how_to_submit_answers: 'Submit your answered questions by pressing the submit button on the bottom of the page!',
                school_grade_system: '(school grade system: 1 is the BEST, 5 the WORST)',
                out_of: 'out of',
                yes: 'Yes',
                no: 'No',
                questions_answered: 'Question answered',
                submit_answered_questions_button: 'Submit Answered Questions',
                multiple_choice_question: 'Multiple Answers Possible',
                single_choice_question: 'Single Choice Question',
                understanding_not_yet_submitted: 'Move the slider to submit your understanding',
                no_asked_questions_yet: 'There are no active questions so far',
                no_need_to_reload: 'You do not need to reload this page, as the data is refreshed automatically',
                at_least_one_ticked: 'The answer must consist of at least one ticked box ✅',
                your_answer_placeholder: 'Your answer',
                others_can_join_this_lecture_too_with_code: 'Others may use the same code to join this lecture',
                sent: 'Sent! ✔',
                understanding_reset: 'Understanding reset.',
                lecture_was_ended_by_lecture: 'The lecture was ended by the lecturer',
                answer_is_too_long: 'The answer is too long and cannot be submitted like that!',
                there_exists_an_answer_that_is_too_long: 'One of the answers you try to submit exceeds the textlength limit. Question: '
            },
            rate_understanding_dialog:{
                please_rate_understanding: 'Please rate your current understanding of the lecture',
                how_much_do_you_understand: 'How much do you understand whats being taught right now?',
                cancel_button: 'Cancel',
                submit_button: 'Submit Answer',
                answer_submitted_snackbartext: 'Your answer was submitted! ✔'
            },
            submit_answers_dialog:{
                submitting: 'Submitting',
                by_pressing_ok: 'By pressing Ok, all answered questions will be submitted. You can still answer any other questions though!',
                cancel_button: 'Cancel',
                submit_button: 'Submit',
                answer_submitted_snackbartext: 'Your answers was submitted! ✔'
            }
        },
        lecture_teacher:{
            lecture_teacher_component:{
                welcome_to_your_lecture: 'Welcome to your Lecture',
                your_students_current_understanding: 'Your students current understanding',
                answered_so_far_plural: 'people have answered so far.',
                explanation: 'You can ask all questions in a chapter at once by pressing the designated button just under the chapter tab or tick' +
                    ' some questions (even from multiple chapters) and ask them by pressing the button, that will appear bottom of the page, once you have ticked a' +
                    ' question.',
                ask_understanding_button: 'Ask',
                prompts_students_to_rate_their_understanding: 'Prompts students to rate their current understanding',
                open_settings: 'Settings',
                reset_current_understanding_graph: 'Reset Graph',
                open_all_available_button: 'Open all available',
                close_all_button: 'Close all',
                absolute_percent_toggle: 'Toggle Absolute/Percentage',
                ask_all_questions_in_current_chapter: 'Ask all questions in this chapter',
                displaying_percentage: 'Displaying percentage values',
                displaying_absolute: 'Displaying absolute values',
                no_answer_yet: 'No answer available yet',
                questions_checked: 'Questions Checked',
                click_the_reset_button: 'Click the \'End lecture\'-button to reset all the answers that were already given (e.g. to start the lecture with a new group)',
                end_lecture_button: 'End lecture',
                students_in_lecture_1_plural: 'There are currently',
                students_in_lecture_1_singular: 'There is currently',
                students_in_lecture_2_singular: 'person in your lecture',
                students_in_lecture_2_pluarl: 'students in your lecture',
                all_questions_in_current_chapter_asked: 'Questions away ⛵',
                no_need_to_reload: 'You do not need to reload this page, all the data is refreshed automatically!',
                asked_understanding: 'Sent 📨',
                ask_questions_button: 'Ask questions!',
                type: 'Type',
                lecture_timed_out: 'The lecture has timed out or was ended in another instance',
                answered_so_far_singular: 'person has answered so far',
                no_understanding_answers_yet: 'No one has submitted their understanding yet.'
            },
            lecture_settings_dialog:{
                lecture_settings: 'Lecture Settings',
                save: 'Save',
                continuous_rating_button: 'Continuous_Rating',
                continuous_rating_button_tooltip: 'When active, students can rate their understanding anytime and you will be able to reset the graph with a button',
                trigger_strong_negative_toggle:'Set percentage at which background color of the "current understanding"-graph changes to orange',
                trigger_strong_negative_toggle_tooltip: 'If more than 5 students have answered and more than this set percentage of the answers is a -3 or -2, the background color of the graph will turn orange',
                trigger_light_negative_toggle: 'Set percentage at which background color of the "current understanding"-graph changes to yellow',
                trigger_light_negative_toggle_tooltip: 'If more than 5 students have answered and more than this set percentage of the answers is a -3 or -2, the background color of the graph will turn yellow',
                enable_trigger_button:'Enable color changing feature',
                enable_trigger_tooltip: 'If enabled the "current understanding"-graph will change colors according to how well students understand the lecture'
            }
        },
        welcome_screen:{
            welcome_screen_component:{
                welcome_to_LARS: 'Welcome to LARS, the open-source Lecture Audience Response System!',
                you_can_join_by: 'You can join a lecture by entering a lecture code',
                or_by: '.. or by scanning a QR-Code!',
                join_button: 'Join',
                scan_now_button: 'Scan now',
                or: 'OR',
                create_edit_or_start: 'Create, Edit or Start your own lecture!',
                create_lecture_button: 'Create',
                edit_lecture_button: 'Edit',
                start_button: 'Start',
                no_lectureCode_entered: 'You have not yet entered a Lecture code. The Code you are looking for starts with \'L-\' followed by 7 letters or numbers',
                did_not_start_with_l: 'The code you entered did not start with \'L-\' and is therefore not a lecture code.',
                lecture_code_should_consist_of: 'The lecture code should consist of \'L-\' and exactly 7 letters or numbers',
                lecture_code_not_found_or_not_active: 'The lecture you are trying to open does not exist or is currently not active.',
                timelimit_info: 'Your lecture remains active for 4 hours from the moment you have last started it. Any ' +
                    'answers given by students will remain in the database for 5 hours after their submission. If you want to reset the lecture before ' +
                    'that, (e.g. for holding it again with a different group) you can click on the \'end Lecture\' button on the bottom of the page!' +
                    '\n\nThe app is meant to be used anonymously. Please do not ask any questions that can be used to identify a person.',
                no_access_code_entered: 'You have not yet entered a access code. The Code you are looking for starts with \'A-\' followed by 7 letters or numbers',
                did_not_start_with_a: 'The code you entered did not start with \'A-\' and is therefore not a access code.',
                access_code_should_consist_of: 'The access code should consist of \'A-\' and exactly 7 letters or numbers',
                lecture_does_not_exist: 'The lecture you are trying to open does not exist.',
                no_identifiers: 'The app is meant to be used anonymously. Please do not provide any information to identify yourself.'
            },
            qr_code_scanner_dialog:{
                qr_code: 'QR-Code',
                scan_qr_code: 'Scan a Qr code from somebody who has started or already joined a lecture'
            },
            stop_lecture_dialog: {
                warning: 'Warning',
                lecture_is_running: 'The lecture you are trying to edit is still running. If you click \'go ahead\' the' +
                    ' lecture will be ended and the collected answers discarded.',
                go_ahead_button: 'Go ahead',
                cancel_button: 'Cancel'
            }
        },
        top_bar:{
            top_bar_component:{
                show_qr_code_button: 'Show QR-Code'
            },
            show_qr_code_dialog:{
                qr_code_title: 'The QR Code for the current lecture',
                no_qr_code_explanation: 'If you join or start a lecture, you can come here again and display a qr-code that others can use to join.',
                ok_button: 'Ok',
                the_lecture_code_is: 'The lecture code is: '
            }
        },
        change_language_component:{
            change_language_dialog:{
                change_language_english: 'Wählen Sie Ihre Sprache aus',
                change_language_german: 'Choose your language',
                set: 'Set / Auswählen',
                cancel_button: 'Cancel / Abbrechen',
                loading_language_english: 'Welcome to LARS!',
                loading_language_german: 'Wilkommen zu LARS!',
                english: 'English',
                german: 'Deutsch'
            },
        }

    };

    private german = {
        question_types: ['Noten', 'Ja / Nein', 'Textfeld', 'Slider', 'Text Optionen', 'Emojis'],
        create_lecture: {
            create_lecture_component:{
                creating_a_lecture: 'Erstelle eine Vorlesung',
                first_things_first: 'Geben Sie einen Titel ein',
                your_unique_lecture_code_is: 'Der Code den Sie für das Laden und Bearbeiten der Vorlesung brauchen lautet:',
                warning: 'Achtung:',
                do_not_show_this_code: 'Geben Sie besonders darauf Acht, den Code nicht aufzurufen während Sie einen Beamer oder Ähnliches ' +
                    'verwenden, da mit ihm die Vorlesung bearbeitet werden kann.',
                show_access_code_button: 'Zugriffscode anzeigen',
                please_note_this_code_down: 'Bitte notieren Sie sich diesen Code, da er zum Laden und Bearbeiten der Vorlesung benötigt wird',
                the_unique_code_that_your_students_will_need: 'Der Code, mit dem Studenten Ihrer Vorlesung beitreten können, lautet:',
                lecture_code: 'Vorlesungs Code:',
                questions: 'Fragen:',
                no_questions_so_far: 'Noch keine Fragen vorhanden. Klicken Sie auf den Button um welche hinzuzufügen!',
                add_question_button: 'Frage hinzufügen',
                you_can_change_the_order_of_questions: 'Sie können die Reihenfolge der Fragen per Drag&Drop verändern',
                choose_your_own_title_toggletext: 'Eigenen Fragetitel bestimmen',
                question: 'Frage',
                change_title: 'Titel ändern',
                change_question: 'Frage ändern',
                type: 'Typ',
                edit_textOptions_button: 'Antwortmöglichkeiten bearbeiten',
                limit_answer_length: 'Maximale Länge der Antworten festlegen',
                delete_question_button: 'Löschen',
                questions_checked: 'Fragen angehakt',
                move_to_chapter_button: 'In anderes Kapitel verschieben',
                add_or_edit_chapters_button: 'Kapitel hinzufügen oder bearbeiten',
                save_lecture_button: 'Vorlesung speichern',
                input_may_not_contain_infodialogtext: 'Es dürfen sich keine Zeilenumbrüche, ' + this.SEPARATOR + ' oder ' + this.ANSWER_OPTIONS_SEPARATOR + ' im Text befinden.',
                choose_question_first_infodialogtext: 'Bitte geben Sie erst einen Fragetext ein!',
                choose_question_type_first_infodialogtext: 'Bitte geben Sie erst einen Fragetyp ein!',
                choose_title_first_infodialogtext: 'Bitte geben Sie erst einen Fragetitel ein oder setzen Sie den Toggle um einen Titel automatisch generieren zu lassen',
                title_already_exists_infodialogtext: 'Dieser Fragetitel existiert bereits, bitte wählen Sie einen anderen.',
                question_added_snackbartext: 'Frage hinzugefügt! ✔',
                lecture_saved_snackbartext: 'Vorlesung gespeichert! 😃',
                enter_new_title_first_infodialogtext: 'Bitte geben Sie einen neuen Titel in die Textbox ein!',
                question_title_already_exists_infodialogtext: 'Dieser Fragetitel existiert bereits, bitte wähle einen anderen.',
                enter_new_question_title_first_infodialogtext: 'Bitte geben Sie einen neuen Fragetext in die Textbox ein!',
                limit_reached_text_1: 'Ihre Frage überschreitet die maximale Länge von',
                limit_reached_text_2: 'Zeichen.',
                limit_reached_title_1: 'Ihr Frage Titel überschreitet die maximale Länge von',
                limit_reached_title_2: 'Zeichen.',
                please_choose_title_for_lecture_first: 'Bitte wählen Sie zuerst einen Titel für Ihre Vorlesung!',
                delete_lecture_button: 'Vorlesung löschen',
                change_to_placeholder: 'Ändern zu',
                lecture_title_placeholder: 'Vorlesungstitel',
                title_placeholder: 'Titel',
                question_text_placeholder: 'Fragetext',
                question_type_placeholder: 'Frageart',
                you_can_add_emojis: 'Sie können zu jedem Text auch Emojis hinzufügen! Wenn sie Windows verwenden klicken Sie dazu die Windows- und \'.\'-Taste! 😃',
                question_title: 'Frage Titel',
                question_text: 'Frage Text',
                out_of: 'von',
                drag_and_drop: 'Fragen können mithilfe von Drag&Drop umsortiert werden!'
            },
            before_chapter_deletion_dialog: {
                warning: 'Achtung',
                deleting_chapter_will_also_delete_questions: 'Wird das Kapitel gelöscht, so werden auch alle sich darin befindlichen Fragen gelöscht. Sind Sie sicher dass Sie das Kapitel löschen wollen?',
                cancel_button: 'Abbruch',
                ok_button: 'Löschen'
            },
            before_lecture_deletion_dialog: {
                warning: 'Achtung',
                do_you_really_want_to_delete_lecture:'Das Löschen einer Vorlesung kann nicht mehr rückgängig gemacht werden. Sind Sie sicher dass sie fortfahren möchten?',
                cancel_button: 'Abbruch',
                ok_button: 'Löschen',
            },
            edit_chapters_dialog: {
                add: 'Hinzufügen',
                save: 'Speichern',
                input_may_not_contain_infodialogtext: 'Es dürfen sich keine Zeilenumbrüche, ' + this.SEPARATOR + ' oder ' + this.ANSWER_OPTIONS_SEPARATOR + ' im Text befinden.',
                add_or_edit_chapters: 'Kapitel hinzufügen oder bearbeiten',
                rearrange_them_via_drag_and_drop: 'Verändern Sie die Reihenfolge via Drag&Drop!',
                chapter: 'Kapitel',
                edit_button: 'Bearbeiten',
                delete_button: 'Löschen',
                ok_button: 'Ok',
                chapter_name_already_exists: 'Der Name den Sie für das Kapitel gewählt haben existiert bereits. Bitte wählen Sie einen anderen.',
                limit_reached_chapter_name_1: 'Der Titel des Kapitels überschreitet die maximale Länge von',
                limit_reached_chapter_name_2: 'Zeichen.',
                chapter_name_placeholder: 'Kapitel-name',
                out_of: 'von',
                write_something_first: 'Sie haben noch keinen Namen für dieses Kapitel festgelegt.'

            },
            move_to_chapter_dialog: {
                chapter_select: 'Kapitelauswahl',
                selected_questions: 'Ausgewählte Fragen',
                choose_chapter_to_which_to_move: 'Wählen Sie ein Kapitel in das Sie die ausgewählten Fragen verschieben wollen',
                move_here_button: 'Hierhin verschieben',
                ok_button: 'Ok',
                chapter: 'Kapitel'
            },
            text_options_dialog: {
                add: 'Hinzufügen',
                save: 'Speichern',
                enter_something_first: 'Bitte geben Sie zuerst eine Antwortmöglichkeit ein',
                limit_reached_textOption_1: 'Ihre Antwortmöglichkeit überschreitet die maximale Länge von',
                limit_reached_textOption_2: 'Zeichen.',
                input_may_not_contain_infodialogtext: 'Es dürfen sich keine Zeilenumbrüche, ' + this.SEPARATOR + ' oder ' + this.ANSWER_OPTIONS_SEPARATOR + ' im Text befinden.',
                option_already_exists_infodialogtext: 'Diese Option existiert bereits',
                at_least_two_entries: 'Bitte erstellen Sie zwei oder mehr Einträge',
                edit_or_add_options: 'Antwortmöglichkeiten bearbeiten oder hinzufügen',
                edit: 'Bearbeiten',
                delete: 'Löschen',
                allow_selection_of_multiple_choices: 'Ankreuzen mehrerer Antwortmöglichkeiten zulassen',
                ok: 'Ok',
                out_of: 'von'
            },
            show_access_code_dialog: {
                your_access_code_is: 'Ihr Zugriffscode lautet:',
                note_down: 'Bitte notieren Sie sich diesen Code, da er zum Bearbeiten und Starten der Vorlesung benötigt wird'
            },
            question_deleted_snackbar: {},
            question_titles_not_valid_dialog: {
                next: 'Nächste Frage',
                enter_something_first: 'Bitte geben Sie zuerst einen neuen Titel ein',
                limit_reached_question_title_1: 'Ihr Frage Titel überschreitet die maximale Länge von',
                limit_reached_question_title_2: 'Zeichen',
                input_may_not_contain_infodialogtext: 'Es dürfen sich keine Zeilenumbrüche, ' + this.SEPARATOR + ' oder ' + this.ANSWER_OPTIONS_SEPARATOR + ' im Text befinden.',
                save: 'Speichern',
                out_of: 'von',
                ok: 'Ok',
                cancel: 'Abbruch',
                double_question_titles: 'Bereits vorhandene Frage Titel',
                question_titles_already_contained_in_target_chapter: 'Es gibt Fragen, dessen Titel bereits im gewählten Kapitel vorhanden sind.',
                already_contained: 'Der Titel, den Sie gewählt haben existiert bereits im Ziel-Kapitel oder unter den Fragen welche Sie zu verschieben versuchen.',
                edit: 'Bearbeiten',
                generate_auto_title: 'Titel automatisch generieren',
                question: 'Frage'
            },
            before_end_lecture_dialog: {
                warning: 'Warning',
                do_you_really_want_to_end_lecture: 'All answers will be deleted. Do you really want to end this lecture?',
                cancel_button: 'Cancel',
                end_lecture_button: 'End lecture'
            }
        },
        global_dialogs_and_snackbars_component:{
            info_snackbar:{

            },
            simple_info_dialog:{
                oops: 'Ups...',
                info: 'Info:',
                ok: 'Ok'
            },
            cookie_consent_dialog: {
                cookies: 'Cookies',
                this_website_uses_cookies_english: 'This website uses a cookie to save a randomly assigned ID for each user.',
                this_website_uses_cookies_german: 'Diese Webseite benutzt Cookies um eine zufällig zugewiese ID für Benutzer zu speichern',
                consent_button: 'Continue / Fortfahren',
                no_consent_button: 'Leave / Verlassen'
            }
        },
        lecture_student:{
            lecture_student_component:{
                welcome_to_the_lecture: 'Willkommen zur Vorlesung',
                how_much_do_you_understand: 'Wie gut verstehen Sie den Stoff gerade?',
                chapters_explanation: 'Die Fragen sind in Kapitel angeordnet, welche durch Klicken auf die Tabs durchgeschaltet werden können.',
                how_to_submit_answers: 'Schicken Sie Ihre Antworten ab, indem Sie auf den entsprechenden Knopf am Ende der Seite klicken!',
                school_grade_system: '(Schulnotensystem: 1 ist am besten, 5 am schlechtesten)',
                out_of: 'von',
                yes: 'Ja',
                no: 'Nein',
                questions_answered: 'Fragen beantwortet',
                submit_answered_questions_button: 'Beantwortete Fragen abschicken',
                multiple_choice_question: 'Multiple-Choice Frage',
                single_choice_question: 'Single-Choice Frage',
                understanding_not_yet_submitted: 'Bewegen Sie den Slider um Ihre Antwort zu übertragen',
                no_asked_questions_yet: 'Zurzeit gibt es noch keine aktiven Fragen',
                no_need_to_reload: 'Es ist nicht nötig dies Seite zu aktualiesieren, da sie sich von alleine aktuell hält.',
                at_least_one_ticked: 'Die Antwort muss aus zumindest einem angehakten Element bestehen ✅',
                your_answer_placeholder: 'Ihre Antwort',
                others_can_join_this_lecture_too_with_code: 'Andere können dieser Vorlesung mit dem selben Code beitreten',
                sent: "Gesendet! ✔",
                understanding_reset: 'Verständnis zurückgesetzt.',
                lecture_was_ended_by_lecture: 'Vorlesung wurde vom Vortragenden beendet.',
                answer_is_too_long: 'Die Antwort ist zu lange und kann nicht abgeschickt werden!',
                there_exists_an_answer_that_is_too_long: 'Eine Ihrer Antworten überschreitet das Längenlimit. Frage: '
            },
            rate_understanding_dialog:{
                please_rate_understanding: 'Bitte bewerte dein derzeitiges Verständnis der Vorlesung',
                how_much_do_you_understand: 'Wie gut versteht du den Stoff gerade?',
                cancel_button: 'Abbruch',
                submit_button: 'Antwort abschicken',
                answer_submitted_snackbartext: 'Deine Antwort wurde gesendet! ✔'
            },
            submit_answers_dialog:{
                submitting: 'Abschicken',
                by_pressing_ok: 'Wenn Sie Ok klicken werden alle Fragen welche Sie beantwortet haben abgeschickt, Sie können die restlichen aber immer noch später beantworten!',
                cancel_button: 'Abbruch',
                submit_button: 'Weiter',
                answer_submitted_snackbartext: 'Ihre Antworten wurden abgeschickt! ✔'
            }
        },
        lecture_teacher:{
            lecture_teacher_component:{
                welcome_to_your_lecture: 'Willkommen zu Ihrer Vorlesung',
                your_students_current_understanding: 'Derzeitiges Verständnis Ihrer Studenten',
                answered_so_far_plural: 'Antworten sind bisher eingelangt.',
                explanation: 'Sie können alle Fragen eines Kapitels auf einmal stellen indem Sie den entsprechenden Knopf unter der Kapitelauswahl drücken. Alternativ' +
                    ' dazu können Sie einzelne Fragen (auch von mehreren Kapiteln) ankreuzen und Sie durch Drücken des Knopfes, welcher am Ende der Seite erscheint, stellen.',
                ask_understanding_button: 'Fragen',
                prompts_students_to_rate_their_understanding: 'Fordert Studenten dazu auf ihr derzeitiges Verständnis zu bewerten',
                open_settings: 'Einstellungen',
                reset_current_understanding_graph: 'Statistik zurücksetzen',
                open_all_available_button: 'Alle verfügbaren Antworten öffnen',
                close_all_button: 'Alle schließen',
                absolute_percent_toggle: 'Absolut/Prozent umschalten',
                ask_all_questions_in_current_chapter: 'Alle Fragen dieses Kapitels stellen',
                displaying_percentage: 'Zeige Prozentwerte an',
                displaying_absolute: 'Zeige absolute Werte an',
                no_answer_yet: 'Zurzeit noch keine Antworten verfügbar',
                questions_checked: 'Fragen angehakt',
                click_the_reset_button: 'Klicken Sie den \'Vorlesung beenden\' - Button um bereits eingelangte Fragen zu löschen (z.B. um die Vorlesung mit einer neuen Gruppe neu zu starten)',
                end_lecture_button: 'Vorlesung beenden',
                students_in_lecture_1_plural: 'Es befinden sich zurzeit',
                students_in_lecture_1_singular: 'Es befindet sich zurzeit',
                students_in_lecture_2_singular: 'Student in Ihrer Vorlesung',
                students_in_lecture_2_pluarl: 'Studenten in Ihrer Vorlesung',
                all_questions_in_current_chapter_asked: 'Fragen abgeschickt ⛵',
                no_need_to_reload: 'Sie müssen diese Seite nicht aktualisieren, die Daten aktualisieren sich automatisch!',
                asked_understanding: 'Gesendet 📨',
                ask_questions_button: 'Fragen stellen!',
                type: 'Art:',
                lecture_timed_out: 'Die Vorlesungsdauer wurde überschritten oder sie wurde in einer anderen Instanz beendet',
                answered_so_far_singular: 'Antwort ist bisher eingelangt.',
                no_understanding_answers_yet: 'Es hat noch niemand sein Verständnis bekanntgegeben.'
            },
            lecture_settings_dialog:{
                lecture_settings: 'Vorlesungseinstellungen',
                save: 'Speichern',
                continuous_rating_button: 'Laufende Bewertung',
                continuous_rating_button_tooltip: 'Ist diese Option aktiv, können Studenten ihr Verständnis zu jeder Zeit mitteilen und Sie können den Graphen mittels eines Buttons bei Bedarf zurücksetzen',
                trigger_strong_negative_toggle: 'Setzen sie den Prozentsatz bei welchem sich der Hintergrund des Vertändnis-Graphen orange färbt',
                trigger_strong_negative_toggle_tooltip: 'Sind mehr als 5 Antworten eingegangen und mehr Prozent als hier gesetzt eine -3, so wird der Hintergrund des Graphen auf Orange gesetzt.',
                trigger_light_negative_toggle: 'Setzen Sie den Prozentsatz bei welchem sich der Hintergrund des Vertändnis-Graphen gelb färbt',
                trigger_light_negative_toggle_tooltip: 'Sind mehr als 5 Antworten eingegangen und mehr Prozent als hier gesetzt eine -3, so wird der Hintergrund des Graphen auf Gelb gesetzt.',
                enable_trigger_button:'Farbwechsel Feature aktivieren',
                enable_trigger_tooltip: 'Ist diese Funktion aktiv, so wechselt der Graf die Farbe gemäß dem Verständnis ihrer Studenten'
            }
        },
        welcome_screen:{
            welcome_screen_component:{
                welcome_to_LARS: 'Willkommen zu LARS, das Open-Source Lecture Audience Response System!',
                you_can_join_by: 'Du kannst einer Vorlesung mit Hilfe eines Vorlesungscodes beitreten',
                or_by: '.. oder indem du einen QR-Code scannst!',
                join_button: 'Beitreten',
                scan_now_button: 'Code einscannen',
                or: 'ODER',
                create_edit_or_start: 'Erstelle, Bearbeite oder Starte deine eigene Vorlesung!',
                create_lecture_button: 'Erstellen',
                edit_lecture_button: 'Bearbeiten',
                start_button: 'Starten',
                no_lectureCode_entered: 'Sie haben noch keinen Vorlesungscode eingegeben. Ein Vorlesungscode started mit \'L-\' gefolgt von 7 Buchstaben oder Zahlen.',
                did_not_start_with_l: 'Der Vorlesungscode welchen Sie eingegeben haben beginnt nicht mit \'L-\' und ist somit kein gültiger Vorlesungscode',
                lecture_code_should_consist_of: 'Der Vorlesungscode muss aus \'L-\' gefolgt von 7 Buchstaben oder Zahlen bestehen',
                lecture_code_not_found_or_not_active: 'Die Vorlesung, welche Sie zu öffnen versuchen existiert nicht oder ist gerade nicht aktiv.',
                timelimit_info: 'Ihre Vorlesung ist für die Dauer von 4 Stunden nach dem letzten Start aktiv.' +
                    ' Antworten von Studenten bleiben für 5 Stunden nach ihrer Beantwortung erhalten. Falls Sie Ihre Vorlesung ' +
                    'schon früher zurücksetzen wollen (um sie z.B. mit einer neuen Gruppe abzuhalten) können Sie dies tun indem Sie den ' +
                    '\'Vorlesung beenden\' Button am Ende der Seite klicken! \n\n Der App ist dazu gedacht anonym benutzt zu werden. Stellen Sie daher bitte keine ' +
                    'Fragen die zur Identifikation der Person genutzt werden können.',
                no_access_code_entered: 'Sie haben noch keinen Zugriffscode eingegeben. Der Zugriffscode beginnt mit \'A-\', gefolgt von 7 Buchstaben oder Zahlen',
                did_not_start_with_a: 'Der Code welchen Sie eingegeben haben beginnt nicht mit \'A-\' und ist somit kein gültiger Zugriffscode.',
                access_code_should_consist_of: 'Der Zugriffscode muss mit \'A-\' beginnen gefolgt von 7 Buchstaben oder Zahlen',
                lecture_does_not_exist: 'Die Vorlesung welche Sie zu öffnen versuchen existiert nicht.',
                no_identifiers: 'Der App ist dazu gedacht anonym genutzt zu werden. Bitte geben Sie keine Infos an, die zur Identifikation dienen.'
            },
            qr_code_scanner_dialog:{
                qr_code: 'QR-Code',
                scan_qr_code: 'Scanne einen QR-Code von jemanden der eine Vorlesung gestartet hat oder bereits einer beigetreten ist.'
            },
            stop_lecture_dialog: {
                warning: 'Achtung',
                lecture_is_running: 'Die Vorlesung die Sie bearbeiten möchten wurde noch nicht beendet. Falls Sie auf \'fortfahren\' klicken' +
                    ' wird die Vorlesung beended und die gesammelten Antworten werden verwofen.',
                go_ahead_button: 'Fortfahren',
                cancel_button: 'Abbruch'
            }
        },
        top_bar:{
            top_bar_component:{
                show_qr_code_button: 'QR-Code anzeigen'
            },
            show_qr_code_dialog:{
                qr_code_title: 'Der QR-Code für die aktuelle Vorlesung',
                no_qr_code_explanation: 'Wenn Sie eine Vorlesung starten oder einer beitreten können Sie in diesem Menü einen QR-Code aufrufen mit dem andere der Vorlesung beitreten können.',
                ok_button: 'Ok',
                the_lecture_code_is: 'Der Vorlesungscode lautet: '
            }
        },
        change_language_component:{
            change_language_dialog:{
                change_language_english: 'Wählen Sie Ihre Sprache aus',
                change_language_german: 'Choose your language',
                set: 'Set / Auswählen',
                cancel_button: 'Cancel / Abbrechen',
                loading_language_english: 'Welcome to LARS!',
                loading_language_german: 'Wilkommen zu LARS!',
                english: 'English',
                german: 'Deutsch'
            },
        }

    };


    constructor() {
    }

    get text() {
        return window.location.href.split('/')[window.location.href.split('/').length - 1].localeCompare('english') === 0 ? this.english : this.german;
    }

    getLanguagefromUrl(): string {
        var arr = window.location.href.split('/');
        return arr[arr.length - 1];
    }

    getLanguageAsString(): string {
        return window.location.href.split('/')[window.location.href.split('/').length - 1];
    }
}
