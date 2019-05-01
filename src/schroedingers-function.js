/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const nanoid = require("nanoid");
const utils = require("./utils");

const DEFAULT_CONFIG = {
  strict: true,
  notWatchingProp: "__schroedingerNotWatching",
  failedReturnValue: undefined,
  logFunctions: ["log", "error", "table", "debug", "info", "warn"]
};

const SchroedingersFunction = {
  config: null,
  isInit: false,
  trackedConsoleLogs: [],
  noWatchingFns: [],

  init(config) {
    if (this.isInit) {
      return;
    }
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.inject();
    this.isInit = true;
  },

  inject() {
    this.config.logFunctions.forEach(fnName => {
      const origFn = console[fnName];
      console[fnName] = (...args) => {
        const { stack } = new Error();
        origFn.bind(console)(...args);
        this.trackConsoleLog(stack);
      };
    });
  },

  trackConsoleLog(stack) {
    this.trackedConsoleLogs.push(stack);
  },

  findConsoleLogStacksForCaller(caller, startIndex = 0) {
    const { trackedConsoleLogs } = this;
    return trackedConsoleLogs
      .slice(startIndex, trackedConsoleLogs.length - startIndex - 1)
      .filter(stack => {
        const stackFnNames = utils.parseFunctionsNames(stack);
        // console.info(caller, stackFnNames);
        return stackFnNames.indexOf(caller) > -1;
      });
  },

  runWithCounter(fn, args) {
    const consoleLogCount = this.trackedConsoleLogs.length;
    const res = fn(...args);
    const logCount = this.trackedConsoleLogs.length - consoleLogCount;
    return [logCount, res];
  },

  async runWithCounterAsync(caller, fn, args) {
    const consoleLogCount = this.trackedConsoleLogs.length;
    const res = await fn(...args);
    const logCount = this.config.strict
      ? this.findConsoleLogStacksForCaller(caller, consoleLogCount - 1).length
      : this.trackedConsoleLogs.length - consoleLogCount;
    return [logCount, res];
  },

  wrap(fn) {
    this.init();
    const { config } = this;
    return (...args) => {
      if (fn[config.notWatchingProp]) {
        return config.failedReturnValue;
      }

      const [logCount, res] = this.runWithCounter(fn, args);
      if (logCount) {
        return res;
      }
      fn[config.notWatchingProp] = true;
      return config.failedReturnValue;
    };
  },

  wrapAsync(fn) {
    this.init();
    const callerName = nanoid();
    const { config } = this;
    const wrapObject = {
      [callerName]: async (...args) => {
        if (fn[config.notWatchingProp]) {
          return config.failedReturnValue;
        }

        const [logCount, res] = await this.runWithCounterAsync(
          callerName,
          fn,
          args
        );
        if (logCount) {
          return res;
        }
        fn[config.notWatchingProp] = true;
        this.noWatchingFns.push(fn);
        return config.failedReturnValue;
      }
    };
    return wrapObject[callerName];
  },

  unlock() {
    this.noWatchingFns.forEach(fn => {
      delete fn[this.config.notWatchingProp];
    });
    this.noWatchingFns = [];
  }
};

module.exports = SchroedingersFunction;
