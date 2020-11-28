"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceFromContainer = exports.InjectFromContainer = void 0;
const tsyringe_1 = require("tsyringe");
function InjectFromContainer(token) {
    return function (target, propertyKey) {
        target[propertyKey] = getServiceFromContainer(token);
    };
}
exports.InjectFromContainer = InjectFromContainer;
function getServiceFromContainer(token) {
    return tsyringe_1.container.resolve(token);
}
exports.getServiceFromContainer = getServiceFromContainer;
