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
    protected io: any;

    public constructor(modrules: ModRules, arg: any) {
        this.modrules = modrules;
        this.io = arg;
    }

    public applyPadding(): void {
        if (this.modrules.padding !== 0) {
            const { padding, align = "<" } = this.modrules;

            switch (align) {
                case "<":
                    this.io = `${this.io}${" ".repeat(padding)}`;
                    break;

                case ">":
                    this.io = `${" ".repeat(padding)}${this.io}`;
                    break;

                case "^": {
                    const left = Math.ceil(padding / 2), right = padding - left;
                    this.io = `${" ".repeat(left)}${this.io}${" ".repeat(right)}`;
                }
                    break;

            }
        }
    }

    abstract applyPrecision(): void;

    public morph(): string {
        this.applyPrecision();
        this.applyPadding();

        return this.io;
    }
}

abstract class StringModifier extends AbstractModifier {
    public static checkType(arg: any, mod: string): void {
        if (!isString(arg))
            throw new Error(`Mod ${mod} only supports string types`);
    }

    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            this.io = (this.io as string).slice(0, this.modrules.precision);
    }
}

abstract class IntegerModifier extends AbstractModifier {
    public static checkType(arg: any, mod: string): void {
        if (!isInteger(arg))
            throw new Error(`Mod ${mod} only supports integer types`);
    }

    public applyPadding(): void {
        // Default align symbol for numbers is ">"
        if (typeof this.modrules.align === "undefined")
            this.modrules.align = ">";
        super.applyPadding();
    }

    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            throw new Error("Integer type modifiers does not support precision");
    }
}

abstract class FloatModifier extends AbstractModifier {
    public static checkType(arg: any, mod: string): void {
        if (typeof arg !== "number")
            throw new Error(`Mod ${mod} only supports float types`);
    }

    public applyPadding(): void {
        // Default align symbol for numbers is ">"
        if (typeof this.modrules.align === "undefined")
            this.modrules.align = ">";
        super.applyPadding();
    }

    public applyPrecision(): void {
        const { precision = 6 } = this.modrules;

        this.io = (this.io as number).toFixed(precision);
    }
}

class ModS extends StringModifier {}

class ModI extends IntegerModifier {}

class ModB extends IntegerModifier {
    public morph(): string {
        this.io = (this.io as number).toString(2);

        return super.morph();
    }
}

class ModX extends IntegerModifier {
    public morph(): string {
        this.io = (this.io as number).toString(16);

        return super.morph();
    }
}

class ModXX extends IntegerModifier {
    public morph(): string {
        this.io = (this.io as number).toString(16).toUpperCase();

        return super.morph();
    }
}

class ModO extends IntegerModifier {
    public morph(): string {
        this.io = (this.io as number).toString(8);

        return super.morph();
    }
}

class ModF extends FloatModifier {}

class ModG extends FloatModifier {
    public applyPrecision(): void {
        const { precision = 6 } = this.modrules,
            exponentForm = (this.io as number).toExponential(precision),
            exponentN = parseInt(/[+-]\d+$/.exec(exponentForm)[0]);

        if (exponentN < -4 || exponentN >= precision) {
            const significand = exponentForm.slice(0, exponentForm.indexOf("e")),
                exp = exponentForm.slice(significand.length);

            this.io = this.removeTrailingZeroesAndDot(significand) + exp;
        }
        else
            this.io = this.removeTrailingZeroesAndDot((this.io as number).toFixed(precision));

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
        this.io = (this.io as number).toExponential(precision);
    }
}

class ModEE extends FloatModifier {
    public applyPrecision(): void {
        const { precision = 6 } = this.modrules;
        this.io = (this.io as number).toExponential(precision).toUpperCase();
    }
}

class ModJ extends AbstractModifier {
    public static checkType(): void {
        // Since any JavaScript value is serializable to JSON,
        // checking always passes.
        return;
    }

    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            throw new Error("Mod j does not support precision");
    }

    private toJSON(): void {
        this.io = JSON.stringify(this.io);
    }

    public morph(): string {
        this.toJSON();

        return super.morph();
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
            case "e":
                modclass = ModE;
                break;
            case "E":
                modclass = ModEE;
                break;
            case "j":
                modclass = ModJ;
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
            default: return ModJ;
        }
    }
}
