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
