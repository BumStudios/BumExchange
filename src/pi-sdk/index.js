// src/pi-sdk/index.js

// A lightweight wrapper to use Pi SDK in the browser only
const Pi = {
  init: async (config) => {
    if (!window.Pi) throw new Error("Pi SDK not found on window");
    return window.Pi.init(config);
  },
  authenticate: async (scopes, paymentHandler) => {
    return window.Pi.authenticate(scopes, paymentHandler);
  },
  createPayment: async (paymentInfo, handlers) => {
    return window.Pi.createPayment(paymentInfo, handlers);
  },
};

export default Pi;
