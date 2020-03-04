import Parser from "../src/parse";

test("parses and returns a field", () => {
    const iter = new Parser("Hello World!").parse().next();
    expect(iter.done).toBeFalsy();
    expect(iter.value).toMatchObject({
        type: expect.any(String),
        value: expect.anything()
    });
});
