"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStore = exports.registerStores = void 0;
const store_manager_1 = require("./controllers/store-manager");
function registerStores(options, store) {
    options.forEach((option) => {
        registerStore(option, store);
    });
}
exports.registerStores = registerStores;
function registerStore(option, store) {
    store_manager_1.StoreManager.getInstance().register(option.name, new option.Module({ name: option.name, store }));
}
exports.registerStore = registerStore;
