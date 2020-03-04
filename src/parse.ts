interface Parser<T> {
    input: string;
    index: number;
    parse(): T;
}

interface ParserConstructor<T> {
    new (input: string, index: number): Parser<T>;
}

interface ConstField {
    type: "const";
    value: string;
}

interface FormatField {
    type: "format";
    value: FormatRules;
}

interface FormatRules {
    argrules: ArgRules;
    modrules: ModRules;
}

interface ArgRules {
    index: number;
    props: string[];
}

interface ModRules {
    padding: number;
    precision: number;
    mod: string;
}

type Field = ConstField | FormatField;
type ParseIter = Generator<Field>;

abstract class AbstractParser<T> implements Parser<T> {
    public input: string;
    public index: number;

    public constructor(input: string, index: number) {
        this.input = input;
        this.index = index;
    }

    protected get curChar(): string {
        return this.input[this.index];
    }

    protected matchAndUpdate(regex: RegExp): string | undefined {
        const match = regex.exec(this.input.slice(this.index));
        let result: string | undefined;
        if (match !== null) {
            [ result ] = match;
            this.index += result.length;
        }

        return result;
    }

    protected parseWith<P>(pctor: ParserConstructor<P>): P {
        const pclass = new pctor(this.input, this.index),
            parseResult: P = pclass.parse();

        this.index = pclass.index;

        return parseResult;
    }

    abstract parse(): T;
}

class ConstFieldParser extends AbstractParser<ConstField> {
    public parse(): ConstField {
        const chars = this.matchAndUpdate(/^[^{}]+/) as string;

        return { type: "const", value: chars };
    }
}

class ConstFieldBraceParser extends AbstractParser<ConstField> {
    public parse(): ConstField {
        const brace = this.curChar;
        this.index++;

        return { type: "const", value: brace };
    }
}

export default class MainParser extends AbstractParser<ParseIter> {
    public constructor(input: string) {
        super(input, 0);
    }

    public *parse(): ParseIter {
        yield { type: "const", value: "" };
    }
}
