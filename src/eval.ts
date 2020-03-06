import { ParseIter } from "./parse";

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

export default class MainEvaluator implements Evaluator<string> {
    private iter: ParseIter;
    private arglist: any[];

    public constructor(iter: ParseIter, arglist: any[]) {
        this.iter = iter;
        this.arglist = arglist;
    }

    public eval(): string {
        let result = "";
        for (const field of this.iter)
            switch (field.type) {
                case "const":
                    result += new ConstFieldEvaluator(field.value).eval();
            }

        return result;
    }
}
