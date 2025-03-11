import { Component } from '@angular/core';
import { MapGridComponent } from './map-grid.component';
import { BrushService } from "./brush.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MapGridComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [BrushService]
})
export class AppComponent {
  title = 'astar';
}
