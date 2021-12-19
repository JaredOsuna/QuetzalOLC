"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = void 0;
const type_1 = require("./type");
const _symbol_1 = require("./_symbol");
class environment {
    constructor(previous) {
        this.previous = previous;
        this.previous = previous;
        this.symbol_map = new Map();
        this.function_map = new Map();
    }
    get_html() {
        let result = '<div class="table-wrapper-scroll-y my-custom-scrollbar">';
        result += '<table class="table table-hover">\n';
        result += '<thead>\n<tr>\n<th scope="col">#</th>\n';
        result += '<th scope="col">Valor</th>\n';
        result += '<th scope="col">ID</th>\n';
        result += '<th scope="col">Tipo</th>\n';
        result += '<th scope="col">Ambito</th>\n';
        result += '</tr>\n';
        result += '</thead>\n';
        result += '<tbody>\n';
        let count = 1;
        this.symbol_map.forEach(element => {
            result += '<tr>\n';
            result += '<th scope="row">' + count + '</th>\n';
            result += element.get_html();
            result += '</tr>\n';
            count++;
        });
        this.function_map.forEach(element => {
            result += '<tr>\n';
            result += '<th scope="row">' + count + '</th>\n';
            result += element.get_html();
            result += '</tr>\n';
            count++;
        });
        result += '</tbody>\n';
        return result += '</table></div>';
    }
    save_function(id, new_function, absolute, relative, size) {
        let symbol_type = _symbol_1.scope.LOCAL;
        if (this.previous == null) {
            symbol_type = _symbol_1.scope.GLOBAL;
        }
        this.function_map.set(id, new _symbol_1._symbol(id, new_function, symbol_type, absolute, relative, size));
    }
    get_function(id) {
        let symbol_item = this.function_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            let return_function = symbol_item.data;
            return return_function;
        }
        return null;
    }
    save_variable(id, data, absolute, relative, size) {
        let symbol_type = _symbol_1.scope.LOCAL;
        if (this.previous == null) {
            symbol_type = _symbol_1.scope.GLOBAL;
        }
        this.symbol_map.set(id, new _symbol_1._symbol(id, data, symbol_type, absolute, relative, size));
    }
    get_variable(id) {
        let symbol_item = this.symbol_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            let return_data = symbol_item.data;
            return return_data;
        }
        return { value: null, type: type_1.type.UNDEFINED };
    }
    get_variable_func(id) {
        let symbol_item = this.symbol_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            return symbol_item;
        }
        return null;
    }
    get_absolute(id) {
        let symbol_item = this.symbol_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            return symbol_item.absolute;
        }
        return -1;
    }
    get_size(id) {
        let symbol_item = this.symbol_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            return symbol_item.size;
        }
        return -1;
    }
    get_relative(id) {
        let symbol_item = this.symbol_map.get(id);
        if (symbol_item instanceof _symbol_1._symbol) {
            return symbol_item.relative;
        }
        return -1;
    }
}
exports.environment = environment;
//# sourceMappingURL=environment.js.map