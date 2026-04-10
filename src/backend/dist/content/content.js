"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
class Content {
    constructor(id, title, type, author, body, date = new Date(), visibility, image, location, duration) {
        this.likes = new Set();
        this.dislikes = new Set();
        this.children = [];
        this.id = id;
        this.title = title;
        this.type = type;
        this.author = author;
        this.body = body;
        this.visibility = visibility;
        this.date = date;
        this.image = image;
        this.location = location;
        this.duration = duration;
    }
    addChild(child) {
        this.children.push(child);
    }
    removeChild(childId) {
        const initialLength = this.children.length;
        this.children = this.children.filter(child => child.id !== childId);
        return this.children.length !== initialLength;
    }
    getChildren() {
        return [...this.children];
    }
    getAllDescendants() {
        const descendants = [];
        const stack = [...this.children];
        while (stack.length > 0) {
            const current = stack.pop();
            descendants.push(current);
            stack.push(...current.children);
        }
        return descendants;
    }
}
exports.Content = Content;
