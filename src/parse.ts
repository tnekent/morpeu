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

export interface FormatRules {
    argrules: ArgRules;
    modrules: ModRules;
}

export interface ArgRules {
    index: number;
    props: string[];
}

export interface ModRules {
    align: ModAlignSymbol;
    padding: number;
    precision: number;
    mod: string;
}

type ModAlignSymbol = "<" | ">" | "^"

export type Field = FormatField | ConstField;
export type ParseIter = Generator<Field>;

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

    protected matchAndUpdate(regex: RegExp): string {
        const match = regex.exec(this.input.slice(this.index));
        let result: string;
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

class ArgRulesParser extends AbstractParser<ArgRules> {
    public parse(): ArgRules {
        const index = this.parseIndex(),
            props = this.parseProps();

        return { index, props };
    }

    private parseIndex(): number {
        const index = this.matchAndUpdate(/^\d+/);

        return typeof index !== "undefined" ? parseInt(index) : undefined;
    }

    private parseProps(): string[] {
        const props: string[] = [];
        let running = true;

        while (running)
            switch (this.curChar) {
                case ".":
                    props.push(this.parseDotProp());
                    break;
                case "[":
                    props.push(this.parseBracketProp());
                    break;
                default:
                    running = false;
            }

        return props;
    }

    private parseDotProp(): string {
        this.index++;
        const prop = this.matchAndUpdate(/^[A-Za-z$_][A-Za-z0-9$_]*/);
        if (typeof prop === "undefined")
            throw new Error("Expected a valid identifier after dot");

        return prop;
    }

    private parseBracketProp(): string {
        this.index++;
        const prop = this.matchAndUpdate(/^[^\]]+/);
        if (typeof prop === "undefined")
            throw new Error("Expected a string inside brackets");
        else if (this.curChar !== "]")
            throw new Error("A bracket is not properly closed");
        this.index++;

        return prop;
    }
}

class ModRulesParser extends AbstractParser<ModRules> {
    public parse(): ModRules {
        const align = this.parseAlign(),
            padding = this.parsePadding(),
            precision = this.parsePrecision(),
            mod = this.parseMod();

        return { padding, precision, mod, align };
    }

    private parseAlign(): ModAlignSymbol {
        return this.matchAndUpdate(/^[<>^]/) as ModAlignSymbol;
    }

    private parsePadding(): number {
        const padding = this.matchAndUpdate(/^\d+/);

        return typeof padding !== "undefined" ? parseInt(padding) : undefined;
    }

    private parsePrecision(): number {
        let precision;
        if (this.curChar === ".") {
            this.index++;
            const precmatch = this.matchAndUpdate(/^\d+/);
            if (typeof precmatch === "undefined")
                throw new Error("Expected a number after the dot");
            precision = parseInt(precmatch);
        }

        return precision;
    }

    private parseMod(): string {
        const mod = this.matchAndUpdate(/^[A-Za-z]/);

        return typeof mod !== "undefined" ? mod : undefined;
    }
}

class FormatFieldParser extends AbstractParser<FormatField> {
    public parse(): FormatField {
        const argrules = this.parseWith(ArgRulesParser);
        this.skipDelimiter();
        const modrules = this.parseWith(ModRulesParser);
        this.checkEndBrace();

        return {
            type: "format",
            value: { argrules, modrules }
        };
    }

    private skipDelimiter(): void {
        switch (this.curChar) {
            case "|":
                this.index++;
                break;
            case "}":
                break;
            default:
                throw new Error("Unexpected character");
        }
    }

    private checkEndBrace(): void {
        if (this.curChar !== "}")
            throw new Error("Expected a closing brace");
        this.index++;
    }
}

export default class MainParser extends AbstractParser<ParseIter> {
    public constructor(input: string) {
        super(input, 0);
    }

    public *parse(): ParseIter {
        while (typeof this.curChar !== "undefined")
            if (/[{}]/.test(this.curChar))
                yield this.understandBrace();
            else yield this.parseWith(ConstFieldParser);

    }

    private understandBrace(): Field {
        const brace = this.curChar;
        this.index++;
        if (this.curChar === brace)
            return this.parseWith(ConstFieldBraceParser);

        return this.parseWith(FormatFieldParser);
    }
}
