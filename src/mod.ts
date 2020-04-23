import { ModRules } from "./parse";

export interface Modifier {
    morph(): string;
}

interface StaticModifier {
    new (modrules: ModRules, arg: any): Modifier;
    checkType(arg: any, mod: string): void;
}

const isString = (arg: any): boolean => typeof arg === "string",
    { isInteger } = Number,
    isFloat = (arg: any): boolean => typeof arg === "number" && !Number.isInteger(arg);

abstract class AbstractModifier implements Modifier {
    protected modrules: ModRules;
    protected arg: any;
    protected output: string;

    public constructor(modrules: ModRules, arg: any) {
        this.modrules = modrules;
        this.arg = arg;
        this.output = String(arg);
    }

    public applyPadding(): void {
        if (this.modrules.padding !== 0) {
            const { padding, align = "<" } = this.modrules;

            switch (align) {
                case "<":
                    this.output = `${this.output}${" ".repeat(padding)}`;
                    break;

                case ">":
                    this.output = `${" ".repeat(padding)}${this.output}`;
                    break;

                case "^": {
                    const left = Math.ceil(padding / 2), right = padding - left;
                    this.output = `${" ".repeat(left)}${this.output}${" ".repeat(right)}`;
                }
                    break;
                case "=":
                    const pad = " ".repeat(padding);
                    this.output = `${pad}${this.output}${pad}`;
            }
        }
    }

    abstract applyPrecision(): void;
    abstract applySign(): void;

    // eslint-disable-next-line class-methods-use-this
    preprocessOutput(): void {
        // no-op
    }

    public morph(): string {
        this.preprocessOutput();
        this.applyPrecision();
        this.applySign();
        this.applyPadding();

        return this.output;
    }
}

abstract class StringModifier extends AbstractModifier {
    public static checkType(arg: any, mod: string): void {
        if (!isString(arg))
            throw new Error(`Mod ${mod} only supports string types`);
    }

    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            this.output = (this.arg as string).slice(0, this.modrules.precision);
    }

    public applySign(): void {
        if (typeof this.modrules.sign !== "undefined")
            throw new Error("String type modifiers do not support signs");
    }
}

abstract class NumericModifier extends AbstractModifier {
    public applyPadding(): void {
        // Default align symbol for numbers is ">"
        if (typeof this.modrules.align === "undefined")
            this.modrules.align = ">";
        super.applyPadding();
    }

    public applySign(): void {
        const { sign = "-" } = this.modrules;

        switch (sign) {
            // Negative numbers are casted with signs so no neednto add "-".
            case "+":
                this.output = (this.arg !== 0 && this.arg > 0 ? "+" : "") + this.output;
                break;
            case "-":
                // No-op since casting has same bahavior
                break;
            case " ":
                this.output = (this.arg !== 0 && this.arg > 0 ? " " : "") + this.output;
                break;
        }
    }
}

abstract class IntegerModifier extends NumericModifier {
    public static checkType(arg: any, mod: string): void {
        if (!isInteger(arg))
            throw new Error(`Mod ${mod} only supports integer types`);
    }

    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            throw new Error("Integer type modifiers do not support precision");
    }
}

abstract class FloatModifier extends NumericModifier {
    public static checkType(arg: any, mod: string): void {
        if (typeof arg !== "number")
            throw new Error(`Mod ${mod} only supports float types`);
    }

    public applyPrecision(): void {
        const { precision = 6 } = this.modrules;

        this.output = (this.arg as number).toFixed(precision);
    }
}

class ModS extends StringModifier {}

class ModI extends IntegerModifier {}

class ModB extends IntegerModifier {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(2);
    }
}

class ModX extends IntegerModifier {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(16);
    }
}

class ModXX extends IntegerModifier {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(16).toUpperCase();
    }
}

class ModO extends IntegerModifier {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(8);
    }
}

class ModC extends IntegerModifier {
    public morph(): string {
        this.output = String.fromCharCode(this.arg as number);

        return super.morph();
    }
}

class ModF extends FloatModifier {}

class ModG extends FloatModifier {
    public applyPrecision(): void {
        const { precision = 6 } = this.modrules,
            exponentForm = (this.arg as number).toExponential(precision),
            exponentN = parseInt(/[+-]\d+$/.exec(exponentForm)[0]);

        if (exponentN < -4 || exponentN >= precision) {
            const significand = exponentForm.slice(0, exponentForm.indexOf("e")),
                exp = exponentForm.slice(significand.length);

            this.output = this.removeTrailingZeroesAndDot(significand) + exp;
        }
        else
            this.output = this.removeTrailingZeroesAndDot((this.arg as number).toFixed(precision));

    }

    // eslint-disable-next-line class-methods-use-this
    private removeTrailingZeroesAndDot(from: string): string {
        let trimIndex = from.length - 1;
        for (let i = trimIndex; i >= 0 && from[i] === "0"; i--)
            trimIndex--;
        if (from[trimIndex] === ".") trimIndex--;

        return from.slice(0, trimIndex + 1);
    }
}

class ModE extends FloatModifier {
    public applyPrecision(): void {
        const { precision = 6 } = this.modrules;
        this.output = (this.arg as number).toExponential(precision);
    }
}

class ModEE extends FloatModifier {
    public applyPrecision(): void {
        const { precision = 6 } = this.modrules;
        this.output = (this.arg as number).toExponential(precision).toUpperCase();
    }
}

class ModPercent extends FloatModifier {
    public morph(): string {
        this.arg *= 100;
        this.applyPrecision();
        this.output += "%";
        this.applyPadding();

        return this.output;
    }
}

export default class ModifierFactory {
    // eslint-disable-next-line complexity, max-lines-per-function
    public static getModifier(modrules: ModRules, arg: any): Modifier {
        let modclass: StaticModifier;
        switch (modrules.mod) {
            case "s":
                modclass = ModS;
                break;
            case "i":
                modclass = ModI;
                break;
            case "b":
                modclass = ModB;
                break;
            case "x":
                modclass = ModX;
                break;
            case "X":
                modclass = ModXX;
                break;
            case "o":
                modclass = ModO;
                break;
            case "f":
                modclass = ModF;
                break;
            case "g":
                modclass = ModG;
                break;
            case "c":
                modclass = ModC;
                break;
            case "e":
                modclass = ModE;
                break;
            case "E":
                modclass = ModEE;
                break;
            case "%":
                modclass = ModPercent;
                break;
            case undefined:
                modclass = this.getDefaultModifier(arg);
                break;
            default: throw new Error(`Mod ${modrules.mod} is not implemented`);
        }
        // Because we already check when we run this.getDefaultModifier(arg);
        if (typeof modrules.mod !== "undefined")
            modclass.checkType(arg, modrules.mod);

        return new modclass(modrules, arg);
    }

    private static getDefaultModifier(arg: any): StaticModifier {
        switch (true) {
            case isString(arg): return ModS;
            case isInteger(arg): return ModI;
            case isFloat(arg): return ModG;
            default: return ModS;
        }
    }
}
