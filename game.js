const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lastRightWristX = null;
let lastLeftShoulderX = null;

document.getElementById("debug").innerText = "Initializing camera...";

async function initCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
    });
    video.srcObject = stream;
}
initCamera();

function detectMoves(landmarks) {
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (!rightWrist || !leftShoulder || !rightShoulder) return;

    // Detect Punch (fast forward movement)
    if (lastRightWristX !== null) {
        const movement = lastRightWristX - rightWrist.x;
        if (movement > 0.15) {
            console.log("PUNCH!");
            document.getElementById("debug").innerText = "👊 PUNCH!";
        }
    }
    lastRightWristX = rightWrist.x;

    // Detect Dodge Left (body shifts left)
    const bodyCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    if (lastLeftShoulderX !== null) {
        const shift = lastLeftShoulderX - bodyCenterX;

        if (shift > 0.05) {
            console.log("DODGE RIGHT");
            document.getElementById("debug").innerText = "➡️ DODGE RIGHT!";
        }
        if (shift < -0.05) {
            console.log("DODGE LEFT");
            document.getElementById("debug").innerText = "⬅️ DODGE LEFT!";
        }
    }
    lastLeftShoulderX = bodyCenterX;
}

function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
        detectMoves(results.poseLandmarks);
    }
}

const pose = new Pose.Pose({
    locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
    modelComplexity: 0,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6
});

pose.onResults(onResults);

const camera = new Camera(video, {
    onFrame: async () => {
        await pose.send({ image: video });
    }
});
camera.start();
