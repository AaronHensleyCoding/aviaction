const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.onresize = resizeCanvas;

let score = 0;
let objectManager = new ObjectManager();

async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}
initCamera();

function detectMoves(landmarks) {
    const wrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!wrist || !leftShoulder || !rightShoulder) return {};

    const punch = wrist.x < 0.3;
    const center = (leftShoulder.x + rightShoulder.x) / 2;

    return {
        punch,
        dodgeLeft: center < 0.40,
        dodgeRight: center > 0.60
    };
}

function processHits(moves) {
    objectManager.objects.forEach(obj => {
        if (obj.markedHit) return;
        if (!obj.reachedPlayer()) return;

        if (obj.type === "punch" && moves.punch) {
            obj.markedHit = true;
            score++;
        }
        if (obj.type === "left" && moves.dodgeLeft) {
            obj.markedHit = true;
            score++;
        }
        if (obj.type === "right" && moves.dodgeRight) {
            obj.markedHit = true;
            score++;
        }
    });

    document.getElementById("score").innerText = "Score: " + score;
}

function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const moves = results.poseLandmarks ? detectMoves(results.poseLandmarks) : {};

    processHits(moves);
    objectManager.update(ctx);
}

const pose = new Pose.Pose({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675471629/${f}`
});

pose.setOptions({
    modelComplexity: 0,
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
