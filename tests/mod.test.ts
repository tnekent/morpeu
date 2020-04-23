import Parser from "../src/parse";
import Evaluator from "../src/eval";

function parseThenEval(input: string, arglist: any[]): string {
    return new Evaluator(new Parser(input).parse(), arglist).eval();
}

describe("Align", () => {
    test("add spaces to left when align is >", () => {
        expect(parseThenEval("{|>3i}", [123])).toBe("   123");
    });

    test("add spaces to right when align is <", () => {
        expect(parseThenEval("{|<3s}", ["Zap"])).toBe("Zap   ");
    });

    test("add spaces both sides when align is ^", () => {
        expect(parseThenEval("{|^3f}", [1.25])).toBe("  1.250000 ");
    });

    test("add equal spaces both sides when align is ^", () => {
        expect(parseThenEval("{|=3b}", [30])).toBe("   11110   ");
    });

    test("treat align as < when no align specified", () => {
        expect(parseThenEval("{|3s}", ["yep"])).toBe("yep   ");
    });
});

describe("Precision", () => {
    test("truncates on string type modifiers", () => {
        expect(parseThenEval("{|.2s}", ["Looooong"])).toBe("Lo");
    });

    test("errors on integer type modifiers", () => {
        expect(() => parseThenEval("{|.3i}", [145])).toThrow();
    });

    describe("Float type modifiers", () => {
        test("truncates and rounds down", () => {
            expect(parseThenEval("{|.3f}", [1.025287])).toBe("1.025");
        });

        test("truncates and rounds down", () => {
            expect(parseThenEval("{|.3f}", [1.025287])).toBe("1.025");
        });
    });
});

describe("Sign", () => {
    test("errors on string type modifier", () => {
        expect(() => parseThenEval("{|+s}", ["Hello"])).toThrow();
    });

    test("prepend plus on positive or minus on negative when sign is +", () => {
        expect(parseThenEval("{|+i}", [456])).toBe("+456");
        expect(parseThenEval("{|+f}", [-2.786])).toMatch("-2.786");
    });

    test("prepend nothing on positive or minus sign on negative when sign is -", () => {
        expect(parseThenEval("{|-i}", [456])).toBe("456");
        expect(parseThenEval("{|-f}", [-2.786])).toMatch("-2.786");
    });

    test("prepend space on positive or minus sign on negative when sign is <space>", () => {
        expect(parseThenEval("{| i}", [456])).toBe(" 456");
        expect(parseThenEval("{| f}", [-2.786])).toMatch("-2.786");
    });

    test("0 is the same regardless of sign", () => {
        expect(parseThenEval("{|+i}", [0])).toBe("0");
        expect(parseThenEval("{|-i}", [0])).toBe("0");
        expect(parseThenEval("{| i}", [0])).toBe("0");
    });
});

