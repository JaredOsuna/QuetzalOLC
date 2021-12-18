import { environment } from "../system/environment";
import { data, type } from "../system/type";
import { _console, _3dCode } from "../system/console";
import { instruction } from "../abstract/instruction";
import { parameter } from "../expression/parameter";
import { error, error_arr, error_type } from "../system/error";
import { _return } from "./_return";

export class declaration_function extends instruction {

    public functionEnvironment: environment;

    public translate(env: environment): type {
        let return_data;
        let paramName;
        this.functionEnvironment = new environment(env);
        switch (this.native_type) {
            case type.INTEGER:
            case type.STRING:
            case type.CHAR:
            case type.BOOLEAN:
            case type.FLOAT:
                _3dCode.output += 'float ' + this.id + '(){\n'
                break;
            default:
                _3dCode.output += 'void ' + this.id + '(){\n'
                break;
        }
        let size = 0;
        _3dCode.actualTemp++;
        this.functionEnvironment.save_variable('return', { value: null, type: this.native_type }, _3dCode.absolutePos, _3dCode.relativePos, 1);
        _3dCode.relativePos++;
        _3dCode.absolutePos++;
        size++;
        this.parameters.forEach(param => {
            return_data = param.execute(this.functionEnvironment);
            paramName = return_data.value as string
            this.functionEnvironment.save_variable(paramName, return_data, _3dCode.absolutePos, _3dCode.relativePos, 1);
            _3dCode.output += 'T' + _3dCode.actualTemp + ' = SP + ' + _3dCode.relativePos + ';//Setting position for parameter ' + paramName + '\n';
            _3dCode.relativePos++;
            _3dCode.absolutePos++;
            size++;
        });
        this.code.forEach(instr => {
            if (instr instanceof _return) {
                return_data = instr.execute(this.functionEnvironment)
                return;
            } else {
                instr.translate(this.functionEnvironment)
            }
        });
        _3dCode.relativePos = 0;
        _3dCode.output += 'return;\n';
        _3dCode.output += '}\n\n';
        _3dCode.functionsCode += _3dCode.output;
        _3dCode.output = "";
        env.save_variable(this.id, { value: null, type: type.FUNCTION }, _3dCode.absolutePos, _3dCode.absolutePos, size);
        return type.NULL;
    }

    constructor(public native_type: type, public id: string, public parameters: Array<parameter>, public code: Array<instruction>, line: number, column: number) {
        super(line, column);
        this.functionEnvironment = new environment(null);
    }

    public execute(environment: environment): data {

        environment.save_function(this.id, this, 0, 0, 0);
        // Default
        return { value: null, type: type.NULL }
    }

    public plot(count: number): string {
        throw new Error("Method not implemented.");
    }
}