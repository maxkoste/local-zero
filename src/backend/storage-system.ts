import React from 'react'
import { Content } from "./content/content";
import { User } from "./user";
import { Visibility } from "./visibility";
// has list of users
// has list of initiative

// read and writes from file (should be sqllite or .dat)
// stores all data during runtime
// singleton

const user1: User = {
    id: 1,
    username: "Lolita",
    password: "hashed_pw_1",
    email: "lolita@email.com",
    visibility: Visibility.PUBLIC,
    action: ["TREE", "BIKE"],
    notification: [],
};

const user2: User = {
    id: 2,
    username: "User123",
    password: "hashed_pw_2",
    email: "user123@email.com",
    visibility: Visibility.KIRSEBERG,
    action: ["PANTA"],
    notification: [],
};

const user3: User = {
    id: 3,
    username: "EcoWarrior",
    password: "hashed_pw_3",
    email: "eco@email.com",
    visibility: Visibility.SOFIELUND,
    action: ["TREE", "BIKE", "PANTA"],
    notification: [],
};

const user4: User = {
    id: 4,
    username: "UrbanPlanner",
    password: "hashed_pw_4",
    email: "planner@email.com",
    visibility: Visibility.FOLKETS_PARK,
    action: [],
    notification: [],
};

const user5: User = {
    id: 5,
    username: "SkepticalSam",
    password: "hashed_pw_5",
    email: "sam@email.com",
    visibility: Visibility.SORGENFRI,
    action: ["FLIGHT"],
    notification: [],
};

export const initiatives: Content[] = [];

// --- Initiative 1 ---
const park = new Content(
    "1",
    "Save the local park",
    "initiative",
    user1,
    "We should protect the park from being developed into housing.",
    new Date(),
    Visibility.PUBLIC
);

const parkUpdate1 = new Content(
    "1-1",
    "Meeting scheduled",
    "update",
    user4,
    "A meeting with the municipality has been scheduled.",
    new Date(),
    Visibility.PUBLIC
);

const parkComment1 = new Content(
    "1-2",
    "",
    "comment",
    user2,
    "This is really important, I fully support this.",
    new Date(),
    Visibility.PUBLIC
);

const parkReply1 = new Content(
    "1-2-1",
    "",
    "comment",
    user1,
    "Glad to hear! We need more support like this.",
    new Date(),
    Visibility.PUBLIC
);

parkComment1.addChild(parkReply1);
park.addChild(parkUpdate1);
park.addChild(parkComment1);

// --- Initiative 2 ---
const plastic = new Content(
    "2",
    "Reduce plastic usage",
    "initiative",
    user2,
    "Let's introduce a plastic-free initiative in our community.",
    new Date(),
    Visibility.PUBLIC
);

const plasticUpdate1 = new Content(
    "2-1",
    "Local store onboard",
    "update",
    user3,
    "A local grocery store agreed to reduce plastic packaging.",
    new Date(),
    Visibility.PUBLIC
);

const plasticComment1 = new Content(
    "2-2",
    "",
    "comment",
    user5,
    "This sounds expensive. Who pays for it?",
    new Date(),
    Visibility.PUBLIC
);

plastic.addChild(plasticUpdate1);
plastic.addChild(plasticComment1);

// --- Initiative 3 ---
const biking = new Content(
    "3",
    "Improve bike lanes",
    "initiative",
    user3,
    "We need safer and more extensive bike lanes in the city.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 4 ---
const recycling = new Content(
    "4",
    "Increase recycling stations",
    "initiative",
    user1,
    "More recycling stations should be available in public areas.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 5 ---
const trees = new Content(
    "5",
    "Plant more trees",
    "initiative",
    user3,
    "Tree planting improves air quality and city aesthetics.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 6 ---
const transport = new Content(
    "6",
    "Improve public transport",
    "initiative",
    user4,
    "We need more frequent and reliable buses and trains.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 7 ---
const solar = new Content(
    "7",
    "Solar panels on public buildings",
    "initiative",
    user1,
    "Install solar panels on schools and government buildings.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 8 ---
const carFree = new Content(
    "8",
    "Car-free city center",
    "initiative",
    user2,
    "Limit cars in the city center to reduce pollution.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 9 ---
const compost = new Content(
    "9",
    "Community composting",
    "initiative",
    user3,
    "Introduce shared composting stations for neighborhoods.",
    new Date(),
    Visibility.PUBLIC
);

// --- Initiative 10 ---
const water = new Content(
    "10",
    "Protect local waterways",
    "initiative",
    user5,
    "Stronger protections against industrial pollution are needed.",
    new Date(),
    Visibility.PUBLIC
);

// Push all
initiatives.push(
    park,
    plastic,
    biking,
    recycling,
    trees,
    transport,
    solar,
    carFree,
    compost,
    water
);