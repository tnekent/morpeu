import { ParseIter, FormatRules, ArgRules, ModRules } from "./parse";
import ModifierFactory from "./mod";

interface Evaluator<T> {
    eval(): T;
}

class ConstFieldEvaluator implements Evaluator<string> {
    public value: string;
    public constructor(value: string) {
        this.value = value;
    }

    public eval(): string {
        return this.value;
    }
}

class FormatFieldEvaluator implements Evaluator<string> {
    public argrules: ArgRules;
    public modrules: ModRules;
    public arglist: any[];

    public constructor({ argrules, modrules }: FormatRules, arglist: any[]) {
        this.argrules = argrules;
        this.modrules = modrules;
        this.arglist = arglist;
    }

    private getArg(): any {
        const index = this.argrules.index !== -1 ? this.argrules.index : FormatFieldEvaluator.autoIndexAt++,
            { props } = this.argrules;

        if (index > this.arglist.length - 1)
            throw new Error(`Index ${index} out of bounds from argument list`);

        return props.reduce((acc, prop): any => {
            if (Object.prototype.hasOwnProperty.call(acc, prop))
                return acc[prop];
            throw new Error(`Property ${prop} does not exist on ${JSON.stringify(acc)}`);
        }, this.arglist[index]);
    }

    private morphArg(arg: any): string {
        const mod = ModifierFactory.getModifier(this.modrules, arg);

        return mod.morph();
    }

    public eval(): string {
        const arg = this.getArg(),
            morphed = this.morphArg(arg);

        return morphed;
    }

    public static autoIndexAt = 0;
}

export default class MainEvaluator implements Evaluator<string> {
    private iter: ParseIter;
    private arglist: any[];

    public constructor(iter: ParseIter, arglist: any[]) {
        this.iter = iter;
        this.arglist = arglist;
    }

    public eval(): string {
        let result = "";
        FormatFieldEvaluator.autoIndexAt = 0;
        for (const field of this.iter)
            switch (field.type) {
                case "const":
                    result += new ConstFieldEvaluator(field.value).eval();
                    break;
                case "format":
                    result += new FormatFieldEvaluator(field.value, this.arglist).eval();
            }

        return result;
    }
}
