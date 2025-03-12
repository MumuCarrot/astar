class QueueItem {
    data: any;
    priority: number;

    constructor(data: any, priority: number) {
        this.data = data;
        this.priority = priority;
    }
}

export class PriorityQueue {
    items: QueueItem[] = [];

    enqueue(data: any, priority: number): void {
        const newItem = new QueueItem(data, priority);
        let added = false;

        for (let i = 0; i < this.items.length; i++) {
            if (newItem.priority < this.items[i].priority) {
                this.items.splice(i, 0, newItem);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(newItem);
        }
    }

    dequeue(): any {
        if (this.isEmpty()) return "Underflow";
        return this.items.shift()?.data;
    }

    peek(): any {
        if (this.isEmpty()) return "Empty Queue";
        return this.items[0].data;
    }

    isEmpty(): boolean {
        return this.items.length == 0;
    }

    get length(): number {
        return this.items.length;
    }
}