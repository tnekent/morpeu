import { ParseIter, FormatRules, ArgRules, MorphismRules } from "./parse";
import MorphismFactory from "./mod";

interface Evaluator {
    eval(): string;
}

class ConstFieldEvaluator implements Evaluator {
    public value: string;
    public constructor(value: string) {
        this.value = value;
    }

    public eval(): string {
        return this.value;
    }
}

class FormatFieldEvaluator implements Evaluator {
    public argRules: ArgRules;
    public morphRules: MorphismRules;
    public arglist: any[];

    public constructor({ argRules, morphRules }: FormatRules, arglist: any[]) {
        this.argRules = argRules;
        this.morphRules = morphRules;
        this.arglist = arglist;
    }

    private getArg(): any {
        const { props } = this.argRules;
        let { index } = this.argRules;

        if (typeof index === "undefined")
            if (FormatFieldEvaluator.manuallyIndexed === true)
                throw new Error("Cannot switch back to automatic indexing after manually indexing");
            else index = FormatFieldEvaluator.autoIndexAt++;
        else FormatFieldEvaluator.manuallyIndexed = true;


        if (index > this.arglist.length - 1)
            throw new Error(`Index ${index} out of bounds from argument list`);

        return props.reduce((acc, prop): any => {
            if (Object.prototype.hasOwnProperty.call(acc, prop))
                return acc[prop];
            throw new Error(`Property ${prop} does not exist on ${JSON.stringify(acc)}`);
        }, this.arglist[index]);
    }

    private morphArg(arg: any): string {
        const mod = MorphismFactory.getMorphism(this.morphRules, arg);

        return mod.morph();
    }

    public eval(): string {
        const arg = this.getArg(),
            morphed = this.morphArg(arg);

        return morphed;
    }

    public static autoIndexAt = 0;
    public static manuallyIndexed = false;
}

export default class MainEvaluator implements Evaluator {
    private iter: ParseIter;
    private arglist: any[];

    public constructor(iter: ParseIter, arglist: any[]) {
        this.iter = iter;
        this.arglist = arglist;
    }

    public eval(): string {
        let result = "";
        FormatFieldEvaluator.autoIndexAt = 0;
        FormatFieldEvaluator.manuallyIndexed = false;
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
