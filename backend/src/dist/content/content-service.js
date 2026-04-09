"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitiative = createInitiative;
exports.createUpdate = createUpdate;
exports.createComment = createComment;
const content_factory_1 = require("./content-factory");
function createInitiative(id, title, author, body, visibility, image, location, duration) {
    return content_factory_1.ContentFactory.create(id, title, 'initiative', author, body, new Date(), visibility, image, location, duration, undefined // no parent, i.e. orphan :(
    );
}
function createUpdate(id, title, author, body, visibility, parent, image, location, duration) {
    return content_factory_1.ContentFactory.create(id, title, 'update', author, body, new Date(), visibility, image, location, duration, parent);
}
function createComment(id, title, author, body, visibility, parent) {
    return content_factory_1.ContentFactory.create(id, title, 'comment', author, body, new Date(), visibility, undefined, undefined, undefined, parent);
}
