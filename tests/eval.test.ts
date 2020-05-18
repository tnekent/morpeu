import Parser from "../src/parse";
import Evaluator from "../src/eval";

function getMorphed(input: string, arglist: any[]): string {
    return new Evaluator(new Parser(input).parse(), arglist).eval();
}

test("strings with no format block stay as-is", () => {
    expect(getMorphed("Purely const", []))
        .toBe("Purely const");
});

test("evaluates format field only strings", () => {
    expect(getMorphed("{.input}", [{ input: "Hi" }]))
        .toBe("Hi");
});

test("evaluates empty format field", () => {
    expect(getMorphed("{}", ["empty"]))
        .toBe("empty");
});

test("evaluates format field with delimiter only", () => {
    expect(getMorphed("{|}", ["empty"]))
        .toBe("empty");
});

test("format blocks get evaluated with const string", () => {
    expect(getMorphed("Planet {.planet.name}", [{ planet: { name: "Earth" } }]))
        .toBe("Planet Earth");
});

describe("Argrules", () => {
    test("automatically increments index when unspecified", () => {
        expect(getMorphed("{}{}{}{}", [1,2,3,4]))
            .toBe("1234");
    });

    test("errors when unspecifying index after specifying in previous format field", () => {
        expect(() => getMorphed("{}{2}{}", [1,3,2]))
            .toThrow();
    });

    test("manual indexing gets the right values", () => {
        expect(getMorphed("{2}{1}{3}{0}", [4,2,1,3]))
            .toBe("1234");
    });

    test("indexing can be omitted when specifiying props", () => {
        expect(getMorphed("{.a}", [{ a: "A" }]))
            .toBe("A");
    });

    test("bracket and dot props can be mixed", () => {
        expect(getMorphed("{.a[b].c}", [{ a: { b: { c: "A" } } }]))
            .toBe("A");
    });

    test("bracket props indexes in arrays", () => {
        expect(getMorphed("{[1]}", [[0, 1]]))
            .toBe("1");
        expect(getMorphed("{.arr[2]}", [{ arr: [0, 1, 2] }]))
            .toBe("2");
    });

    test("bracket props accept non-alphanumeric chars", () => {
        expect(getMorphed("{[-name-]}", [{ "-name-": "foo" }]))
            .toBe("foo");
    });

    test("dot props can be substituted with bracket props on properties with valid identifier names", () => {
        const list = [{ prop: "abc" }],
            dotprop = getMorphed("{.prop}", list),
            bracketprop = getMorphed("{[prop]}", list);

        expect(dotprop).toEqual(bracketprop); // Both should be "abc"
    });

    test("error when specified index is out of bounds from arglist", () => {
        expect(() => { getMorphed("3: {3}", ["1", "2"]); }).toThrow();
    });

    test("error when specifying a non existing property", () => {
        expect(() => { getMorphed("{.age}", [{ name: "Zoom" }]); }).toThrow();
    });
});

// Morphism rules tested in "./morphism.test.ts".
