export type ActionKey = keyof typeof Action;
export declare const Action: {
    readonly BIKE: {
        readonly label: "bike to work";
        readonly points: 10;
    };
    readonly TREE: {
        readonly label: "plant a tree";
        readonly points: 20;
    };
    readonly PANTA: {
        readonly label: "pantamera";
        readonly points: 5;
    };
    readonly CEO: {
        readonly label: "shoot a CEO";
        readonly points: 1000;
    };
    readonly OIL: {
        readonly label: "oil spill";
        readonly points: -500;
    };
    readonly FLIGHT: {
        readonly label: "take a flight to work";
        readonly points: -50;
    };
};
