import Parser from "../src/parse";

test("parses and returns a field", () => {
    const iter = new Parser("Hello World!").parse().next();
    expect(iter.done).toBeFalsy();
    expect(iter.value).toMatchObject({
        type: expect.any(String),
        value: expect.anything()
    });
});

describe("Const field", () => {
    test("parses const field of non-brace characters", () => {
        const iter = new Parser("FooBar").parse(),
            { value: field } = iter.next();

        expect(field).toMatchObject({
            type: "const",
            value: "FooBar"
        });
        expect(iter.next().done).toBeTruthy();
    });

    test("parses const field of literal braces", () => {
        const iter = new Parser("}}{{").parse();
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
        const iter = new Parser("{}").parse(),
            { value: field } = iter.next();

        expect(field.type).toBe("format");
        expect(field.value.argrules).toBeDefined();
        expect(field.value.modrules).toBeDefined();
        expect(iter.next().done).toBeTruthy();
    });

    test("parses format field with only delimiter", () => {
        const iter = new Parser("{|}").parse(),
            { value: field } = iter.next();

        expect(field.type).toBe("format");
        expect(field.value.argrules).toBeDefined();
        expect(field.value.modrules).toBeDefined();
        expect(iter.next().done).toBeTruthy();
    });

    describe("Argrules", () => {
        test("parses index", () => {
            const iter = new Parser("{1}").parse(),
                { index } = iter.next().value.value.argrules;

            expect(index).toBe(1);
        });

        test("parses index even when unspecified", () => {
            const iter = new Parser("{.a.b|}").parse(),
                { index } = iter.next().value.value.argrules;

            expect(index).toBeUndefined();
        });

        test("parses props", () => {
            const iter = new Parser("{.a[b][c].d}").parse(),
                { props } = iter.next().value.value.argrules;

            expect(props).toHaveLength(4);
            expect(props[0]).toBe("a");
            expect(props[1]).toBe("b");
            expect(props[2]).toBe("c");
            expect(props[3]).toBe("d");
        });

        test("errors parsing props when nothing is inside brackets", () => {
            expect(() =>{
                new Parser("{[]}").parse().next();
            }).toThrow();
        });

        test("errors parsing props when not a string follows a dot", () => {
            expect(() =>{
                new Parser("{.}").parse().next();
            }).toThrow();
        });

        test("errors parsing props when bracket is not properly closed", () => {
            expect(() =>{
                new Parser("{[|}").parse().next();
            }).toThrow();
        });
    });

    describe("Modrules", () => {
        test("parses padding", () => {
            const iter = new Parser("{|5}").parse(),
                { padding } = iter.next().value.value.modrules;

            expect(padding).toBe(5);
        });

        test("parses precision", () => {
            const iter = new Parser("{|.3}").parse(),
                { precision } = iter.next().value.value.modrules;

            expect(precision).toBe(3);
        });

        test("parses mod", () => {
            const iter = new Parser("{|f}").parse(),
                { mod } = iter.next().value.value.modrules;

            expect(mod).toBe("f");
        });
        test("errors parsing precision when not a number follows dot", () => {
            expect(() =>{
                new Parser("{|.f}").parse().next();
            }).toThrow();
        });
    });

    test("errors parsing format field when brace not properly closed", () => {
        expect(() =>{
            new Parser("{2.foo|f").parse().next();
        }).toThrow();
    });
});

test("parses multiple fields", () => {
    const iter = new Parser("A {.foo|s} is {0|2.0}").parse(),
        f1 = iter.next().value;

    expect(f1).toMatchObject({
        type: "const",
        value: "A "
    });

    const f2 = iter.next().value;
    expect(f2.type).toBe("format");
    expect(f2.value).toMatchObject({
        argrules: {
            index: undefined,
            props: ["foo"]
        },
        modrules: {
            padding: undefined,
            precision: undefined,
            mod: "s"
        }
    });

    const f3 = iter.next().value;
    expect(f3).toMatchObject({
        type: "const",
        value: " is "
    });

    const f4 = iter.next().value;
    expect(f4.type).toBe("format");
    expect(f4.value).toMatchObject({
        argrules: {
            index: 0,
            props: []
        },
        modrules: {
            padding: 2,
            precision: 0,
            mod: undefined
        }
    });
    expect(iter.next().done).toBeTruthy();
});
