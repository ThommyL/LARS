# LARS

... is an application that acts as a "live radar" for lectures. As such it provides live feedback about the current understanding of students and also allows to predefine different types of questions for students to answer. The system is used anonymously and designed in a way that requires only little interaction from both students and lecturer in order to not draw too much attention from the lecture.\\
For the implementation the framework Angular was used, as well as express.js among other libraries. 


## Provided as is!

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Check out the Screenshots!

This Repo contains a pdf documentation of the Software with a lot of Screenshots at the end. Go take a look! :)

## Getting Started / Deployment

There are 2 ways one might set the server up, depending if the goal is to deploy the software or to do some coding.
Either way, the first thing to do is running ``npm install`` for installing the dependencies. If no "LarsDatabase.db"-file already exists, a (in the package.json file) predefined command called ``create-database`` needs to be run, which executes ``sqlite3 LarsDatabase ""``. The process which it starts can be terminated after the db-file is created.

If the goal is to deploy the app, the predefined command ``prod`` is the only thing needed to get everything up and running, although one might want to change the port set in the ``start-ts``-file. With the ``prod``-command ``ng build --prod && tsc && node ./build/start.js`` is executed, which builds the app, transpiles all the typescript into JavaScript and starts the server.

If development work needs to be done, then there is a really neat set-up one can use. For it there have to be 3 consoles open in which the following commands from the package.json need to be executed in this order:



| npm command in package.json | executed command                                 |
| :-------------------------- | :----------------------------------------------- |
| ``tsc-watch``               | executes ``tsc-w``                               |
| ``app-watch``               | executes ``ng build --output-path dist --watch`` |
| ``start-dev``               | executes ``nodemon ./server.js localhost 4200``  |



It might also be adviseable to turn off cookies and local storage while devolping, so it is possible to act as multiple students by simply starting the app on new browser tabs.

After running this setup there is no further action needed. If any changes are made to a file that is part of the front-end, the app will automatically refresh. In case changes are made to the project, the changed files will also be (re-)transpiled into JavaScript and the server restarts. It is important to note that if the change occurs in the front-end, this process takes a bit longer and refreshing the app in the browser before all processes are finished sometimes results in the app being served an outdated file.



Before using this software, make sure (and test) before that it meets all legal requirements!

## Customization Option

The software features some parameters meant to be adapted, which are labeled throughout the software by TODO's:

| Parameter                                         | Location                                         |
| :-------------------------------------------------| :----------------------------------------------- |
| page to redirect to in case of no cookie consent  | global-dialog-and-snackbar-components.ts         |
| Delete Timer                                      | global-dialog-and-snackbar-components.ts         |
| Link to Impressum                                 | app.component.ts                                 |
| Link to Datenschutz                               | app.component.ts                                 |
| Enable / Disable Cookies                          | lecture.service.ts                               |
| Enable / Disable Local Storage                    | lecture.service.ts                               |

## Built With

* [Angular](https://angular.io/) - The web framework used
* [Express](https://expressjs.com/) - For the server (in typescript)
* [OvernightJS](https://github.com/seanpmaxwell/overnight) - Provides nice notation for RESTful API and a Logger
* [chartJS](https://www.chartjs.org/) - The library used for the charts
* [ngxScanner](https://github.com/zxing-js/ngx-scanner) - library used for scanning QR-Codes
* [angular2-qrcode](https://github.com/SuperiorJT/angular2-qrcode) - library used for generating QR-Codes
* [nodemon](https://nodemon.io/) - used for better workflow when developing
* [SQLite](https://www.sqlite.org/index.html) - Database used



## Authors

* __Thomas Lintner__





## Acknowledgments

During development following tutorials were of great help in understanding their respective topics:

* Setup Express with TypeScript in 3 Easy Steps, Sean Maxwell as of 08.09.2019
  * https://levelup.gitconnected.com/setup-express-with-typescript-in-3-easy-steps-484772062e01

* A SQLite Tutorial with Node.js, Adam McQuistan as of 08.09.2019
  * https://stackabuse.com/a-sqlite-tutorial-with-node-js/
* Getting Started with Angular: Your First App, Angular.io as of 14.09.2019
  * https://angular.io/start
* How to Conduct a Cognitive Walkthrough, Interaction Design Foundation as of 13.09.2019
  * https://www.interaction-design.org/literature/article/how-to-conduct-a-cognitive-walkthrough
  
  
  Copyright: Thomas Lintner, 2019
