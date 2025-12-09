class FlyingObject {
    constructor(type) {
        this.type = type;
        this.depth = 0;  // start far away
        this.hit = false;

        if (type === "punch") this.color = "red";
        if (type === "left")  this.color = "yellow";
        if (type === "right") this.color = "cyan";
    }

    update() {
        if (!this.hit)
            this.depth += 0.01;   // move TOWARD the player
    }

    reachedPlayer() {
        return this.depth >= 0.8;   // hit zone
    }

    draw(ctx) {
        const size = 200 * (1 + this.depth);   // grows as it comes closer

        let x = ctx.canvas.width / 2;

        if (this.type === "left")  x = ctx.canvas.width * 0.25;
        if (this.type === "right") x = ctx.canvas.width * 0.75;

        const y = ctx.canvas.height * 0.5;

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
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
