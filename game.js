const video = document.getElementById("videoFeed");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let prevFrame = null;
let score = 0;

let objManager = new ObjectManager();

// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
});

// --- MOTION DETECTION LOGIC --- //

function detectMotion() {
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");
    temp.width = 160;
    temp.height = 120;

    tctx.drawImage(video, 0, 0, 160, 120);
    const curr = tctx.getImageData(0, 0, 160, 120);

    if (!prevFrame) {
        prevFrame = curr;
        return { left: false, center: false, right: false };
    }

    let leftMotion = 0;
    let centerMotion = 0;
    let rightMotion = 0;

    for (let i = 0; i < curr.data.length; i += 4) {
        const diff =
            Math.abs(curr.data[i] - prevFrame.data[i]) +
            Math.abs(curr.data[i + 1] - prevFrame.data[i + 1]) +
            Math.abs(curr.data[i + 2] - prevFrame.data[i + 2]);

        const pixelIndex = i / 4;
        const x = pixelIndex % 160;

        if (diff > 40) {
            if (x < 50) leftMotion++;
            else if (x < 110) centerMotion++;
            else rightMotion++;
        }
    }

    prevFrame = curr;

    return {
        left: leftMotion > 200,
        center: centerMotion > 200,
        right: rightMotion > 200
    };
}

// --- HIT DETECTION --- //

function processHits(motion) {
    objManager.objects.forEach(o => {
        if (o.hit || !o.reachedPlayer()) return;

        if (o.type === "punch" && motion.center) {
            o.hit = true; score++;
        }
        if (o.type === "left" && motion.left) {
            o.hit = true; score++;
        }
        if (o.type === "right" && motion.right) {
            o.hit = true; score++;
        }
    });

    document.getElementById("score").innerText = "Score: " + score;
}

// --- MAIN GAME LOOP --- //

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const motion = detectMotion();
    processHits(motion);

    objManager.update(ctx);

    requestAnimationFrame(loop);
}

loop();
