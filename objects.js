class FlyingObject {
    constructor(type) {
        this.type = type; // punch, left, right
        this.depth = 1.5;
        this.hit = false;

        // screen positions
        this.x =
            type === "left" ? 0.25 :
            type === "right" ? 0.75 :
            0.5;

        this.size = 120;
    }

    update() {
        if (this.hit) return;
        this.depth -= 0.01;
    }

    reachedPlayer() {
        return this.depth <= 0.45;
    }

    draw(ctx, canvas) {
        const screenX = this.x * canvas.width;
        const screenY = this.depth * canvas.height;

        ctx.fillStyle =
            this.type === "punch" ? "red" :
            this.type === "left" ? "yellow" :
            "cyan";

        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ObjectManager {
    constructor() {
        this.objects = [];
        this.cooldown = 0;
    }

    spawn() {
        const r = Math.random();
        if (r < 0.33) this.objects.push(new FlyingObject("punch"));
        else if (r < 0.66) this.objects.push(new FlyingObject("left"));
        else this.objects.push(new FlyingObject("right"));
    }

    update(ctx, canvas) {
        if (this.cooldown <= 0) {
            this.spawn();
            this.cooldown = 120; // ~2 seconds
        }
        this.cooldown--;

        this.objects.forEach(o => {
            o.update();
            o.draw(ctx, canvas);
        });

        // Remove passed objects
        this.objects = this.objects.filter(o => o.depth > 0 && !o.markedHit);
    }
}
