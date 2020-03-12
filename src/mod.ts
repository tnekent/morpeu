import { ModRules } from "./parse";

export interface Modifier {
    morph(): string;
}

interface StaticModifier {
    new (modrules: ModRules, arg: any): Modifier;
    checkType(mod: string): void;
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
        if (this.modrules.padding !== 0)
            this.io = `${" ".repeat(this.modrules.padding)}${this.io}`;
    }

    abstract applyPrecision(): void;

    public morph(): string {
        this.applyPrecision();
        this.applyPadding();

        return this.io;
    }
}

abstract class StringModifier extends AbstractModifier {
    public static checkType(mod: string): void {
        if (!isString(mod))
            throw new Error(`Mod ${mod} only supports string types`);
    }
}

abstract class IntegerModifier extends AbstractModifier {
    public static checkType(mod: string): void {
        if (!isString(mod))
            throw new Error(`Mod ${mod} only supports integer types`);
    }
}

abstract class FloatModifier extends AbstractModifier {
    public static checkType(mod: string): void {
        if (!isString(mod))
            throw new Error(`Mod ${mod} only supports float types`);
    }
}

class ModS extends StringModifier {
    public applyPrecision(): void {
        if (this.modrules.precision !== -1)
            this.io = (this.io as string).slice(0, this.modrules.precision);
    }
}

class ModI extends IntegerModifier {
    public applyPrecision(): void {
        if (this.modrules.precision !== -1)
            throw new Error("Mod i does not support precision");
    }
}

class ModF extends FloatModifier {
    public applyPrecision(): void {
        const precision = this.modrules.precision !== -1
            ? this.modrules.precision : 6;

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
        if (this.modrules.precision !== -1)
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
            case "":
                modclass = this.getDefaultModifier(arg);
                break;
            default: throw new Error(`Mod ${modrules.mod} is not implemented`);
        }
        modclass.checkType(modrules.mod);

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
