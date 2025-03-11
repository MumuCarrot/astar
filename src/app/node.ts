import { Point } from "./point";

export class Node {
    constructor(
        public point: Point,
        public g: number,
        public h: number,
        public parent: Node | null = null
    ) {}
    get f() { return this.g + this.h; }
}