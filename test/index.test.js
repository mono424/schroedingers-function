import SchroedingersFunction from "../src";
import utils from "../src/utils";

const testArgs = [1, [1, 2, 3], { a: 1, b: 2, c: { z: 3 } }];

const stack = `
   Error:
        at CustomConsole.console.(anonymous function).args [as log] (C:\\dev\\schroedingers-function\\src\\schroedingers-function.js:33:24)
        at log (C:\\dev\\schroedingers-function\\test\\index.test.js:11:11)
        at Object.asyncJestTest (C:\\dev\\schroedingers-function\\node_modules\\jest-jasmine2\\build\\jasmineAsyncInstall.js:102:37)
        at resolve (C:\\dev\\schroedingers-function\\node_modules\\jest-jasmine2\\build\\queueRunner.js:43:12)
        at new Promise (<anonymous>)
`;

const parsedFunctionNames = ["log", "asyncJestTest", "resolve", "new Promise"];

const syncFunctionWithoutLog = returnValue => () => returnValue;
const syncFunctionWithoutLogAsnyc = returnValue => () =>
  new Promise(resolve => setTimeout(() => resolve(returnValue), 50));
const syncFunction = returnValue => () => {
  console.log("- test -");
  return returnValue;
};

beforeAll(() => {
  console.log = () => {};
  SchroedingersFunction.init();
});

beforeEach(() => {
  SchroedingersFunction.unlock();
});

describe("utils", () => {
  test("getFunctionNames should return function names", () => {
    expect(utils.parseFunctionsNames(stack)).toEqual(parsedFunctionNames);
  });
});

describe("schroedingersFunction should execute if somebody watches", () => {
  test("should return values sync", () => {
    const res = SchroedingersFunction.wrap(syncFunction("test"))();
    expect(res).toBe("test");
  });
  test("should pass input params", () => {
    const fw = { fn: syncFunction(null) };
    jest.spyOn(fw, "fn");
    SchroedingersFunction.wrap(fw.fn)(...testArgs);
    expect(fw.fn).toBeCalledWith(...testArgs);
  });
});

describe("schroedingersFunction should return undefined and only run once if nobody watches", () => {
  test("should not execute sync", () => {
    const fw = { fn: syncFunctionWithoutLog("test") };
    jest.spyOn(fw, "fn");
    const res = SchroedingersFunction.wrap(fw.fn)();
    SchroedingersFunction.wrap(fw.fn)();
    expect(res).toBe(undefined);
    expect(fw.fn).toBeCalledTimes(1);
  });
  test("should not execute async", async () => {
    const fw = { fn: syncFunctionWithoutLogAsnyc("test") };
    jest.spyOn(fw, "fn");
    const res = await SchroedingersFunction.wrapAsync(fw.fn)();
    SchroedingersFunction.wrap(fw.fn)();
    expect(res).toBe(undefined);
    expect(fw.fn).toBeCalledTimes(1);
  });
  test("should not execute async when executing console.log somewhere else", done => {
    const fn = () => syncFunctionWithoutLogAsnyc("test");
    const fw = { fn };
    jest.spyOn(fw, "fn");

    setTimeout(() => console.log("- test -"), 20);
    setTimeout(() => console.log("- test -"), 5);
    SchroedingersFunction.wrapAsync(fw.fn)().then(res => {
      expect(res).toBe(undefined);
      done();
    });
    console.log("- test -");
    setTimeout(() => console.log("- test -"), 5);
    setTimeout(() => console.log("- test -"), 20);
  });
});
