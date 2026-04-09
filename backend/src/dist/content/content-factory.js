"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentFactory = void 0;
const content_1 = require("./content");
class ContentFactory {
    static create(id, title, type, author, body, date = new Date(), visibility, image, location, duration, parent) {
        if (type === 'initiative' && parent !== undefined) {
            throw new Error('An initiative cannot have a parent');
        }
        if (type !== 'initiative' && parent === undefined) {
            throw new Error(`A ${type} must be created with a parent (initiative or update)`);
        }
        const content = new content_1.Content(id, title, type, author, body, date, visibility, image, location, duration);
        if (parent) {
            parent.addChild(content);
        }
        return content;
    }
}
exports.ContentFactory = ContentFactory;
