"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var bodyParser = require("body-parser");
var core_1 = require("@overnightjs/core");
var logger_1 = require("@overnightjs/logger");
var larsController_1 = require("./controllers/larsController");
var LarsServer = /** @class */ (function (_super) {
    __extends(LarsServer, _super);
    function LarsServer() {
        var _this = _super.call(this, true) || this;
        _this.SERVER_START_MSG = 'Lars server started on port: ';
        _this.DEV_MSG = 'Express Server is running in development mode. ' +
            'No front-end content is being served.';
        _this.app.use(bodyParser.json());
        _this.app.use(bodyParser.urlencoded({ extended: true }));
        _super.prototype.addControllers.call(_this, new larsController_1["default"]());
        // Point to front-end code
        if (process.env.NODE_ENV !== 'production') {
            var msg_1 = _this.DEV_MSG + process.env.EXPRESS_PORT;
            _this.app.get('*', function (req, res) { return res.send(msg_1); });
        }
        return _this;
    }
    LarsServer.prototype.setupControllers = function () {
        _super.prototype.addControllers.call(this, new larsController_1["default"]());
    };
    LarsServer.prototype.start = function (port) {
        var _this = this;
        this.app.listen(port, function () {
            logger_1.Logger.Imp(_this.SERVER_START_MSG + port);
        });
    };
    return LarsServer;
}(core_1.Server));
exports["default"] = LarsServer;
