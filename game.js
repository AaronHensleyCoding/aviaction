const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let lastPunch = false;
let lastDodgeLeft = false;
let lastDodgeRight = false;

let objectManager = new ObjectManager();

document.getElementById("score").innerText = `Score: ${score}`;

async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}
initCamera();

function detectMoves(landmarks) {
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!rightWrist || !leftShoulder || !rightShoulder) return;

    // Punch detection (fast forward motion)
    let punch = false;
    if (rightWrist.x < 0.25) punch = true; // crude threshold initially

    // Dodge detection (shift left/right)
    const center = (leftShoulder.x + rightShoulder.x) / 2;

    const dodgeLeft = center < 0.40;
    const dodgeRight = center > 0.60;

    return { punch, dodgeLeft, dodgeRight };
}

function processHits(moves) {
    objectManager.objects.forEach(obj => {
        if (obj.hit) return;

        if (!obj.isInHitZone()) return;

        if (obj.type === "punch" && moves.punch) {
            obj.hit = true;
            score++;
        }

        if (obj.type === "left" && moves.dodgeLeft) {
            obj.hit = true;
            score++;
        }

        if (obj.type === "right" && moves.dodgeRight) {
            obj.hit = true;
            score++;
        }

        if (obj.hit) {
            document.getElementById("score").innerText = `Score: ${score}`;
        }
    });

    // Remove objects that were hit
    objectManager.objects = objectManager.objects.filter(o => !o.hit);
}

function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        const moves = detectMoves(results.poseLandmarks);
        if (moves) {
            processHits(moves);
        }
    }

    objectManager.update(ctx);
}

const pose = new Pose.Pose({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
});

pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

const camera = new Camera(video, {
    onFrame: async () => {
        await pose.send({ image: video });
    }
});
camera.start();
