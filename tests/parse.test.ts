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
});
