"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatives = void 0;
const visibility_1 = require("./visibility");
const content_1 = require("./content");
const user1 = {
    id: 1,
    username: "Lolita",
    password: "hashed_pw_1",
    email: "lolita@email.com",
    visibility: visibility_1.Visibility.PUBLIC,
    action: ["TREE", "BIKE"],
    notification: [],
};
const user2 = {
    id: 2,
    username: "User123",
    password: "hashed_pw_2",
    email: "user123@email.com",
    visibility: visibility_1.Visibility.KIRSEBERG,
    action: ["PANTA"],
    notification: [],
};
const user3 = {
    id: 3,
    username: "EcoWarrior",
    password: "hashed_pw_3",
    email: "eco@email.com",
    visibility: visibility_1.Visibility.SOFIELUND,
    action: ["TREE", "BIKE", "PANTA"],
    notification: [],
};
const user4 = {
    id: 4,
    username: "UrbanPlanner",
    password: "hashed_pw_4",
    email: "planner@email.com",
    visibility: visibility_1.Visibility.FOLKETS_PARK,
    action: [],
    notification: [],
};
const user5 = {
    id: 5,
    username: "SkepticalSam",
    password: "hashed_pw_5",
    email: "sam@email.com",
    visibility: visibility_1.Visibility.SORGENFRI,
    action: ["FLIGHT"],
    notification: [],
};
exports.initiatives = [];
// --- Initiative 1 ---
const park = new content_1.Content("1", "Save the local park", "initiative", user1, "We should protect the park from being developed into housing.", new Date(), visibility_1.Visibility.PUBLIC);
const parkUpdate1 = new content_1.Content("1-1", "Meeting scheduled", "update", user4, "A meeting with the municipality has been scheduled.", new Date(), visibility_1.Visibility.PUBLIC);
const parkComment2 = new content_1.Content("1-1-1", "", "comment", user2, "Great news, which day is the meeting?", new Date(), visibility_1.Visibility.PUBLIC);
const parkReply2 = new content_1.Content("1-1-1-1", "", "comment", user4, "Tuesday the 15th at 18:00 at the community center.", new Date(), visibility_1.Visibility.PUBLIC);
const parkReply3 = new content_1.Content("1-1-1-2", "", "comment", user1, "I'll be there!", new Date(), visibility_1.Visibility.PUBLIC);
const parkReply4 = new content_1.Content("1-1-2", "", "comment", user5, "Is this really going to make a difference?", new Date(), visibility_1.Visibility.PUBLIC);
const parkReplyNested = new content_1.Content("1-1-2-1", "", "comment", user3, "Every bit of community action counts. Join us and see!", new Date(), visibility_1.Visibility.PUBLIC);
parkReply2.addChild(parkReply3); // svar på svaret
parkComment2.addChild(parkReply2);
parkReply4.addChild(parkReplyNested);
parkComment2.addChild(parkReply4);
parkUpdate1.addChild(parkComment2);
park.addChild(parkUpdate1);
// --- Initiative 2 ---
const plastic = new content_1.Content("2", "Reduce plastic usage", "initiative", user2, "Let's introduce a plastic-free initiative in our community.", new Date(), visibility_1.Visibility.PUBLIC);
const plasticUpdate1 = new content_1.Content("2-1", "Local store onboard", "update", user3, "A local grocery store agreed to reduce plastic packaging.", new Date(), visibility_1.Visibility.PUBLIC);
const plasticComment1 = new content_1.Content("2-2", "", "comment", user5, "This sounds expensive. Who pays for it?", new Date(), visibility_1.Visibility.PUBLIC);
plastic.addChild(plasticUpdate1);
plasticUpdate1.addChild(plasticComment1);
// --- Initiative 3 ---
const biking = new content_1.Content("3", "Improve bike lanes", "initiative", user3, "We need safer and more extensive bike lanes in the city.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 4 ---
const recycling = new content_1.Content("4", "Increase recycling stations", "initiative", user1, "More recycling stations should be available in public areas.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 5 ---
const trees = new content_1.Content("5", "Plant more trees", "initiative", user3, "Tree planting improves air quality and city aesthetics.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 6 ---
const transport = new content_1.Content("6", "Improve public transport", "initiative", user4, "We need more frequent and reliable buses and trains.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 7 ---
const solar = new content_1.Content("7", "Solar panels on public buildings", "initiative", user1, "Install solar panels on schools and government buildings.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 8 ---
const carFree = new content_1.Content("8", "Car-free city center", "initiative", user2, "Limit cars in the city center to reduce pollution.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 9 ---
const compost = new content_1.Content("9", "Community composting", "initiative", user3, "Introduce shared composting stations for neighborhoods.", new Date(), visibility_1.Visibility.PUBLIC);
// --- Initiative 10 ---
const water = new content_1.Content("10", "Protect local waterways", "initiative", user5, "Stronger protections against industrial pollution are needed.", new Date(), visibility_1.Visibility.PUBLIC);
// Push all
exports.initiatives.push(park, plastic, biking, recycling, trees, transport, solar, carFree, compost, water);
