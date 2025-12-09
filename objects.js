class FlyingObject {
    constructor(type) {
        this.type = type; // "punch", "left", "right"
        this.size = 120;

        this.z = 1;       // starts far away
        this.speed = 0.02; // how fast it flies toward the player

        // Center position (2D)
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;

        // Offset for dodge objects
        if (type === "left") this.x -= 250;
        if (type === "right") this.x += 250;

        this.hit = false;
    }

    update() {
        this.z += this.speed;
    }

    draw(ctx) {
        const scale = this.z; // grows as it gets closer
        const size = this.size * scale;

        ctx.fillStyle = this.type === "punch" ? "red" :
                        this.type === "left" ? "blue" : "green";

        ctx.beginPath();
        ctx.rect(this.x - size/2, this.y - size/2, size, size);
        ctx.fill();
    }

    isInHitZone() {
        return this.z >= 4; // distance threshold
    }
}

class ObjectManager {
    constructor() {
        this.objects = [];
        this.spawnCooldown = 0;
    }

    spawnRandom() {
        const r = Math.random();
        if (r < 0.6) this.objects.push(new FlyingObject("punch"));
        else if (r < 0.8) this.objects.push(new FlyingObject("left"));
        else this.objects.push(new FlyingObject("right"));
    }

    update(ctx) {
        this.spawnCooldown--;
        if (this.spawnCooldown <= 0) {
            this.spawnRandom();
            this.spawnCooldown = 180; // new object every ~3 seconds
        }

        this.objects.forEach(obj => obj.update());
        this.objects.forEach(obj => obj.draw(ctx));

        // Remove objects that passed hit zone
        this.objects = this.objects.filter(o => o.z < 6);
    }
}

window.ObjectManager = ObjectManager;
