"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleFromStore = exports.InjectFromStore = void 0;
const store_manager_1 = require("../controllers/store-manager");
function InjectFromStore(module) {
    return function (target, propertyKey) {
        target[propertyKey] = getModuleFromStore(module);
    };
}
exports.InjectFromStore = InjectFromStore;
function getModuleFromStore(module) {
    return store_manager_1.StoreManager.getInstance().resolve(module);
}
exports.getModuleFromStore = getModuleFromStore;
