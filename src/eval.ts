import { ParseIter } from "./parse";

interface Evaluator<T> {
    eval(): T;
}

export default class MainEvaluator implements Evaluator<string> {
    private iter: ParseIter;
    private arglist: any[];

    public constructor(iter: ParseIter, arglist: any[]) {
        this.iter = iter;
        this.arglist = arglist;
    }

    public eval(): string {
        return "";
    }
}
