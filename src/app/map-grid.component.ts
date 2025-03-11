import { Component } from "@angular/core";
import { Point } from "./point";
import { MapItemComponent } from "./map-item.component";
import { BrushService } from "./brush.service";
import { Node } from "./node";

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

        const frontier: Node[] = [];
        const start = new Node(this.startPoint, 0, this.manhattanDistance(this.startPoint, this.endPoint));
        frontier.push(start);
        const came_from: {node: string, from: string | null }[] = [];
        came_from.push({node: this.nodeParser(start), from: null});

        while (frontier.length > 0) {
            const current = frontier.shift()!;
            for (const neighbor of this.getNeighbors(this.obstacles, current)) {
                if (!came_from.find((x) => x.node === this.nodeParser(neighbor))) {
                    frontier.push(neighbor);
                    came_from.push({node: this.nodeParser(neighbor), from: this.nodeParser(current)});
                }
            }
        }

        let path: string[] = [];
        let currentNode: string | null = this.nodeParser(new Node(this.endPoint, 0, 0));

        while (currentNode !== null) {
            path.push(currentNode);
            const entry = came_from.find((x) => x.node === currentNode);
            currentNode = entry ? entry.from : null;
        }

        path.reverse();
        
        this.obstacles.forEach((column) => {column.forEach((point) => {if (point.state == 4) point.state = 0;})});

        for (let i = 0; i < path.length; i++) {
            let points = path[i].split(",");
            if (this.obstacles[Number(points[0])][Number(points[1])].state == 0)
                this.obstacles[Number(points[0])][Number(points[1])].state = 4;
        }
    }

    clear() {
        this.generateGrid(this.rowSize, this.columnSize);
    }
}