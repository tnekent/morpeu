import morph = require("../src/index");

describe("Mod s", () => {
    test("evaluates string", () => {
        const result = morph("{|s}", "Hello");
        expect(result).toBe("Hello");
    });

    test("evaluates padding", () => {
        const result = morph("{|5s}", "Padded");
        expect(result).toBe("     Padded");
    });

    test("applies precision", () => {
        const result = morph("{|.4s}", "Stoppppp");
        expect(result).toBe("Stop");
    });

    test("errors on non-string arguments", () => {
        expect(() => {
            morph("{|s}", 5);
            morph("{|s}", 1.2);
            morph("{|s}", null);
            morph("{|s}", Math);
        });
    });
});

describe("Mod i", () => {
    test("evaluates integers", () => {
        const result = morph("{|i}", 20);
        expect(result).toBe("20");
    });

    test("evaluates padding", () => {
        const result = morph("{|4i}", 4);
        expect(result).toBe("    4");
    });

    test("errors on specified precision", () => {
        expect(() => morph("{|.1i}", 123456)).toThrow();
    });

    test("errors on non-integer arguments", () => {
        expect(() => {
            morph("{|i}", "int");
            morph("{|i}", 3.5);
            morph("{|i}", null);
            morph("{|i}", String);
        });
    });
});

describe("Mod f", () => {
    test("evaluates floats with default precision 6", () => {
        const result = morph("{|f}", 2.7);
        expect(result).toBe("2.700000");
    });

    test("evaluates padding", () => {
        const result = morph("{|3f}", 3.765);
        expect(result).toBe("   3.765000");
    });

    test("applies precision", () => {
        const result = morph("{|.2f}", 3.14159);
        expect(result).toBe("3.14");
    });

    test("automatically rounds off by precision", () => {
        const result = morph("{|.3f}", 3.1239);
        expect(result).toBe("3.124");
    });

    test("errors on non-integer arguments", () => {
        expect(() => {
            morph("{|f}", "float");
            morph("{|f}", 0);
            morph("{|f}", undefined);
            morph("{|f}", Number);
        });
    });
});

describe("Mod j", () => {
    test("evaluates padding", () => {
        const obj = { yes: "no" },
            result = morph("{|1j}", obj);

        expect(result).toBe(` ${JSON.stringify(obj)}`);
    });

    test("evaluates an object", () => {
        const obj = { user: "Foo" },
            result = morph("{|j}", obj);

        expect(result).toBe(JSON.stringify(obj));
    });

    test("evaluates an array", () => {
        const arr = [1, "2", { i: 3 }],
            result = morph("{|j}", arr);

        expect(result).toBe(JSON.stringify(arr));
    });

    test("evaluates primitive values", () => {
        let result = morph("{|j}", true);
        expect(result).toBe(JSON.stringify(true));
        result = morph("{|j}", "bar");
        expect(result).toBe(JSON.stringify("bar"));
        result = morph("{|j}", 3.05);
        expect(result).toBe(JSON.stringify(3.05));
        result = morph("{|j}", 2000);
        expect(result).toBe(JSON.stringify(2000));
    });

    test("errors on specified precision", () => {
        expect(() => morph("{|.2j}", { should: "error" })).toThrow();
    });
});
