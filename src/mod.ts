import { ModRules } from "./parse";

export interface Modifier {
    morph(): string;
}

const isString = (arg: any): boolean => typeof arg === "string",
    { isInteger } = Number,
    isFloat = (arg: any): boolean => typeof arg === "number" && !Number.isInteger(arg);

abstract class AbstractModifier implements Modifier {
    protected modrules: ModRules;
    protected io: any;

    public constructor(modrules: ModRules, arg: any) {
        this.modrules = modrules;
        this.checkType(arg);
        this.io = arg;
    }

    abstract checkType(of: any): void;

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

class ModS extends AbstractModifier {
    public checkType(of: any): void {
        if (isString(of) === false)
            throw new Error("Mod s only supports string type");
    }

    public applyPrecision(): void {
        if (this.modrules.precision !== -1)
            this.io = (this.io as string).slice(0, this.modrules.precision);
    }
}

class ModI extends AbstractModifier {
    public checkType(of: any): void {
        if (isInteger(of) === false)
            throw new Error("Mod i only supports numbers as integer type");
    }

    public applyPrecision(): void {
        if (this.modrules.precision !== -1)
            throw new Error("Mod i does not support precision");
    }
}

class ModF extends AbstractModifier {
    public checkType(of: any): void {
        if (isFloat(of) === false)
            throw new Error("Mod f only supports numbers as float type");
    }

    public applyPrecision(): void {
        const precision = this.modrules.precision !== -1
            ? this.modrules.precision : 6;

        this.io = (this.io as number).toFixed(precision);
    }
}

export default class ModifierFactory {
    public static getModifier(modrules: ModRules, arg: any): Modifier {
        switch (modrules.mod) {
            case "s": return new ModS(modrules, arg);
            case "i": return new ModI(modrules, arg);
            case "f": return new ModF(modrules, arg);
            case "": return this.getDefaultModifier(modrules, arg);
            default: throw new Error(`Mod ${modrules.mod} is not implemented`);
        }
    }

    private static getDefaultModifier(modrules: ModRules, arg: any): Modifier {
        switch (true) {
            case isString(arg): return new ModS(modrules, arg);
            case isInteger(arg): return new ModI(modrules, arg);
            case isFloat(arg): return new ModF(modrules, arg);
            default: throw new Error(`Unknown type ${arg}. You should report this`);
        }
    }
}