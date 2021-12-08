"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._symbol = exports.scope = void 0;
var scope;
(function (scope) {
    scope[scope["GLOBAL"] = 0] = "GLOBAL";
    scope[scope["LOCAL"] = 1] = "LOCAL";
})(scope = exports.scope || (exports.scope = {}));
class _symbol {
    constructor(id, data, scope) {
        this.id = id;
        this.data = data;
        this.scope = scope;
    }
}
exports._symbol = _symbol;
//# sourceMappingURL=_symbol.js.map