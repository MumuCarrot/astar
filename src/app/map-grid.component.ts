import { Component } from "@angular/core";
import { Point } from "./point";
import { MapItemComponent } from "./map-item.component";
import { BrushService } from "./brush.service";
import { Node } from "./node";
import { PriorityQueue } from "./priorityQueue";

@Component({
    selector: "app-map-grid",
    standalone: true,
    imports: [MapItemComponent],
    templateUrl: "./map-grid.component.html",
    styleUrl: "./map-grid.component.scss"
})
export class MapGridComponent {
    rowSize: number = 10;
    columnSize: number = 10;

    startPoint: Point | null = null;
    endPoint: Point | null = null;
    obstacles: Point[][] = Array.from({ length: this.rowSize }, () =>
        Array.from({ length: this.columnSize }, () => (new Point(0, 0)))
    );

    constructor(public brushService: BrushService) {
        this.generateGrid(this.rowSize, this.columnSize);
    }

    generateGrid(rowSize: number, columnSize: number) {
        for (let i = 0; i < columnSize; i++) {
            for (let j = 0; j < rowSize; j++) {
                this.obstacles[i][j] = new Point(i, j);
            }
        }
    }

    range(start: number, end: number): number[] {
        return Array(end - start + 1).fill(0).map((_, idx) => start + idx);
    }

    setTo(num: number) {
        this.brushService.setTo(num);
    }

    manhattanDistance(a: Point, b: Point): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    getNeighbors(grid: Point[][], node: Node): Node[] {
        const neighbors: Node[] = [];
        const { x, y } = node.point;
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
        for (const { dx, dy } of directions) {
            const nx = x + dx, ny = y + dy;
            if (grid[nx] && grid[nx][ny] && grid[nx][ny].state != 3) {
                neighbors.push(new Node(grid[nx][ny], 0, 0, node));
            }
        }
        return neighbors;
    }

    nodeParser(node: Node): string {
        return node.point.x + "," + node.point.y;
    }

    start() {
        let startPointNum: number = 0;
        let endPointNum: number = 0;

        for (let i = 0; i < this.columnSize; i++) {
            for (let j = 0; j < this.rowSize; j++) {
                if (this.obstacles[i][j].state == 1) {
                    startPointNum++;
                }
                else if (this.obstacles[i][j].state == 2) {
                    endPointNum++;
                }
            }
        }

        if (startPointNum == 0 || endPointNum == 0) {
            alert("Please select a start and end point.");
            return;
        }
        else if (startPointNum > 1 || endPointNum > 1) {
            alert("Please select only one start and end point.");
            return;
        }

        let breakPoint: number = 0;
        for (let i = 0; i < this.columnSize; i++) {
            for (let j = 0; j < this.rowSize; j++) {
                if (this.obstacles[i][j].state == 1) {
                    this.startPoint = this.obstacles[i][j];
                    breakPoint++;
                    if (breakPoint == 2) {
                        break;
                    }
                }
                else if (this.obstacles[i][j].state == 2) {
                    this.endPoint = this.obstacles[i][j];
                    breakPoint++;
                    if (breakPoint == 2) {
                        break;
                    }
                }
            }
        }

        if (this.startPoint == null || this.endPoint == null) return;

        const frontier = new PriorityQueue();
        frontier.enqueue(this.startPoint, 0);
        const cameFrom = new Map<string, Point | null>();
        const costSoFar = new Map<string, number>();
        cameFrom.set(`${this.startPoint.x},${this.startPoint.y}`, null);
        costSoFar.set(`${this.startPoint.x},${this.startPoint.y}`, 0);

        while (frontier.length > 0) {
            const current = frontier.dequeue();

            if (current.x === this.endPoint.x && current.y === this.endPoint.y) break;

            for (const next of this.getNeighbors(this.obstacles, new Node(current, 0, 0))) {
                const newCost = costSoFar.get(this.nodeParser(new Node(current, 0, 0)))! + 1;
                if (!costSoFar.has(this.nodeParser(next)) || newCost < costSoFar.get(this.nodeParser(next))!) {
                    costSoFar.set(this.nodeParser(next), newCost);
                    const priority = newCost + this.manhattanDistance(this.endPoint, next.point);
                    frontier.enqueue(next.point, priority);
                    cameFrom.set(this.nodeParser(next), current);
                }
            }
        }

        let current: Point | null = this.endPoint;
        const path: Point[] = [];

        while (current) {
            path.push(current);
            current = cameFrom.get(this.nodeParser(new Node(current, 0, 0))) || null;
        }

        path.reverse();
        
        this.obstacles.forEach((column) => {column.forEach((point) => {if (point.state == 4) point.state = 0;})});

        for (let i = 0; i < path.length; i++) {
            if (this.obstacles[path[i].x][path[i].y].state == 0)
                this.obstacles[path[i].x][path[i].y].state = 4;
        }
    }

    clear() {
        this.generateGrid(this.rowSize, this.columnSize);
    }
}