describe("Mod s", () => {
    test("morphs string", () => {
        expect(parseThenEval("{|s}", ["Hello"])).toBe("Hello");
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

describe("Integer type modifiers", () => {
    test("errors on non-integer arguments", () => {
        expect(() => {
            parseThenEval("{|i}", ["int"]);
            parseThenEval("{|b}", [3.5]);
            parseThenEval("{|x}", [null]);
            parseThenEval("{|o}", [String]);
        });
    });

    describe("Mod i", () => {
        test("morphs integer", () => {
            expect(parseThenEval("{|i}", [20])).toBe("20");
        });

    });

    describe("Mod b", () => {
        test("morphs integer to binary", () => {
            expect(parseThenEval("{|b}", [255])).toBe("11111111");
        });
    });

    describe("Mod x", () => {
        test("morphs integer to hexadecimal", () => {
            expect(parseThenEval("{|x}", [939])).toBe("3ab");
        });
    });

    describe("Mod X", () => {
        test("morphs integer to hexadecimal", () => {
            expect(parseThenEval("{|X}", [939])).toBe("3AB");
        });
    });

    describe("Mod o", () => {
        test("morphs integer to octal", () => {
            expect(parseThenEval("{|o}", [1024])).toBe("2000");
        });
    });

    describe("Mod c", () => {
        test("evaluates to characters", () => {
            expect(parseThenEval("{|c}", [65])).toBe("A");
        });
    });
});

describe("Float type modifiers", () => {
    test("errors on non-float arguments", () => {
        expect(() => {
            parseThenEval("{|f}", ["float"]);
            parseThenEval("{|%}", [undefined]);
            parseThenEval("{|g}", [Number]);
        });
    });
    describe("Mod f", () => {
        test("expands float to 6th precision when unspecified", () => {
            expect(parseThenEval("{|f}", [2.7])).toBe("2.700000");
        });

        test("accepts integers", () => {
            expect(parseThenEval("{|f}", [1000])).toBeDefined();
        });

    });

    describe("Mod g", () => {
        test("expands float to scientific notation when exponent of num < -4", () => {
            expect(parseThenEval("{|g}", [0.000001])).toBe("1e-6");
        });

        test("expands float to fixed-notation when exponent of num = -4", () => {
            expect(parseThenEval("{|g}", [0.0001])).toBe("0.0001");
        });

        test("expands float to fixed-notation when exponent of num > -4 and num < precision", () => {
            expect(parseThenEval("{|.6g}", [1.23456])).toBe("1.23456");
            expect(parseThenEval("{|.6g}", [12.3456])).toBe("12.3456");
            expect(parseThenEval("{|.6g}", [123.456])).toBe("123.456");
            expect(parseThenEval("{|.6g}", [1234.56])).toBe("1234.56");
        });

        test("expands float to fixed-notation when exponent of num < precision", () => {
            expect(parseThenEval("{|.6g}", [100000])).toBe("100000");
        });

        test("expands float to scientific notation when exponent of num = precision", () => {
            expect(parseThenEval("{|.6g}", [1000000])).toBe("1e+6");
        });

        test("expands float to scientific notation when exponent of num > precision", () => {
            expect(parseThenEval("{|.6g}", [100000000])).toBe("1e+8");
        });
    });

    describe("Mod e", () => {
        test("expands float to positive exponential form", () => {
            expect(parseThenEval("{|e}", [123456789]))
                .toBe("1.234568e+8");
        });

        test("expands float to negative exponential form", () => {
            expect(parseThenEval("{|e}", [0.12345678]))
                .toBe("1.234568e-1");
        });

        test("applies precision in exponential form", () => {
            expect(parseThenEval("{|.3e}", [1000000]))
                .toBe("1.000e+6");
        });
    });

    describe("Mod E", () => {
        test("expands float to positive exponential form with E", () => {
            expect(parseThenEval("{|E}", [123456789]))
                .toBe("1.234568E+8");
        });

        test("expands float to negative exponential form with E", () => {
            expect(parseThenEval("{|E}", [0.12345678]))
                .toBe("1.234568E-1");
        });

        test("applies precision in exponential form with E", () => {
            expect(parseThenEval("{|.3E}", [1000000]))
                .toBe("1.000E+6");
        });
    });

    describe("Mod %", () => {
        test("morphs float to percentage", () => {
            expect(parseThenEval("{|%}", [0.05])).toBe("5.000000%");
        });

        test("applies precision", () => {
            expect(parseThenEval("{|.2%}", [1.05])).toBe("105.00%");
        });
    });
});

test("evaluates arg according to type when mod is unspecified", () => {
    // Defaults to mod s
    expect(parseThenEval("{}", ["string"])).toBe("string");
    // Defaults to mod i
    expect(parseThenEval("{}", [5])).toBe("5");
    // Defaults to mod g
    expect(parseThenEval("{}", [2000000.20])).toBe("2e+6");
    // Defaults to mod j
    expect(parseThenEval("{}", [null])).toBe("null");
});
