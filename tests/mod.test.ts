import Parser from "../src/parse";
import Evaluator from "../src/eval";

function getMorphed(input: string, arglist: any[]): string {
    return new Evaluator(new Parser(input).parse(), arglist).eval();
}

describe("Align", () => {
    test("add spaces to left when align is >", () => {
        expect(getMorphed("{|>3i}", [123])).toBe("   123");
    });

    test("add spaces to right when align is <", () => {
        expect(getMorphed("{|<3s}", ["Zap"])).toBe("Zap   ");
    });

    test("add spaces both sides when align is ^", () => {
        expect(getMorphed("{|^3f}", [1.25])).toBe("  1.250000 ");
    });

    test("treat align as < when no align specified", () => {
        expect(getMorphed("{|3s}", ["yep"])).toBe("yep   ");
    });
});

describe("Padfill", () => {
    test("put the right number of padfill for >", () => {
        expect(getMorphed("{|->5}", ["right"])).toBe("-----right");
    });

    test("put the right number of padfill for <", () => {
        expect(getMorphed("{|-<5}", ["left"])).toBe("left-----");
    });

    test("put the right number of padfill for ^", () => {
        expect(getMorphed("{|-^5}", ["middle"])).toBe("---middle--");
    });
});

describe("Precision", () => {
    test("truncates on string type modifiers", () => {
        expect(getMorphed("{|.2s}", ["Looooong"])).toBe("Lo");
    });

    test("errors on integer type modifiers", () => {
        expect(() => getMorphed("{|.3i}", [145])).toThrow();
    });

    describe("Float type modifiers", () => {
        test("truncates and rounds down", () => {
            expect(getMorphed("{|.3f}", [1.025287])).toBe("1.025");
        });

        test("truncates and rounds down", () => {
            expect(getMorphed("{|.3f}", [1.025287])).toBe("1.025");
        });
    });
});

describe("Sign", () => {
    test("errors on string type modifier", () => {
        expect(() => getMorphed("{|+s}", ["Hello"])).toThrow();
    });

    test("prepend plus on positive or minus on negative when sign is +", () => {
        expect(getMorphed("{|+i}", [456])).toBe("+456");
        expect(getMorphed("{|+f}", [-2.786])).toMatch("-2.786");
    });

    test("prepend nothing on positive or minus sign on negative when sign is -", () => {
        expect(getMorphed("{|-i}", [456])).toBe("456");
        expect(getMorphed("{|-f}", [-2.786])).toMatch("-2.786");
    });

    test("prepend space on positive or minus sign on negative when sign is <space>", () => {
        expect(getMorphed("{| i}", [456])).toBe(" 456");
        expect(getMorphed("{| f}", [-2.786])).toMatch("-2.786");
    });

    test("0 is the same regardless of sign", () => {
        expect(getMorphed("{|+i}", [0])).toBe("0");
        expect(getMorphed("{|-i}", [0])).toBe("0");
        expect(getMorphed("{| i}", [0])).toBe("0");
    });
});

describe("Mod s", () => {
    test("morphs string", () => {
        expect(getMorphed("{|s}", ["Hello"])).toBe("Hello");
    });

    test("accepts null and undefined", () => {
        expect(getMorphed("{|s}", [null])).toBe("null");
        expect(getMorphed("{|s}", [undefined])).toBe("undefined");
    });

    test("accepts objects with toString method", () => {
        const stringableObj = {
            toString: () => "yap"
        };

        expect(getMorphed("{|s}", [stringableObj])).toBe("yap");
        expect(getMorphed("{|s}", [{}])).toBe("[object Object]");
    });

    test("errors on objects with no toString method", () => {
        const nullObj = Object.create(null);
        expect(() => {
            getMorphed("{|s}", [nullObj]);
        }).toThrow();

        const normalObj = {};
        normalObj.toString = undefined;
        expect(() => {
            getMorphed("{|s}", [normalObj]);
        }).toThrow();
    });
});

