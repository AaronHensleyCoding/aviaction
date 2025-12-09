// EXPLOSION PARTICLE CLASS
class ExplosionParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = 15;
        this.color = color;

        this.vx = (Math.random() - 0.5) * 14;
        this.vy = (Math.random() - 0.5) * 14;
        this.life = 25; // frames total
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        this.size *= 0.88;  // shrink
        this.life--;         // countdown
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() {
        return this.life <= 0 || this.size < 1;
    }
}


// FLYING OBJECT CLASS
class FlyingObject {
    constructor(type) {
        this.type = type;

        this.depth = 0;
        this.y = 0;
        this.hit = false;

        this.x =
            type === "left" ? window.innerWidth * 0.25 :
            type === "right" ? window.innerWidth * 0.75 :
            window.innerWidth * 0.5;

        this.size = 120;
        this.color =
            type === "punch" ? "red" :
            type === "left" ? "yellow" : "cyan";

        this.exploding = false;
        this.particles = [];
    }

    reachedPlayer() {
        return this.depth >= 0.95;
    }

    hitObject() {
        if (this.exploding) return;

        this.hit = true;
        this.exploding = true;

        const px = this.x, py = this.y;
        this.particles = [];

        for (let i = 0; i < 25; i++) {
            this.particles.push(new ExplosionParticle(px, py, this.color));
        }
    }

    update() {
        // UPDATE EXPLOSION
        if (this.exploding) {
            this.particles.forEach(p => p.update());
            return;
        }

        // NORMAL MOVEMENT
        this.depth += 0.006;
        this.y = this.depth * window.innerHeight;
    }

    draw(ctx) {
        if (this.exploding) {
            this.particles.forEach(p => p.draw(ctx));
            return;
        }

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.x,
            this.y,
            this.size * (1 - this.depth * 0.35),
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}


// MANAGER
class ObjectManager {
    constructor() {
        this.objects = [];
        this.cooldown = 0;
    }

    spawn() {
        const r = Math.random();
        const type = r < 0.33 ? "punch" : r < 0.66 ? "left" : "right";
        this.objects.push(new FlyingObject(type));
    }

    update(ctx) {
        // SPAWN NEW
        if (this.cooldown <= 0) {
            this.spawn();
            this.cooldown = 95;  // spawn rate
        }
        this.cooldown--;

        // UPDATE & DRAW
        this.objects.forEach(o => {
            o.update();
            o.draw(ctx);
        });

        // 🔥 **REMOVE FINISHED EXPLOSIONS + PASSED OBJECTS**
        this.objects = this.objects.filter(o => {

            if (o.exploding) {
                const done = o.particles.every(p => p.isDead());
                return !done;  // keep until explosion finished
            }

            return o.depth < 1; // keep until passes player
        });
    }
}

window.ObjectManager = ObjectManager;
