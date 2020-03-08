import { ModRules } from "./parse";

export interface Modifier {
    morph(): string;
}

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
