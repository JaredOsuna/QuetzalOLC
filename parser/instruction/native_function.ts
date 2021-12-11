import { expression } from "../abstract/expression";
import { environment } from "../system/environment";
import { error, error_arr, error_type } from "../system/error";
import { data, type } from "../system/type";
import { _3dCode, _console } from "../system/console";
import { literal } from "../abstract/literal";
import { instruction } from "../abstract/instruction";

export class native_function extends instruction {

    public translate(environment: environment): type {
        let dataType = this.value.translate(environment);
        const dataTemp = _3dCode.actualTemp;
        switch (this.option) {
            case "toInt":
                if (dataType == type.FLOAT) {
                        _3dCode.actualTemp++;
                        _3dCode.output += 'T' + _3dCode.actualTemp + ' = (int)T' + dataTemp + ';//Change value to int\n';
                    return type.INTEGER;
                } else {

                }
            case "toDouble":
                if (dataType == type.INTEGER) {
                    return type.FLOAT;
                } else {

                }
            case "string":
                return type.STRING;
            case "typeof":
                _3dCode.actualTemp++;
                const savedEnvironment = _3dCode.actualTemp;
                _3dCode.output += 'T' + savedEnvironment + ' = SP;//Save environment\n';
                _3dCode.output += 'SP = 27;//Set StringConcat environment\n';
                _3dCode.actualTemp++;
                _3dCode.output += 'T' + _3dCode.actualTemp + ' = SP + 1;//Set number position\n';
                switch (dataType) {
                    case type.STRING:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 0;//Save number\n';
                        break;
                    case type.INTEGER:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 1;//Save number\n';
                        break;
                    case type.FLOAT:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 2;//Save number\n';
                        break;
                    case type.CHAR:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 3;//Save number\n';
                        break;
                    case type.BOOLEAN:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 4;//Save number\n';
                        break;
                    case type.NULL:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 6;//Save number\n';
                        break;
                    default:
                        _3dCode.output += 'STACK[(int)T' + _3dCode.actualTemp + '] = 5;//Save number\n';
                        break;
                }
                _3dCode.output += 'getTypeOf();//Call function\n';
                _3dCode.actualTemp++;
                const resultTemp = _3dCode.actualTemp;
                _3dCode.output += 'T' + _3dCode.actualTemp + ' = SP + 0;//Set return position\n';
                _3dCode.actualTemp++;
                _3dCode.output += 'T' + _3dCode.actualTemp + ' = STACK[(int)T' + resultTemp + '];//Get return value\n';
                _3dCode.output += 'SP = T' + savedEnvironment + ';//Recover environment\n';
                return type.STRING;
        }
        return type.NULL;
    }

    constructor(public option: string, public value: expression | literal, line: number, column: number) {
        super(line, column);
    }

    public execute(environment: environment): data {
        let value_data = this.value.execute(environment)
        switch (this.option) {
            case "toInt":
                try {
                    return { value: parseInt(value_data.value), type: type.INTEGER }
                } catch (e) {
                    error_arr.push(new error(this.line, this.column, error_type.SEMANTICO, 'No se puede parsear a int el valor ' + value_data.value));
                }
            case "toDouble":
                try {
                    return { value: parseFloat(value_data.value), type: type.FLOAT }
                } catch (e) {
                    error_arr.push(new error(this.line, this.column, error_type.SEMANTICO, 'No se puede parsear a double el valor ' + value_data.value));
                }
            case "string":
                try {
                    return { value: String(value_data.value), type: type.STRING }
                } catch (e) {
                    error_arr.push(new error(this.line, this.column, error_type.SEMANTICO, 'No se puede parsear a string el valor ' + value_data.value));
                }
            case "typeof":
                return { value: type[value_data.type], type: type.STRING }
        }


        return { value: null, type: type.NULL }
    }

    public plot(count: number): string {
        throw new Error("Method not implemented.");
    }
}