describe("Integer type modifiers", () => {
    test("errors on non-integer arguments", () => {
        expect(() => {
            getMorphed("{|i}", ["int"]);
            getMorphed("{|b}", [3.5]);
            getMorphed("{|x}", [null]);
            getMorphed("{|o}", [String]);
        }).toThrow();
    });

    describe("Mod i", () => {
        test("morphs integer", () => {
            expect(getMorphed("{|i}", [20])).toBe("20");
        });
    });

    describe("Mod b", () => {
        test("morphs integer to binary", () => {
            expect(getMorphed("{|b}", [255])).toBe("11111111");
        });
    });

    describe("Mod x", () => {
        test("morphs integer to hexadecimal", () => {
            expect(getMorphed("{|x}", [939])).toBe("3ab");
        });
    });

    describe("Mod X", () => {
        test("morphs integer to hexadecimal", () => {
            expect(getMorphed("{|X}", [939])).toBe("3AB");
        });
    });

    describe("Mod o", () => {
        test("morphs integer to octal", () => {
            expect(getMorphed("{|o}", [1024])).toBe("2000");
        });
    });

    describe("Mod c", () => {
        test("evaluates to characters", () => {
            expect(getMorphed("{|c}", [65])).toBe("A");
        });
    });
});

describe("Float type modifiers", () => {
    test("errors on non-float arguments", () => {
        expect(() => {
            getMorphed("{|f}", ["float"]);
            getMorphed("{|%}", [undefined]);
            getMorphed("{|g}", [Number]);
        }).toThrow();
    });
    describe("Mod f", () => {
        test("expands float to 6th precision when unspecified", () => {
            expect(getMorphed("{|f}", [2.7])).toBe("2.700000");
        });

        test("accepts integers", () => {
            expect(getMorphed("{|f}", [1000])).toBeDefined();
        });

    });

    describe("Mod g", () => {
        test("expands float to scientific notation when exponent of num < -4", () => {
            expect(getMorphed("{|g}", [0.000001])).toBe("1e-6");
        });

        test("expands float to fixed-notation when exponent of num = -4", () => {
            expect(getMorphed("{|g}", [0.0001])).toBe("0.0001");
        });

        test("expands float to fixed-notation when exponent of num > -4 and num < precision", () => {
            expect(getMorphed("{|.6g}", [1.23456])).toBe("1.23456");
            expect(getMorphed("{|.6g}", [12.3456])).toBe("12.3456");
            expect(getMorphed("{|.6g}", [123.456])).toBe("123.456");
            expect(getMorphed("{|.6g}", [1234.56])).toBe("1234.56");
        });

        test("expands float to fixed-notation when exponent of num < precision", () => {
            expect(getMorphed("{|.6g}", [100000])).toBe("100000");
        });

        test("expands float to scientific notation when exponent of num = precision", () => {
            expect(getMorphed("{|.6g}", [1000000])).toBe("1e+6");
        });

        test("expands float to scientific notation when exponent of num > precision", () => {
            expect(getMorphed("{|.6g}", [100000000])).toBe("1e+8");
        });
    });

    describe("Mod e", () => {
        test("expands float to positive exponential form", () => {
            expect(getMorphed("{|e}", [123456789]))
                .toBe("1.234568e+8");
        });

        test("expands float to negative exponential form", () => {
            expect(getMorphed("{|e}", [0.12345678]))
                .toBe("1.234568e-1");
        });

        test("applies precision in exponential form", () => {
            expect(getMorphed("{|.3e}", [1000000]))
                .toBe("1.000e+6");
        });
    });

    describe("Mod E", () => {
        test("expands float to positive exponential form with E", () => {
            expect(getMorphed("{|E}", [123456789]))
                .toBe("1.234568E+8");
        });

        test("expands float to negative exponential form with E", () => {
            expect(getMorphed("{|E}", [0.12345678]))
                .toBe("1.234568E-1");
        });

        test("applies precision in exponential form with E", () => {
            expect(getMorphed("{|.3E}", [1000000]))
                .toBe("1.000E+6");
        });
    });

    describe("Mod %", () => {
        test("morphs float to percentage", () => {
            expect(getMorphed("{|%}", [0.05])).toBe("5.000000%");
        });

        test("applies precision", () => {
            expect(getMorphed("{|.2%}", [1.05])).toBe("105.00%");
        });
    });
});

test("evaluates arg according to type when mod is unspecified", () => {
    // Defaults to mod s
    expect(getMorphed("{}", ["string"])).toBe("string");
    // Defaults to mod i
    expect(getMorphed("{}", [5])).toBe("5");
    // Defaults to mod g
    expect(getMorphed("{}", [2000000.20])).toBe("2e+6");
    // Defaults to mod j
    expect(getMorphed("{}", [null])).toBe("null");
});

test("errors when an unimplemented morphism is specified", () => {
    expect(() => getMorphed("{|z}", ["hi"])).toThrow();
});

test("errors when an arguemnt type can't be detected", () => {
    // The only time I could see this could happen is if the object
    // has null as its prototype.
    const arg = Object.create(null);
    expect(() => getMorphed("{}", [arg])).toThrow();
});
