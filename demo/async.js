const sF = require("../src/schroedingers-function");

sF.init({
  strict: true
});

const someAsyncUtils = {
  multiply: sF.wrapAsync(
    (a, b) =>
      new Promise(resolve => {
        setTimeout(() => resolve(a * b), 1200);
      })
  ),
  multiply2: sF.wrapAsync(
    (a, b) =>
      new Promise(resolve => {
        setTimeout(() => resolve(a * b), 1200);
        console.log(123);
      })
  )
};

(async () => {
  const [res1, res2] = await Promise.all([
    someAsyncUtils.multiply(5, 5),
    someAsyncUtils.multiply2(5, 5)
  ]);
  console.log("multiply", res1);
  console.log("multiply2", res2);

  const res3 = await someAsyncUtils.multiply(5, 5);
  console.log("multiply", res3);
})();
