class FlyingObject {
    constructor(type) {
        this.type = type; // "punch", "left", "right"

        this.size = 100;
        this.depth = 0;
        this.speed = 0.015;

        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;

        if (type === "left")  this.x -= 250;
        if (type === "right") this.x += 250;

        this.color =
            type === "punch" ? "red" :
            type === "left"  ? "blue" :
            "green";

        this.hit = false;
    }

    update() {
        this.depth += this.speed;
    }

    draw(ctx) {
        const size = this.size * (1 + this.depth * 3);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - size/2, this.y - size/2, size, size);
    }

    reachedPlayer() {
        return this.depth >= 0.5;
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
            this.cooldown = 120;
        }
        this.cooldown--;

        this.objects.forEach(o => {
            o.update();
            o.draw(ctx);
        });

        this.objects = this.objects.filter(o => o.depth < 1 && !o.hit);
    }
}
