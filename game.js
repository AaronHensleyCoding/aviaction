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

// MOTION DETECTION
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

    let leftMotion = 0, centerMotion = 0, rightMotion = 0;

    for (let i = 0; i < curr.data.length; i += 4) {
        const diff =
            Math.abs(curr.data[i] - prevFrame.data[i]) +
            Math.abs(curr.data[i + 1] - prevFrame.data[i + 1]) +
            Math.abs(curr.data[i + 2] - prevFrame.data[i + 2]);

        const x = (i / 4) % 160;

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

// PROCESS HITS
function processHits(motion) {
    objManager.objects.forEach(o => {
        if (o.exploding || !o.reachedPlayer()) return;

        if (o.type === "punch" && motion.center) {
            o.hitObject(); score++;
        }
        if (o.type === "left" && motion.left) {
            o.hitObject(); score++;
        }
        if (o.type === "right" && motion.right) {
            o.hitObject(); score++;
        }
    });

    document.getElementById("score
