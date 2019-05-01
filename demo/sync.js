const sF = require("../src/schroedingers-function");

const someUtils = {
  multiply: sF.wrap((a, b) => {
    return a * b;
  }),
  multiply2: sF.wrap((a, b) => {
    console.log("");
    return a * b;
  })
};

// Will not work because no debug statement run in code
const result = someUtils.multiply(5, 5);
const result2 = someUtils.multiply(10, 5);
console.log("multiply:", result, result2);

// Will work because console.log called in multiply 2
const result3 = someUtils.multiply2(5, 5);
const result4 = someUtils.multiply2(10, 5);
console.log("multiply2:", result3, result4);
