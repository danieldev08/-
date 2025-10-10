const skeleton = document.querySelector('.skeleton');

// Левая рука
const leftUpper = document.querySelector('.upper-arm.left');
const leftFore = document.querySelector('.forearm.left');
const leftHand = document.querySelector('.hand.left');
const head = document.querySelector('.head');

// Правая рука
const rightUpper = document.querySelector('.upper-arm.right');
const rightFore = document.querySelector('.forearm.right');
const rightHand = document.querySelector('.hand.right');

// Ноги
const legs = document.getElementById('legs');
const legFrames = ['media/nogi1.png','media/nogi2.png','media/nogi3.png'];
let legFrame = 0;

// Положение скелета по вертикали
let posY = -300;
let step = 0;

// ===== Переменная для движения рук в глубину =====
let armTime = 0;

function animateSkeleton() {
    step += 0.05;
    armTime += 0.05;

    // ===== Движение рук вперед-назад (в глубину) =====
    const leftDepth = Math.sin(armTime) * 0.15;
    const rightDepth = Math.sin(armTime + Math.PI) * 0.15;

    // Левая рука — вперед
    leftUpper.style.transform = `scale(${1 + leftDepth * 0.2})`;
    leftFore.style.transform = '';
    leftHand.style.transform = '';

    // Правая рука — назад
    rightUpper.style.transform = `scale(${1 + rightDepth * 0.2})`;
    rightFore.style.transform = '';
    rightHand.style.transform = '';

    // ===== Движение головы =====
    const headTiltX = Math.sin(step) * 3;
    const headTiltY = Math.cos(step * 2) * 2;
    head.style.transform = `translate(${headTiltX}px, ${headTiltY}px) rotate(${Math.sin(step) * 2}deg)`;

    // ===== Ноги =====
    if (step % 1.5 < 0.05) {
        legs.src = legFrames[legFrame];
        legFrame = (legFrame + 1) % legFrames.length;
    }

    // ===== Движение скелета сверху вниз =====
    posY += 0.8;
    if(posY > window.innerHeight) posY = -500;
    skeleton.style.top = posY + 'px';

    requestAnimationFrame(animateSkeleton);
}

animateSkeleton();
