export class Validation {
    public static assertString(val: any, name: string): void {
        if (typeof val !== "string") {
            throw new Error(`${name} must be a string but was: ${val}`);
        }
    }

    public static assertNumber(val: any, name: string): void {
        if (typeof val !== "number") {
            throw new Error(`${name} must be a number but was: ${val}`);
        }
    }

    public static assertDefined(val: any, name: string): void {
        if (val === undefined || val === null) {
            throw new Error(`${name} must be a defined but was: ${val}`);
        }
    }

    public static assertFunction(val: any, name: string): void {
        if (typeof val !== "function") {
            throw new Error(`${name} must be a function but was: ${typeof val}`);
        }
    }

    public static assertPosition(val: any, name: string): void {
        Validation.assertDefined(val, name);

        if (typeof val.lineNumber !== "number" || typeof val.column !== "number") {
            throw new Error(`${name} must be an Object like {lineNumber: number, column: number}: ${JSON.stringify(val)}`);
        }
    }
}