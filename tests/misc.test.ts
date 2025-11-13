import { expect } from "chai";
import { measureAsync } from "../src/misc";

describe("measureAsync", function () {
    it("should execute async function and return result", async function () {
        const result = await measureAsync("test-operation", async () => {
            return "success";
        });

        expect(result).to.equal("success");
    });

    it("should measure execution time for successful operation", async function () {
        const delay = 50;
        await measureAsync("delayed-operation", async () => {
            await new Promise((resolve) => setTimeout(resolve, delay));
            return "done";
        });

        // Test passes if no errors thrown
    });

    it("should handle rejected promises", async function () {
        const error = new Error("Test error");

        try {
            await measureAsync("failing-operation", async () => {
                throw error;
            });
            expect.fail("Should have thrown an error");
        } catch (err) {
            expect(err).to.equal(error);
        }
    });

    it("should return complex objects", async function () {
        const complexObject = { id: 1, data: [1, 2, 3], nested: { value: "test" } };

        const result = await measureAsync("complex-operation", async () => {
            return complexObject;
        });

        expect(result).to.deep.equal(complexObject);
    });

    it("should handle async operations with delays", async function () {
        this.timeout(5000);

        const result = await measureAsync("async-delay", async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return 42;
        });

        expect(result).to.equal(42);
    });

    it("should propagate errors with correct error object", async function () {
        const customError = new Error("Custom error message");

        try {
            await measureAsync("error-operation", async () => {
                throw customError;
            });
            expect.fail("Should have thrown");
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
            expect((err as Error).message).to.equal("Custom error message");
        }
    });

    it("should handle functions returning undefined", async function () {
        const result = await measureAsync("undefined-operation", async () => {
            return undefined;
        });

        expect(result).to.be.undefined;
    });

    it("should handle functions returning null", async function () {
        const result = await measureAsync("null-operation", async () => {
            return null;
        });

        expect(result).to.be.null;
    });
});
