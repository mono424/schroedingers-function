module.exports = {
  cleanFnName(rawName) {
    return rawName.replace(/^Object\./, "").replace(/\s\[.*\]$/, "");
  },
  parseFunctionsNames(stack) {
    const regex = /at\s([^(\n]+)\s\(/g;
    const result = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(stack))) {
      result.push(this.cleanFnName(match[1]));
    }
    return result;
  }
};
