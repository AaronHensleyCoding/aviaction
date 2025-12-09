// EXPLOSION PARTICLE CLASS
class ExplosionParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = 12;
        this.color = color;

        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.5) * 12;
        this.life = 20;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size *= 0.9;
        this.life--;
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
        this.depth = 0; // 0 = far away, 1 = at player

        this.x = window.innerWidth / 2;
        if (type === "left") this.x = window.innerWidth * 0.25;
        if (type === "right") this.x = window.innerWidth * 0.75;

        this.y = 0;
        this.size = 120;

        this.color =
            type === "punch" ? "red" :
            type === "left" ? "yellow" : "cyan";

        this.hit = false;
        this.exploding = false;
        this.particles = [];
    }

    reachedPlayer() {
        return this.depth >= 0.95;
    }

    hitObject() {
        if (this.exploding) return;

        this.exploding = true;
        this.particles = [];

        const px = this.x;
        const py = this.y;

        for (let i = 0; i < 20; i++) {
            this.particles.push(new ExplosionParticle(px, py, this.color));
        }
    }

    update() {

        if (this.exploding) {
            this.particles.forEach(p => p.update());
            return;
        }

        this.depth += 0.012;
        this.y = this.depth * window.innerHeight;
    }

    draw(ctx) {
        if (this.exploding) {
            this.particles.forEach(p => p.draw(ctx));
            return;
        }

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size * (1 - this.depth * 0.4), 0, Math.PI * 2);
        ctx.fill();
    }
}

// MANAGER CLASS
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

        // Remove passed or finished explosions
        this.objects = this.objects.filter(o => {
            if (o.exploding) return !o.particles.every(p => p.isDead());
            return o.depth < 1 && !o.hit;
        });
    }
}

window.ObjectManager = ObjectManager;
