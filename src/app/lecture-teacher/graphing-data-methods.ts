import {Question} from "../datastructures/question";
import {QuestionTypes} from "../datastructures/question-type.enums";
import {Chapter} from "../datastructures/chapter";
import {LectureService} from "../lecture.service";
import {Lecture} from "../datastructures/lecture";

export class ChapterGraphDataMap {

    private _chapterData = Array<QuestionGraphDataMap>();
    private _percentageView;

    constructor(private lecture: Lecture, private _chapters: Array<Chapter>, private lectureService: LectureService) {
        for (let chapter of _chapters) {
            this._chapterData.push(new QuestionGraphDataMap(this.lecture, chapter, this.lectureService));
        }
    }

    get chapterData(): QuestionGraphDataMap[] {
        return this._chapterData;
    }

    get percentageView() {
        return this._percentageView;
    }

    set percentageView(value) {
        this._percentageView = value;
        this._chapterData.forEach(chapter => chapter.pairs.forEach(pair => {
            pair.graphData.percentageView = value;
        }));
    }

    set expandAll(value: boolean) {
        this.chapterData.forEach((chapter) => {
            chapter.pairs.forEach((question) => {
                if (value) {
                    question.setExpand(question.question.wasAsked, false);
                } else {
                    question.setExpand(false, false);
                }
            })
        })
    }

    /*
    Helper method that returns an array with keys for each chapter, since static Array methods are not callable from html
     */
    getKeyArray() {
        if (this._chapterData === undefined) return [];
        return Array.from(Array(this._chapterData.length).keys());
    }
}

class GraphData {

    percentageView;
    private recalculatePercentage = true;
    private result = [];

    private lastPositionPercent = 0;

    textOptions = this.question.textOptions;

    private _refreshAnswerCount = true;
    lastSumFromServer = this.sum;


    constructor(
        private _label: string[],
        private stdLabel: string[],
        private _type: string,
        private _data: any[],
        private _createChart: boolean,
        private _displayLabel,
        private _options,
        private _colors,
        private lecture: Lecture,
        private chapter: Chapter,
        private question: Question,
        private lectureService: LectureService
    ) {
    }

    refreshAnswerCount() {
        this._refreshAnswerCount = true;
    }

    calculatePercentView() {

        this.recalculatePercentage = false;

        for (let i = this.lastPositionPercent; i < this._data.length; i++) {
            let x = this._data[i] as number;
            let div = this.sum;
            if (div === 0) div = 1;

            let val = Math.round((x * 100 / div) * 100) / 100;
            this.result.push(val);
        }

        this.lastPositionPercent = this._data.length;

    }

    get sum(): number {
        if (this.question.questionType === QuestionTypes.TextOptions && this.question.multipleChoices) {
            if (this._refreshAnswerCount) {
                this.lectureService.getAnswerCountOf(this.lecture.lectureCode, this.chapter.id, this.question.id).then((sum) => {
                    this.lastSumFromServer = sum;
                    this._refreshAnswerCount = false;
                    return sum;
                });
            } else {
                return this.lastSumFromServer;
            }
        } else {
            let sum = 0;
            this._data.forEach(x => {
                sum += Number.parseInt(x)
            });
            return sum;
        }
    }

    get label(): string[] {
        return this._label;
    }

    get type(): string {
        return this._type;
    }

    get data() {
        if (this.question.questionType != QuestionTypes.TextField && this.percentageView) {
            this.calculatePercentView();
            this.recalculatePercentage = true;

            if (this.result != undefined) {
                //Custom labels for Radar chart to make them more readable
                if (this._type.localeCompare('radar') === 0) {
                    for (let i = 0; i < this._label.length; i++) this._label[i] = this.textOptions[i].text + ': ' + this.result[i] + '%';
                }

                return this.result;
            }
        } else {
            //Custom labels for Radar chart to make them more readable
            if (this._type.localeCompare('radar') === 0) {
                for (let i = 0; i < this._label.length; i++) {
                    this._label[i] = this.textOptions[i].text + ': ' + this._data[i];
                }
            }
        }
        return this._data;
    }

    set data(value) {
        this.recalculatePercentage = true;
        this._data = value;
    }

    get createChart(): boolean {
        return this._createChart;
    }

    get displayLabel() {
        return this._displayLabel;
    }

    get options(): [] {
        return this._options;
    }

    get colors() {
        return this._colors;
    }
}

class QuestionGraphDataPair {
    private automaticOpen = true;
    private _expand = false;

    constructor(private _question: Question, private _graphData: GraphData) {
    }

    get question(): Question {
        return this._question;
    }

    get graphData(): GraphData {
        return this._graphData;
    }

    get expand(): boolean {
        return this._expand;
    }

    setExpand(value: boolean, answerUpdate: boolean) {
        if (answerUpdate) { //only auto-open when receiving first data
            if (this.automaticOpen) this._expand = value;
            this.automaticOpen = false;
        } else {
            this._expand = value; //In case of button press
        }
    }
}

class QuestionGraphDataMap {
    get chapter(): Chapter {
        return this._chapter;
    }

    //Note: Textfield does not need a graph and textOptions-dialog has generated labels
    label = {
        GRADES: ['1', '2', '3', '4', '5'],
        YES_NO: ['Yes', 'No'],
        SLIDER: ['3', '2', '1', '0', '-1', '-2', '-3'],
        SCALE_OF_HAPPINESS: ['😃', '🙂', '😐', '🙁', '🤕']
    };

