class FlyingObject {
    constructor(type) {
        this.type = type; // "punch", "left", "right"

        this.size = 120;     // base size
        this.depth = 0;      // 0 = far away
        this.speed = 0.025;  // movement speed

        this.cx = window.innerWidth / 2;
        this.cy = window.innerHeight / 2;

        if (type === "left") this.cx -= 250;
        if (type === "right") this.cx += 250;

        this.color = 
            type === "punch" ? "red" :
            type === "left" ? "blue" :
            "green";

        this.markedHit = false;
    }

    update() {
        this.depth += this.speed;
    }

    draw(ctx) {
        const size = this.size * (1 + this.depth * 4);  
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.cx - size / 2,
            this.cy - size / 2,
            size,
            size
        );
    }

    reachedPlayer() {
        return this.depth >= 0.45; // controls hit zone
    }
}

class ObjectManager {
    constructor() {
        this.objects = [];
        this.cooldown = 0;
    }

    spawn() {
        const r = Math.random();
        if (r < 0.6) this.objects.push(new FlyingObject("punch"));
        else if (r < 0.8) this.objects.push(new FlyingObject("left"));
        else this.objects.push(new FlyingObject("right"));
    }

    update(ctx) {
        if (this.cooldown <= 0) {
            this.spawn();
            this.cooldown = 150; // every ~2.5s
        }
        this.cooldown--;

        this.objects.forEach(o => {
            o.update();
            o.draw(ctx);
        });

        // Remove boxes that passed the player
        this.objects = this.objects.filter(o => o.depth < 1 && !o.markedHit);
    }
}

window.ObjectManager = ObjectManager;
