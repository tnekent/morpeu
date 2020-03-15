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
}

abstract class FloatModifier extends AbstractModifier {
    public static checkType(arg: any, mod: string): void {
        if (!isFloat(arg))
            throw new Error(`Mod ${mod} only supports float types`);
    }

    public applyPadding(): void {
        // Default align symbol for numbers is ">"
        if (typeof this.modrules.align === "undefined")
            this.modrules.align = ">";
        super.applyPadding();
    }
}

class ModS extends StringModifier {
    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            this.io = (this.io as string).slice(0, this.modrules.precision);
    }
}

class ModI extends IntegerModifier {
    public applyPrecision(): void {
        if (typeof this.modrules.precision !== "undefined")
            throw new Error("Mod i does not support precision");
    }
}

class ModF extends FloatModifier {
    public applyPrecision(): void {
        const { precision = 6 } = this.modrules;

        this.io = (this.io as number).toFixed(precision);
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
    // eslint-disable-next-line max-lines-per-function
    public static getModifier(modrules: ModRules, arg: any): Modifier {
        let modclass: StaticModifier;
        switch (modrules.mod) {
            case "s":
                modclass = ModS;
                break;
            case "i":
                modclass = ModI;
                break;
            case "f":
                modclass = ModF;
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
            case isFloat(arg): return ModF;
            default: return ModJ;
        }
    }
}