    type = {
        GRADES: 'pie',
        YES_NO: 'horizontalBar',
        TEXTFIELD: 'NONE',
        SLIDER: 'doughnut',
        TEXTOPTIONS_SC: 'pie',
        TEXTOPTIONS_MC_MORE_THAN_THREE: 'radar',
        TEXTOPTIONS_MC_LESS_THAN_THREE: 'horizontalBar',
        SCALE_OF_HAPPINESS: 'pie'
    };

    pairs = Array<QuestionGraphDataPair>();

    constructor(private lecture: Lecture, private _chapter: Chapter, private lectureService: LectureService) {
        let questions = _chapter.questions;

        for (let q of questions) {
            let label = [''];
            let type;
            let colors;
            let createChart = true;
            let displayLabel = true;
            let options = {};

            const BARCHARTOPTIONS = {
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            };

            const RADARCHARTOPTIONS = {
                scale: {
                    ticks: {
                        beginAtZero: true
                    }
                }
            };

            const sevenColors = [
                {
                    backgroundColor: [
                        'rgba(129,199,132 ,1)',
                        'rgba(174,213,129 ,1)',
                        'rgba(220,231,117 ,1)',
                        'rgba(255,241,118 ,1)',
                        'rgba(255,213,79 ,1)',
                        'rgba(255,183,77 ,1)',
                        'rgba(255,138,101 ,1)',
                    ]
                }
            ];

            const fiveColors = [
                {
                    backgroundColor: [
                        'rgba(129,199,132 ,1)',
                        'rgba(220,231,117 ,1)',
                        'rgba(255,241,118 ,1)',
                        'rgba(255,213,79 ,1)',
                        'rgba(255,138,101 ,1)',
                    ]
                }
            ];

            const twoColors = [
                {
                    backgroundColor: [
                        'rgba(129,199,132 ,1)',
                        'rgba(255,138,101 ,1)',
                    ]
                }
            ];

            switch (q.questionType) {
                case QuestionTypes.Grades:
                    label = this.label.GRADES;
                    type = this.type.GRADES;
                    colors = fiveColors;
                    break;
                case QuestionTypes.YesNo:
                    label = this.label.YES_NO;
                    type = this.type.YES_NO;
                    colors = twoColors;
                    break;

                case QuestionTypes.TextField:
                    type = this.type.TEXTFIELD;
                    break;

                case QuestionTypes.Slider:
                    label = this.label.SLIDER;
                    type = this.type.SLIDER;
                    colors = sevenColors;
                    break;

                case QuestionTypes.TextOptions:
                    label = [];

                    for (let option of q.textOptions) {
                        label.push(option.text);
                    }

                    if (q.multipleChoices) {
                        if (q.textOptions.length < 3) {
                            type = this.type.TEXTOPTIONS_MC_LESS_THAN_THREE;
                        } else {
                            type = this.type.TEXTOPTIONS_MC_MORE_THAN_THREE;
                        }
                        colors = [
                            {
                                backgroundColor: [
                                    'rgba(100,181,246 ,0.5)'
                                ]
                            }
                        ];
                    } else {
                        type = this.type.TEXTOPTIONS_SC;
                        if (q.textOptions.length <= 19) {
                            colors = [
                                {
                                    backgroundColor: this.getColorArray(q.textOptions.length)
                                }
                            ];
                        }
                    }

                    break;

                case QuestionTypes.ScaleOfHappiness:
                    label = this.label.SCALE_OF_HAPPINESS;
                    type = this.type.SCALE_OF_HAPPINESS;
                    colors = fiveColors;
                    break;

                default:
                    console.error('QuestionType not handled');

            }

            let data = [];

            if (!(q.questionType === QuestionTypes.TextField)) {
                if (q.questionType === QuestionTypes.TextOptions) {
                    for (let i = 0; i < label.length; i++) data.push(0);
                } else {
                    for (let i = 0; i < label.length; i++) data.push(0);
                }
            }

            if (type.localeCompare('bar') === 0 || type.localeCompare('horizontalBar') === 0) {
                options = BARCHARTOPTIONS;
                displayLabel = false;
            } else if (type.localeCompare('radar') === 0) {
                options = RADARCHARTOPTIONS;
                displayLabel = false;
            } else if (type.localeCompare('NONE') === 0) {
                createChart = false;
            }

            let stdLabel = [];

            if (q.questionType === QuestionTypes.TextOptions) {
                q.textOptions.forEach(x => stdLabel.push(x.text));
            } else {
                label.forEach(x => stdLabel.push(x));
            }

            this.pairs.push(
                new QuestionGraphDataPair
                (
                    q, new GraphData(label, stdLabel, type, data, createChart, displayLabel, options, colors, this.lecture, this.chapter, q, this.lectureService)
                )
            );
        }
    }

    //call only for number <= 19
    getColorArray(length: number) {
        const colors = [
            'rgba(121,134,203 ,1)',
            'rgba(79,195,247 ,1)',
            'rgba(77,182,172 ,1)',
            'rgba(174,213,129 ,1)',
            'rgba(255,241,118 ,1)',
            'rgba(255,183,77 ,1)',
            'rgba(161,136,127 ,1)',
            'rgba(144,164,174 ,1)',
            'rgba(240,98,146 ,1)',
            'rgba(149,117,205 ,1)',
            'rgba(100,181,246 ,1)',
            'rgba(77,208,225 ,1)',
            'rgba(129,199,132 ,1)',
            'rgba(220,231,117 ,1)',
            'rgba(255,213,79 ,1)',
            'rgba(255,138,101 ,1)',
            'rgba(224,224,224 ,1)',
            'rgba(229,115,115 ,1)',
            'rgba(186,104,200 ,1)'
        ];
        return colors.slice(0, length);
    }
}
