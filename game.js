const video = document.getElementById("videoFeed");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let prevFrame = null;
let score = 0;

let objManager = new ObjectManager();

// START CAMERA
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
});

// MOTION DETECTION
function detectMotion() {
    const temp = document.createElement("canvas");
    temp.width = 160;
    temp.height = 120;

    const tctx = temp.getContext("2d");

    tctx.drawImage(video, 0, 0, 160, 120);
    const curr = tctx.getImageData(0, 0, 160, 120);

    if (!prevFrame) {
        prevFrame = curr;
        return { left: false, center: false, right: false };
    }

    let left = 0, center = 0, right = 0;

    for (let i = 0; i < curr.data.length; i += 4) {
        const diff =
            Math.abs(curr.data[i] - prevFrame.data[i]) +
            Math.abs(curr.data[i + 1] - prevFrame.data[i + 1]) +
            Math.abs(curr.data[i + 2] - prevFrame.data[i + 2]);

        const x = (i / 4) % 160;

        if (diff > 35) {
            if (x < 50) left++;
            else if (x < 110) center++;
            else right++;
        }
    }

    prevFrame = curr;

    return {
        left: left > 200,
        center: center > 200,
        right: right > 200
    };
}

// HIT DETECTION
function processHits(motion) {
    objManager.objects.forEach(o => {
        if (o.hit) return;

        // match object to motion zone BEFORE it passes player fully
        if (o.type === "punch" && motion.center) o.hit = true;
        if (o.type === "left" && motion.left) o.hit = true;
        if (o.type === "right" && motion.right) o.hit = true;

        if (o.hit) score++;
    });

    document.getElementById("score").innerText = "Score: " + score;
}

// LOOP
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const motion = detectMotion();
    processHits(motion);

    objManager.update(ctx);

    requestAnimationFrame(loop);
}

loop();
