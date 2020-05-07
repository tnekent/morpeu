import { MorphismRules } from "./parse";

export interface Morphism {
    morph(): string;
}

interface StaticMorphism {
    new (morphRules: MorphismRules, arg: any): Morphism;
    checkType(arg: any, morphism: string): void;
}

const isStringable = (arg: any): boolean =>
        typeof arg === "string" ||
        arg === null ||
        arg === undefined ||
        typeof arg.toString === "function",
    { isInteger } = Number,
    isFloat = (arg: any): boolean => typeof arg === "number" && !Number.isInteger(arg);

abstract class AbstractMorphism implements Morphism {
    protected morphRules: MorphismRules;
    protected arg: any;
    protected output: string;

    public constructor(morphRules: MorphismRules, arg: any) {
        this.morphRules = morphRules;
        this.arg = arg;
        this.output = String(arg);
    }

    public applyPadding(): void {
        if (this.morphRules.padding !== 0) {
            const { padfill = " ", padding, align = "<" } = this.morphRules;

            switch (align) {
                case "<":
                    this.output = `${this.output}${padfill.repeat(padding)}`;
                    break;

                case ">":
                    this.output = `${padfill.repeat(padding)}${this.output}`;
                    break;

                case "^": {
                    const left = Math.ceil(padding / 2), right = padding - left;
                    this.output = `${padfill.repeat(left)}${this.output}${padfill.repeat(right)}`;
                }
                    break;

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

abstract class StringMorphism extends AbstractMorphism {
    public static checkType(arg: any, mod: string): void {
        if (!isStringable(arg))
            throw new Error(`Mod ${mod} only supports string types`);
    }

    public applyPrecision(): void {
        if (typeof this.morphRules.precision !== "undefined")
            this.output = (this.arg as string).slice(0, this.morphRules.precision);
    }

    public applySign(): void {
        if (typeof this.morphRules.sign !== "undefined")
            throw new Error("String type modifiers do not support signs");
    }
}

abstract class NumericMorphism extends AbstractMorphism {
    public applyPadding(): void {
        // Default align symbol for numbers is ">"
        if (typeof this.morphRules.align === "undefined")
            this.morphRules.align = ">";
        super.applyPadding();
    }

    public applySign(): void {
        const { sign = "-" } = this.morphRules;

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

abstract class IntegerMorphism extends NumericMorphism {
    public static checkType(arg: any, mod: string): void {
        if (!isInteger(arg))
            throw new Error(`Mod ${mod} only supports integer types`);
    }

    public applyPrecision(): void {
        if (typeof this.morphRules.precision !== "undefined")
            throw new Error("Integer type modifiers do not support precision");
    }
}

abstract class FloatMorphism extends NumericMorphism {
    public static checkType(arg: any, mod: string): void {
        if (typeof arg !== "number")
            throw new Error(`Mod ${mod} only supports float types`);
    }

    public applyPrecision(): void {
        const { precision = 6 } = this.morphRules;

        this.output = (this.arg as number).toFixed(precision);
    }
}

class ModS extends StringMorphism {}

class ModI extends IntegerMorphism {}

class ModB extends IntegerMorphism {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(2);
    }
}

class ModX extends IntegerMorphism {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(16);
    }
}

class ModXX extends IntegerMorphism {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(16).toUpperCase();
    }
}

class ModO extends IntegerMorphism {
    public preprocessOutput(): void {
        this.output = (this.arg as number).toString(8);
    }
}

class ModC extends IntegerMorphism {
    public morph(): string {
        this.output = String.fromCharCode(this.arg as number);

        return super.morph();
    }
}

class ModF extends FloatMorphism {}

class ModG extends FloatMorphism {
    public applyPrecision(): void {
        const { precision = 6 } = this.morphRules,
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

class ModE extends FloatMorphism {
    public applyPrecision(): void {
        const { precision = 6 } = this.morphRules;
        this.output = (this.arg as number).toExponential(precision);
    }
}

class ModEE extends FloatMorphism {
    public applyPrecision(): void {
        const { precision = 6 } = this.morphRules;
        this.output = (this.arg as number).toExponential(precision).toUpperCase();
    }
}

class ModPercent extends FloatMorphism {
    public morph(): string {
        this.arg *= 100;
        this.applyPrecision();
        this.output += "%";
        this.applyPadding();

        return this.output;
    }
}

export default class MorphismFactory {
    // eslint-disable-next-line complexity, max-lines-per-function
    public static getMorphism(morphRules: MorphismRules, arg: any): Morphism {
        let modclass: StaticMorphism;
        switch (morphRules.morphism) {
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
                modclass = this.getDefaultMorphism(arg);
                break;
            default: throw new Error(`Mod ${morphRules.morphism} is not implemented`);
        }
        // Because we already check when we run this.getDefaultMorphism(arg);
        if (typeof morphRules.morphism !== "undefined")
            modclass.checkType(arg, morphRules.morphism);

        return new modclass(morphRules, arg);
    }

    private static getDefaultMorphism(arg: any): StaticMorphism {
        switch (true) {
            case isInteger(arg): return ModI;
            case isFloat(arg): return ModG;
            case isStringable(arg): return ModS;
        }
        throw new Error("Unsupported type: " + require("util").format(arg));
    }
}
