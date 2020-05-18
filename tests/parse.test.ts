import Parser from "../src/parse";

function parse(input: string) {
    return new Parser(input).parse();
}

test("parses and returns a field", () => {
    const iter = parse("Hello World!").next();
    expect(iter.done).toBeFalsy();
    expect(iter.value).toMatchObject({
        type: expect.any(String),
        value: expect.anything()
    });
});

describe("Const field", () => {
    test("parses const field of non-brace characters", () => {
        const iter = parse("FooBar"),
            { value: field } = iter.next();

        expect(field).toMatchObject({
            type: "const",
            value: "FooBar"
        });
        expect(iter.next().done).toBeTruthy();
    });

    test("parses const field of literal braces", () => {
        const iter = parse("}}{{");
        let { value: field } = iter.next();
        expect(field).toMatchObject({
            type: "const",
            value: "}"
        });
        field = iter.next().value;
        expect(field).toMatchObject({
            type: "const",
            value: "{"
        });
        expect(iter.next().done).toBeTruthy();
    });
});

describe("Format type field", () => {
    test("parses empty format field", () => {
        const iter = parse("{}"),
            { value: field } = iter.next();

        expect(field.type).toBe("format");
        expect(field.value.argRules).toBeDefined();
        expect(field.value.morphRules).toBeDefined();
        expect(iter.next().done).toBeTruthy();
    });

    test("parses format field with only delimiter", () => {
        const iter = parse("{|}"),
            { value: field } = iter.next();

        expect(field.type).toBe("format");
        expect(field.value.argRules).toBeDefined();
        expect(field.value.morphRules).toBeDefined();
        expect(iter.next().done).toBeTruthy();
    });

    test("errors when delimiter is forgotten", () => {
        expect(() => parse("{1s}").next()).toThrow();
    });

    describe("Argrules", () => {
        test("parses index", () => {
            const iter = parse("{1}"),
                { index } = iter.next().value.value.argRules;

            expect(index).toBe(1);
        });

        test("parses index as undefined when unspecified", () => {
            const iter = parse("{.a.b|}"),
                { index } = iter.next().value.value.argRules;

            expect(index).toBeUndefined();
        });

        test("parses props", () => {
            const iter = parse("{.a[b][c].d}"),
                { props } = iter.next().value.value.argRules;

            expect(props).toHaveLength(4);
            expect(props[0]).toBe("a");
            expect(props[1]).toBe("b");
            expect(props[2]).toBe("c");
            expect(props[3]).toBe("d");
        });

        test("errors parsing props when nothing is inside brackets", () => {
            expect(() =>{
                parse("{[]}").next();
            }).toThrow();
        });

        test("errors parsing props when not a string follows a dot", () => {
            expect(() =>{
                parse("{.}").next();
            }).toThrow();
        });

        test("errors parsing props when bracket is not properly closed", () => {
            expect(() =>{
                parse("{[|}").next();
            }).toThrow();
        });
    });

    describe("morphRules", () => {
        test("parses padding", () => {
            const iter = parse("{|5}"),
                { padding } = iter.next().value.value.morphRules;

            expect(padding).toBe(5);
        });

        test("parses padfill when align rule appears", () => {
            const iter = parse("{|*>}"),
                { padfill } = iter.next().value.value.morphRules;

            expect(padfill).toBe("*");
        });

        test("errors in parsing padfill when align rule is none", () => {
            // Character * is not a modifier or an argument rule
            // so the only purpose of it here is to be `padfill`
            expect(() => { parse("{|*}").next(); }).toThrow();
        });

        test("parses precision", () => {
            const iter = parse("{|.3}"),
                { precision } = iter.next().value.value.morphRules;

            expect(precision).toBe(3);
        });

        test.each([">", "^", "<"])("parses align rule '%s'", (alignRule) => {
            const iter = parse(`{|${alignRule}}`),
                { align } = iter.next().value.value.morphRules;

            expect(align).toBe(alignRule);
        });

        test.each(["+", "-", " "])("parses sign rule", (signRule) => {
            const iter = parse(`{|${signRule}}`),
                { sign } = iter.next().value.value.morphRules;

            expect(sign).toBe(signRule);
        });

        test("parses morphism", () => {
            const iter = parse("{|f}"),
                { morphism } = iter.next().value.value.morphRules;

            expect(morphism).toBe("f");
        });

        test("errors parsing precision when not a number follows dot", () => {
            expect(() =>{
                parse("{|.f}").next();
            }).toThrow();
        });
    });

    test("errors parsing format field when brace not properly closed", () => {
        expect(() =>{
            parse("{2.foo|f").next();
        }).toThrow();
    });
});
