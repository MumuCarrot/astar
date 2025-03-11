import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class BrushService {
    state: number = 0;

    setTo(num: number) 
    {
        this.state = num;
    }
}