// =========================
// Falling Object
// =========================
class FallingObject {
    constructor(type, x) {
        this.type = type;
        this.x = x;
        this.y = -200;     // Start above screen
        this.radius = 120;

        // Colors by type
        this.color =
            type === "left" ? "yellow" :
            type === "right" ? "cyan" :
            "red";

        this.speed = 3; // falling speed
        this.hit = false;
        this.exploded = false;
        this.depth = 0; // 0 = far, 1 = at player
    }

    update() {
        this.y += this.speed;
        this.depth = this.y / window.innerHeight;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    reachedPlayer() {
        return this.depth >= 0.85;
    }
}

// =========================
// Particle (explosion)
// =========================
class ExplosionParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 25;
        this.color = color;
        this.done = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        if (this.life <= 0) this.done = true;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// =========================
// Object Manager
// =========================
class ObjectManager {
    constructor() {
        this.objects = [];
        this.particles = [];

        this.spawnTimer = 0;
        this.spawnInterval = 60; // ~1 per second
    }

    spawnObject() {
        const r = Math.random();
        const x = (r < 0.33) ? 300 :
                  (r < 0.66) ? window.innerWidth / 2 :
                               window.innerWidth - 300;

        const type = (r < 0.33) ? "left" :
                     (r < 0.66) ? "punch" : "right";

        this.objects.push(new FallingObject(type, x));
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 25; i++) {
            this.particles.push(new ExplosionParticle(x, y, color));
        }
    }

    update(ctx) {

        // Spawn new objects
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnObject();
            this.spawnTimer = this.spawnInterval;
        }

        const stillAlive = [];

        // Update objects
        for (let o of this.objects) {
            o.update();
            o.draw(ctx);

            // Trigger explosion
            if (o.hit && !o.exploded) {
                o.exploded = true;
                this.createExplosion(o.x, o.y, o.color);
                continue; // remove object from list
            }

            // Remove if passed player
            if (o.depth >= 1.1) continue;

            stillAlive.push(o);
        }

        this.objects = stillAlive;

        // Update explosion particles
        this.particles = this.particles.filter(p => {
            if (!p) return false;
            p.update();
            p.draw(ctx);
            return !p.done;
        });
    }
}

// Expose globally so game.js can access it
window.ObjectManager = ObjectManager;
