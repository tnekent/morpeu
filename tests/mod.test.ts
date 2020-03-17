import Parser from "../src/parse";
import Evaluator from "../src/eval";

function parseThenEval(input: string, arglist: any[]): string {
    return new Evaluator(new Parser(input).parse(), arglist).eval();
}

describe("Mod s", () => {
    test("evaluates string", () => {
        expect(parseThenEval("{|s}", ["Hello"])).toBe("Hello");
    });

    test("evaluates padding", () => {
        expect(parseThenEval("{|5s}", ["Padded"])).toBe("Padded     ");
    });

    test("evaluates padding with align as >", () => {
        expect(parseThenEval("{|>5s}", ["Padded"])).toBe("     Padded");
    });

    test("applies precision", () => {
        expect(parseThenEval("{|.4s}", ["Stoppppp"])).toBe("Stop");
    });

    test("errors on non-string arguments", () => {
        expect(() => {
            parseThenEval("{|s}", [5]);
            parseThenEval("{|s}", [1.2]);
            parseThenEval("{|s}", [null]);
            parseThenEval("{|s}", [Math]);
        });
    });
});

describe("Mod i", () => {
    test("evaluates integers", () => {
        expect(parseThenEval("{|i}", [20])).toBe("20");
    });

    test("evaluates padding", () => {
        expect(parseThenEval("{|4i}", [4])).toBe("    4");
    });

    test("evaluates padding with align as ^", () => {
        expect(parseThenEval("{|^4i}", [4])).toBe("  4  ");
    });

    test("errors on specified precision", () => {
        expect(() => parseThenEval("{|.1i}", [123456])).toThrow();
    });

    test("errors on non-integer arguments", () => {
        expect(() => {
            parseThenEval("{|i}", ["int"]);
            parseThenEval("{|i}", [3.5]);
            parseThenEval("{|i}", [null]);
            parseThenEval("{|i}", [String]);
        });
    });
});

describe("Mod b", () => {
    test("evaluates integer to binary", () => {
        expect(parseThenEval("{|b}", [255])).toBe("11111111");
    });
});

describe("Mod x", () => {
    test("evaluates integer to hexadecimal", () => {
        expect(parseThenEval("{|x}", [939])).toBe("3ab");
    });
});

describe("Mod X", () => {
    test("evaluates integer to hexadecimal", () => {
        expect(parseThenEval("{|X}", [939])).toBe("3AB");
    });
});

describe("Mod o", () => {
    test("evaluates integer to octal", () => {
        expect(parseThenEval("{|o}", [1024])).toBe("2000");
    });
});

describe("Mod f", () => {
    test("evaluates floats with default precision 6", () => {
        expect(parseThenEval("{|f}", [2.7])).toBe("2.700000");
    });

    test("evaluates padding", () => {
        expect(parseThenEval("{|3f}", [3.765])).toBe("   3.765000");
    });

    test("evaluates padding with align as <", () => {
        expect(parseThenEval("{|<2f}", [3.765])).toBe("3.765000  ");
    });

    test("applies precision", () => {
        expect(parseThenEval("{|.2f}", [3.14159])).toBe("3.14");
    });

    test("automatically rounds off by precision", () => {
        expect(parseThenEval("{|.3f}", [3.1239])).toBe("3.124");
    });

    test("accepts integers", () => {
        expect(parseThenEval("{|f}", [1000])).toBeDefined();
    });

    test("errors on non-float arguments", () => {
        expect(() => {
            parseThenEval("{|f}", ["float"]);
            parseThenEval("{|f}", [undefined]);
            parseThenEval("{|f}", [Number]);
        });
    });
});

describe("Mod e", () => {
    test("evaluates positive exponents", () => {
        expect(parseThenEval("{|e}", [123456789]))
            .toBe("1.234568e+8");
    });

    test("evaluates negative exponents", () => {
        expect(parseThenEval("{|e}", [0.12345678]))
            .toBe("1.234568e-7");
    });

    test("applies precision", () => {
        expect(parseThenEval("{|.3e}", [1000000]))
            .toBe("1.000e+6");
    });
});

describe("Mod j", () => {
    test("evaluates padding", () => {
        const obj = { yes: "no" };

        expect(parseThenEval("{|1j}", [obj])).toBe(`${JSON.stringify(obj)} `);
    });

    test("evaluates padding with extra spaces on left when align is ^ and padding amount is odd", () => {
        const obj = { yes: "no" };

        expect(parseThenEval("{|^3j}", [obj])).toBe(`  ${JSON.stringify(obj)} `);
    });

    test("evaluates an object", () => {
        const obj = { user: "Foo" };

        expect(parseThenEval("{|j}", [obj])).toBe(JSON.stringify(obj));
    });

    test("evaluates an array", () => {
        const arr = [1, "2", { i: 3 }];

        expect(parseThenEval("{|j}", [arr])).toBe(JSON.stringify(arr));
    });

    test("evaluates primitive values", () => {
        expect(parseThenEval("{|j}", [true])).toBe(JSON.stringify(true));
        expect(parseThenEval("{|j}", ["bar"])).toBe(JSON.stringify("bar"));
        expect(parseThenEval("{|j}", [3.05])).toBe(JSON.stringify(3.05));
        expect(parseThenEval("{|j}", [2000])).toBe(JSON.stringify(2000));
    });

    test("errors on specified precision", () => {
        expect(() => parseThenEval("{|.2j}", [{ should: "error" }])).toThrow();
    });
});

test("evaluates arg according to type when mod is unspecified", () => {
    // Defaults to mod s
    expect(parseThenEval("{}", ["string"])).toBe("string");
    // Defaults to mod i
    expect(parseThenEval("{}", [5])).toBe("5");
    // Defaults to mod s
    expect(parseThenEval("{}", [2.2])).toBe("2.200000");
    // Defaults to mod j
    expect(parseThenEval("{}", [null])).toBe("null");
});
