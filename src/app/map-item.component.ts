import { Component, Input, Output, EventEmitter } from "@angular/core";
import { BrushService } from "./brush.service";
import { Point } from "./point";

@Component({
    selector: "app-map-item",
    standalone: true,
    styleUrl: "./map-item.component.scss",
    templateUrl: "./map-item.component.html"
})
export class MapItemComponent {
    @Input() point!: Point;
    @Output() pointChange = new EventEmitter<Point>();

    get isLoaded(): boolean {
        return this.point != null;
    }
    onStateChange(state: number) {
        this.point.state = state;
        this.pointChange.emit(this.point);
    }

    constructor(public brushService: BrushService) {}
}