import MainParser from "./parse";
import MainEvaluator from "./eval";

export = function morph(input: string, ...arglist: any[]): string {
    return new MainEvaluator(new MainParser(input).parse(), arglist).eval();
}
