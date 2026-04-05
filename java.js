
        function clearAnimationRecursively(root) {
        if (!root) return;
        const nodes = [root, ...Array.from(root.querySelectorAll('*'))];
        nodes.forEach(n => {
        try { n.style.animation = 'none'; n.style.transition = ''; } catch (e) {}
    });
        void root.offsetWidth;
        nodes.forEach(n => { try { n.style.animation = ''; } catch (e) {} });
    }

        function resetTurningCarStateAsync(carEl, views = [], wheels = [], startX, startY) {
        return new Promise(resolve => {
        if (!carEl) return resolve();
        carEl.classList.remove('path-L2C','path-C2D','path-B2C','path-C2R');
        clearAnimationRecursively(carEl);
        (views || []).forEach(v => v.classList.add('hidden'));
        (wheels || []).forEach(w => { w.style.opacity = '0'; w.classList.remove('spinning'); w.style.transform = 'none'; });
        if (typeof startX === 'number') carEl.style.left = startX + 'px';
        if (typeof startY === 'number') carEl.style.top = startY + 'px';
        carEl.style.transform = '';
        carEl.style.right = '';
        carEl.style.display = 'block';
            carEl.style.opacity = '1';
            carEl.style.visibility = 'visible';
        carEl.style.opacity = '1';
        requestAnimationFrame(() => setTimeout(resolve, 16));
    });
    }

        // ---- Sprite update for vertical cars ----
        function updateVerticalCarSprites() {
        if (currentScenario === 4) {
        restoreVerticalCarOriginalSprites();
        return;
    }

        const frameTopToBottom = 'car_yogurt_1.png';
        const frameBottomToTop = 'car_yogurt_3.png';

        carsVertical.forEach(c => {
        if (c.classList.contains('car-vertical-unique-tb') || c.classList.contains('car-vertical-unique-bt')) return;
        const img = c.querySelector('img');
        if (!img) return;
        if (img.dataset && img.dataset.originalNoOverride === 'true') return;

        if (c.classList.contains('top-to-bottom')) {
        const name = img.src.split('/').pop();
        if (name !== frameTopToBottom) img.src = 'media/' + frameTopToBottom;
        return;
    }
        if (c.classList.contains('bottom-to-top')) {
        const name = img.src.split('/').pop();
        if (name !== frameBottomToTop) img.src = 'media/' + frameBottomToTop;
        return;
    }

        const rect = c.getBoundingClientRect();
        const mid = window.innerWidth / 2;
        if (rect.left + rect.width / 2 < mid) {
        const name = img.src.split('/').pop();
        if (name !== frameTopToBottom) img.src = 'media/' + frameTopToBottom;
    } else {
        const name = img.src.split('/').pop();
        if (name !== frameBottomToTop) img.src = 'media/' + frameBottomToTop;
    }
    });
    }

        function restoreVerticalCarOriginalSprites() {
        carsVertical.forEach(c => {
            const img = c.querySelector('img');
            if (!img) return;
            if (img.dataset && img.dataset.origSrc) {
                const orig = img.dataset.origSrc;
                if (!img.src.endsWith(orig)) {
                    img.src = orig;
                }
            }
        });
    }

        // ---- Cache DOM ----
        const carsHorizontal = Array.from(document.querySelectorAll('.car-horizontal'));
        const carsVertical = Array.from(document.querySelectorAll('.car-vertical'));
        const pedestriansH = Array.from(document.querySelectorAll('.pedestrian-horizontal'));
        const pedestriansV = Array.from(document.querySelectorAll('.pedestrian-vertical'));
        const pedestriansUniqueH = Array.from(document.querySelectorAll('.pedestrian-horizontal-unique'));
        const pedestriansUniqueV = Array.from(document.querySelectorAll('.pedestrian-vertical-unique'));
        const pedestriansReverse = Array.from(document.querySelectorAll('.pedestrian-vertical-reverse, .pedestrian-vertical-reverse-unique'));
        const skeletonsAll = Array.from(document.querySelectorAll('.skeleton, .skeleton2'));
        const buttons = Array.from(document.querySelectorAll('#scenarios-controls button'));
        const activeScenarioLabel = document.getElementById('active-scenario');

        const turningCar = document.getElementById('yogurt-turning-car');
        const mainSide = turningCar.querySelector('.view-side');
        const mainRotate = turningCar.querySelector('.view-rotate');
        const mainFront = turningCar.querySelector('.view-front');
        const mainWheels = Array.from(turningCar.querySelectorAll('.wheel'));

        const turningCarReverse = document.getElementById('yogurt-turning-car-reverse');
        const revFront = turningCarReverse.querySelector('.view-front');
        const revRotate = turningCarReverse.querySelector('.view-rotate');
        const revSide = turningCarReverse.querySelector('.view-side');
        const revWheels = Array.from(turningCarReverse.querySelectorAll('.wheel'));

        const allAnimatedElements = [
        ...carsHorizontal, ...carsVertical,
        ...pedestriansH, ...pedestriansV,
        ...pedestriansUniqueH, ...pedestriansUniqueV,
        ...pedestriansReverse
        ];

        // сохраняем процент top у горизонтальных машин для фильтрации
        carsHorizontal.forEach(car => {
        const topVal = car.style.top ? parseFloat(car.style.top) : NaN;
        car.dataset.topPercent = isNaN(topVal) ? 1000 : topVal;
    });

        // Сохраняем оригинальные src вертикальных машин
        carsVertical.forEach(c => {
        const img = c.querySelector('img');
        if (!img) return;
        const attr = img.getAttribute('src') || '';
        img.dataset.origSrc = attr;
    });

        const pedestriansData = [...pedestriansH, ...pedestriansUniqueH].map(ped => {
        const left = ped.style.left ? parseFloat(ped.style.left) : Math.random() * 90;
        const top = ped.style.top ? parseFloat(ped.style.top) : 100 + Math.random() * 50;
        const speed = Math.random() * 0.03 + 0.02;
        return { el: ped, left, top, speed };
    });

        // initial setup: ставим начальные offscreen-позиции и paused
        [...pedestriansV, ...pedestriansUniqueV].forEach(p => {
        if (!p.dataset.init) {
        p.style.opacity = 0;
        p.classList.add('paused');
        p.dataset.init = '1';
    }
    });

        pedestriansReverse.forEach(p => {
        if (!p.dataset.init) {
        p.style.transform = 'translate(50vw, 100vh) scale(0.12)';
        p.style.opacity = 0;
        p.classList.add('paused');
        p.dataset.init = '1';
    }
    });

        carsHorizontal.forEach(c => {
        if (!c.dataset.init) {
        c.style.transform = 'translateX(-10vw) scale(0.05)';
        c.style.opacity = 0;
        c.classList.add('paused');
        c.dataset.init = '1';
    }
    });

        carsVertical.forEach(c => {
        if (!c.dataset.init) {
        c.style.transform = 'translateY(-10vh) scale(0.05)';
        c.style.opacity = 0;
        c.classList.add('paused');
        c.dataset.init = '1';
    }
    });


        // Скрываем головы/туловища по умолчанию (CSS уже сделал visibility:hidden),
        // но на всякий случай синхронизируем inline-стили (кросс-браузер)
        skeletonsAll.forEach(sk => {
        const head = sk.querySelector('.head');
        const torso = sk.querySelector('.torso');
        if (head) head.style.visibility = 'hidden';
        if (torso) torso.style.visibility = 'hidden';
    });

        function showWheels(wheels, show) {
        wheels.forEach(w => {
            w.style.opacity = show ? '1' : '0';
            if (show) w.classList.add('spinning'); else w.classList.remove('spinning');
        });
    }

        // --- Регулировщик: загрузка поз и переключение ---
        const regulatorImg = document.getElementById('regulator-sprite');
        const regulatorMap = {
        // mapping scenarios -> filenames (положите эти файлы в media/)
        1: 'Gemini_Generated_Image_izaf8hizaf8hizaf (1).png', // сценарий 1 — правая рука вперед
        2: '',  // сценарий 2 — можно изменить при желании
        3: 'Gemini_Generated_Image_tnim8btnim8btnim.png',    // сценарий 3 — рука вверх (стоп)
        4: 'Gemini_Generated_Image_3bwzd33bwzd33bwz.png'   // сценарий 4 — нейтраль / руки по линии
    };
        let _regPreloaded = false;

        function tryLoad(src) {
        return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => resolve(null);
        img.src = 'media/' + src;
    });
    }

        async function preloadRegulatorImages() {
        const names = Array.from(new Set(Object.values(regulatorMap)));
        for (const n of names) {
        // eslint-disable-next-line no-await-in-loop
        await tryLoad(n);
    }
        _regPreloaded = true;
    }

        async function setRegulatorPose(scenarioNumber) {
        if (!_regPreloaded) await preloadRegulatorImages();
        const fname = regulatorMap[scenarioNumber] || regulatorMap[4] || Object.values(regulatorMap)[0];
        if (!fname) return;
        regulatorImg.style.opacity = '0';
        setTimeout(() => {
        regulatorImg.src = 'media/' + fname;
        regulatorImg.style.opacity = '1';
    }, 120);
    }
        // --- конец регулятора ---

        // ---- MAIN arc (right -> center -> arc down -> down) ----
        let mainRAF = null, mainCycleTimeout = null;
        let mainCancelled = false;
        const mainParams = {
        startXOffset: 420,
        startY: Math.round(window.innerHeight * 0.25),
        moveLeftSpeed: 1.8,
        centerX: Math.round(window.innerWidth * 0.5),
        arcControlX: 80,
        arcDeltaY: 200,
        arcStep: 0.01,
        moveDownSpeed: 1.6,
        exitPadding: 200,
        pauseBetweenCycles: 600
    };

        function showMainFrame(which) {
        mainSide.classList.add('hidden');
        mainRotate.classList.add('hidden');
        mainFront.classList.add('hidden');

        if (which === 'side') mainSide.classList.remove('hidden');
        if (which === 'turn') mainRotate.classList.remove('hidden');
        if (which === 'front') mainFront.classList.remove('hidden');

        showWheels(mainWheels, which === 'side' || which === 'turn');

        const img = mainSide.querySelector('img'); if (img) img.style.transform = 'scaleX(1)';
    }

        function stopMainArc() {
        mainCancelled = true;
        if (mainRAF) { cancelAnimationFrame(mainRAF); mainRAF = null; }
        if (mainCycleTimeout) { clearTimeout(mainCycleTimeout); mainCycleTimeout = null; }
        if (!turningCar) return;
        turningCar.style.display = 'none';
        [mainSide, mainRotate, mainFront].forEach(v => v.classList.add('hidden'));
        showWheels(mainWheels, false);
        const startX = window.innerWidth + mainParams.startXOffset;
        const startY = mainParams.startY;
        resetTurningCarStateAsync(turningCar, [mainSide, mainRotate, mainFront], mainWheels, startX, startY);
    }

        async function startMainArc() {
        if (!turningCar) return;
        stopMainArc();

        const startX = window.innerWidth + mainParams.startXOffset;
        const startY = mainParams.startY;
        await resetTurningCarStateAsync(turningCar, [mainSide, mainRotate, mainFront], mainWheels, startX, startY);

        mainCancelled = false;
        turningCar.style.display = 'block';
        turningCar.style.left = startX + 'px';
        turningCar.style.top = startY + 'px';
        turningCar.style.opacity = '1';
        turningCar.style.transition = '';

        showMainFrame('side');

        let x = startX, y = startY;

        function moveLeft() {
        if (mainCancelled) return;
        x -= mainParams.moveLeftSpeed;
        turningCar.style.left = x + 'px';
        showMainFrame('side');

        if (x > mainParams.centerX + 40) {
        mainRAF = requestAnimationFrame(moveLeft);
    } else {
        startArc(x, y);
    }
    }

        function startArc(px, py) {
        let t = 0;
        const p0 = { x: px, y: py };
        const p1 = { x: px - mainParams.arcControlX, y: py + mainParams.arcDeltaY * 0.45 };
        const p2 = { x: px - mainParams.arcControlX * 1.1, y: py + mainParams.arcDeltaY };

        function arcStep() {
        if (mainCancelled) return;
        t = Math.min(1, t + mainParams.arcStep);
        const nx = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const ny = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        turningCar.style.left = nx + 'px';
        turningCar.style.top = ny + 'px';

        if (t < 0.25) showMainFrame('side');
        else if (t < 0.8) showMainFrame('turn');
        else showMainFrame('front');

        if (t < 1) mainRAF = requestAnimationFrame(arcStep);
        else moveDown(nx, ny);
    }
        mainRAF = requestAnimationFrame(arcStep);
    }

        function moveDown(currX, currY) {
        let posX = currX, posY = currY;
        function stepDown() {
        if (mainCancelled) return;
        posY += mainParams.moveDownSpeed;
        posX -= 0.2;
        turningCar.style.left = posX + 'px';
        turningCar.style.top = posY + 'px';
        showMainFrame('front');

        if (posY < window.innerHeight + mainParams.exitPadding) {
        mainRAF = requestAnimationFrame(stepDown);
    } else {
        turningCar.style.transition = 'opacity 220ms';
        turningCar.style.opacity = '0';

        mainCycleTimeout = setTimeout(() => {
        stopMainArc();
        setTimeout(() => {
        startMainArc();
    }, 16);
    }, 240);
    }
    }
        mainRAF = requestAnimationFrame(stepDown);
    }

        mainRAF = requestAnimationFrame(moveLeft);
    }

        // ---- REVERSE arc ----
        let revRAF = null, revCycleTimeout = null;
        let revCancelled = false;
        const revParams = {
        startXOffsetFromRight: 520,
        startYOffset: 60,
        upTargetY: Math.round(window.innerHeight * 0.45),
        speedUp: 1.8,
        arcControlY: 100,
        arcDeltaX: 220,
        arcStep: 0.012,
        speedRight: 1.8,
        upDriftX: 0.8,
        exitPadding: 200,
        pauseBetweenCycles: 500
    };

        function showRevFrame(which) {
        revFront.classList.add('hidden');
        revRotate.classList.add('hidden');
        revSide.classList.add('hidden');
        if (which === 'front') revFront.classList.remove('hidden');
        if (which === 'turn') revRotate.classList.remove('hidden');
        if (which === 'side') revSide.classList.remove('hidden');

        showWheels(revWheels, which === 'side');

        if (which === 'side') {
        const img = revSide.querySelector('img');
        if (img) img.style.transform = 'scaleX(-1)';
        revWheels.forEach(w => w.style.transform = 'none');
    } else {
        const img = revSide.querySelector('img');
        if (img) img.style.transform = 'none';
        revWheels.forEach(w => w.style.transform = 'none');
    }
    }

        function stopReverseThreePhase() {
        revCancelled = true;
        if (revRAF) { cancelAnimationFrame(revRAF); revRAF = null; }
        if (revCycleTimeout) { clearTimeout(revCycleTimeout); revCycleTimeout = null; }
        if (!turningCarReverse) return;
        turningCarReverse.style.display = 'none';
        [revFront, revRotate, revSide].forEach(v => v.classList.add('hidden'));
        showWheels(revWheels, false);
        const startX = Math.max(window.innerWidth - revParams.startXOffsetFromRight, 10);
        const startY = window.innerHeight + revParams.startYOffset;
        resetTurningCarStateAsync(turningCarReverse, [revFront, revRotate, revSide], revWheels, startX, startY);
    }

        async function startReverseThreePhase() {
        if (!turningCarReverse) return;
        stopReverseThreePhase();

        // 1. Стартовая точка — низ экрана, центр правой полосы (подберите по вашему фону!)
        const centerX = window.innerWidth * 0.61;     // подберите этот коэффициент (0.61) так, чтобы было по полосе (правее центра)
        const startX = centerX;
        const startY = window.innerHeight + 40;       // чуть ниже экрана

        // 2. Точка перед началом дуги (парадный вход на перекрёсток)
        const vertEndY = window.innerHeight * 0.47;    // где начать поворот

        await resetTurningCarStateAsync(turningCarReverse, [revFront, revRotate, revSide], revWheels, startX, startY);

        revCancelled = false;
        turningCarReverse.style.display = 'block';
        turningCarReverse.style.transform = 'scale(0.85)';
        turningCarReverse.style.left = startX + 'px';
        turningCarReverse.style.top = startY + 'px';
        turningCarReverse.style.opacity = '1';

        showRevFrame('front');
        showWheels(revWheels, false);

        let x = startX;
        let y = startY;

        // === 1. Движение строго вверх ===
        function moveUp() {
        if (revCancelled) return;
        y -= 2.3;
        turningCarReverse.style.left = x + 'px';
        turningCarReverse.style.top = y + 'px';
        showRevFrame('front');

        if (y > vertEndY) {
        revRAF = requestAnimationFrame(moveUp);
    } else {
        startRightArc(x, y);
    }
    }

        // === 2. Безье-поворот направо ===
        function startRightArc(px, py) {
        // Безье: p0 = (px, py), p1 — задаёт "радиус поворота", p2 — выход вправо
        let t = 0;
        const arcRadius = 160; // радиус дуги, можно ~120..180 подбирать под фон
        const p0 = { x: px, y: py };
        const p1 = { x: px + arcRadius * 1.0, y: py + 100 }; // точка контроля ~вправо и чуть вниз
        const p2 = { x: px + arcRadius * 2.2, y: py + 100 }; // конечная точка — конец поворота (выезд вправо)

        function arcStep() {
        if (revCancelled) return;
        t = Math.min(1, t + 0.012);
        const nx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
        const ny = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
        turningCarReverse.style.left = nx + 'px';
        turningCarReverse.style.top = ny + 'px';

        // Смена вида: turn → side
        if (t < 0.5) showRevFrame('turn');
        else showRevFrame('side');

        if (t < 1) revRAF = requestAnimationFrame(arcStep);
        else moveRight(nx, ny);
    }
        revRAF = requestAnimationFrame(arcStep);
    }

        // === 3. Прямой участок вправо ===
        function moveRight(currX, currY) {
        let posX = currX, posY = currY;
        function stepRight() {
        if (revCancelled) return;
        posX += 2.6; // скорость вправо
        turningCarReverse.style.left = posX + 'px';
        turningCarReverse.style.top = posY + 'px';
        showRevFrame('side');
        if (posX < window.innerWidth + 200) {
        revRAF = requestAnimationFrame(stepRight);
    } else {
        finish();
    }
    }
        revRAF = requestAnimationFrame(stepRight);
    }

        function finish() {
        turningCarReverse.style.transition = 'opacity 180ms';
        turningCarReverse.style.opacity = '0';
        revCycleTimeout = setTimeout(() => {
        stopReverseThreePhase();
        setTimeout(startReverseThreePhase, 32);
    }, 180);
    }

        // Старт движения!
        revRAF = requestAnimationFrame(moveUp);
    }

        // ---- legs / arms / pedestrians ----
        const legFrames = ['media/nogi1.png','media/nogi2.png','media/nogi3.png'];
        let legFrame = 0;
        let legTimer = 0;
        const skeletonLegImgs = Array.from(document.querySelectorAll('.legs-container img'));

        function animateLegs(delta) {
        legTimer += delta;
        if (legTimer > 0.3) {
        legFrame = (legFrame + 1) % legFrames.length;
        const src = legFrames[legFrame];
        skeletonLegImgs.forEach(img => { try { if (img && img.src.indexOf(src) === -1) img.src = src; } catch(e) {} });
        legTimer = 0;
    }
    }

        function animateArmsForAll(time) {
        const scaleBase = 1 + Math.sin(time * 0.005) * 0.02;
        document.querySelectorAll('.skeleton, .skeleton2').forEach(sk => {
        const armL = sk.querySelector('.arm.left');
        const armR = sk.querySelector('.arm.right');
        if (armL) armL.style.transform = `scaleY(${scaleBase})`;
        if (armR) armR.style.transform = `scaleY(${scaleBase})`;
    });
    }

        function animatePedestrianHorizontalMovement(time) {
        for (let i = 0; i < pedestriansData.length; i++) {
        const p = pedestriansData[i];
        let top = p.top - p.speed;
        if (top < -110) top = 110;
        p.top = top;
        const scalePed = 0.07 + (1 - top / 100) * 0.05;
        p.el.style.transform = `translateX(${p.left}vw) translateY(${top}vh) scale(${scalePed})`;
    }
    }

        function hardResetAnimations() {
        const animations = allAnimatedElements.map(el => getComputedStyle(el).animation);
        requestAnimationFrame(() => {
        allAnimatedElements.forEach(el => el.style.animation = 'none');
        requestAnimationFrame(() => allAnimatedElements.forEach((el, i) => el.style.animation = animations[i] || ''));
    });
    }

        // ---- scenarios ----
        const scenarios = {
        1: {name:'Руки в стороны', horizontalCars:'top-only', verticalCars:'stop', pedestriansH:'unique-only', pedestriansV:'stop'},
        2: {name:'Правая рука вперед', horizontalCars:'go', verticalCars:'stop', pedestriansH:'stop', pedestriansV:'go'},
        3: {name:'Рука вверх', horizontalCars:'stop', verticalCars:'stop', pedestriansH:'stop', pedestriansV:'stop'},
        4: {name:'Свободный режим', horizontalCars:'stop', verticalCars:'go', pedestriansH:'stop', pedestriansV:'go'}
    };

        function setElementsState(elems, running) {
        for (let i = 0; i < elems.length; i++) {
        const el = elems[i];
        if (running) {
        el.classList.remove('paused');
        el.style.animationPlayState = 'running';
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        // Если это скелет — делаем видимыми head/torso
        if (el.classList.contains('skeleton') || el.classList.contains('skeleton2')) {
        const head = el.querySelector('.head');
        const torso = el.querySelector('.torso');
        if (head) head.style.visibility = 'visible';
        if (torso) torso.style.visibility = 'visible';
    }
    } else {
        el.classList.add('paused');
        el.style.animationPlayState = 'paused';
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        if (el.classList.contains('skeleton') || el.classList.contains('skeleton2')) {
        const head = el.querySelector('.head');
        const torso = el.querySelector('.torso');
        if (head) head.style.visibility = 'hidden';
        if (torso) torso.style.visibility = 'hidden';
    }
    }
    }
    }

        // ---- Safe reset for pedestrians (does not touch large non-animated items) ----
        function safeResetPedestriansAnimations() {
        const sel = [
        '.pedestrian-horizontal',
        '.pedestrian-horizontal-unique',
        '.pedestrian-vertical',
        '.pedestrian-vertical-unique',
        '.pedestrian-vertical-reverse',
        '.pedestrian-vertical-reverse-unique'
        ].join(',');

        const nodes = Array.from(document.querySelectorAll(sel));
        nodes.forEach(el => {
        // skip very large elements (prevent touching big foreground sprites)
        const r = el.getBoundingClientRect();
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        if (r.width > maxDim * 0.6 || r.height > maxDim * 0.6) return;

        // Only touch elements that actually have a walk animation (avoid unrelated elements)
        const cs = getComputedStyle(el);
        const animName = (cs.animationName || '').toString();
        if (!/walk|walk-horizontal|walk-vertical|drive/i.test(animName)) return;

        el.classList.remove('paused');
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.animationPlayState = 'running';

        // gentle restart of CSS animation
        const prevAnim = el.style.animation || '';
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = prevAnim || '';
        // clear inline translate/scale only if it looks like a start-offset we added
        if (el.style.transform && /translate\(|scale\(/.test(el.style.transform)) {
        el.style.transform = '';
    }
    });

        if (typeof pedestriansData !== 'undefined' && Array.isArray(pedestriansData)) {
        pedestriansData.forEach(d => {
        if (!d || !d.el) return;
        const el = d.el;
        const r = el.getBoundingClientRect();
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        if (r.width > maxDim * 0.6 || r.height > maxDim * 0.6) return;
        el.classList.remove('paused');
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        if (el.style.transform && /translate\(|scale\(/.test(el.style.transform)) el.style.transform = '';
    });
    }

        // Для скелетов: если они видимы по классам, покажем head/torso
        skeletonsAll.forEach(sk => {
        const cs = getComputedStyle(sk);
        const visible = sk.style.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
        const head = sk.querySelector('.head');
        const torso = sk.querySelector('.torso');
        if (visible) {
        if (head) head.style.visibility = 'visible';
        if (torso) torso.style.visibility = 'visible';
    } else {
        if (head) head.style.visibility = 'hidden';
        if (torso) torso.style.visibility = 'hidden';
    }
    });
    }

        // alias for backward-compat (some code calls resetPedestriansAnimations)
        const resetPedestriansAnimations = safeResetPedestriansAnimations;

        // ---- Enforce pedestrian directions by class (safe) ----
        function enforcePedestrianDirectionsByClass() {
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        // front-like verticals -> top-to-bottom
        const frontVerticals = Array.from(document.querySelectorAll('.pedestrian-vertical, .pedestrian-vertical-unique, .skeleton'));
        frontVerticals.forEach(el => {
        try {
        const r = el.getBoundingClientRect();
        if (r.width > maxDim * 0.6 || r.height > maxDim * 0.6) return; // skip giant elements
        el.style.animationDirection = 'normal';
        el.classList.remove('bottom-to-top');
        if (!el.classList.contains('top-to-bottom')) el.classList.add('top-to-bottom');
        el.classList.remove('paused'); el.style.display = 'block'; el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.animationPlayState = 'running';
        const prev = el.style.animation || '';
        el.style.animation = 'none'; void el.offsetWidth; el.style.animation = prev || '';
        const head = el.querySelector && el.querySelector('.head');
        const torso = el.querySelector && el.querySelector('.torso');
        if (head && torso) { head.style.zIndex = 10; torso.style.zIndex = 5; head.style.visibility = 'visible'; torso.style.visibility = 'visible'; }
    } catch (e) {}
    });

        // back-like verticals -> bottom-to-top (reverse)
        const backVerticals = Array.from(document.querySelectorAll('.pedestrian-vertical-reverse, .pedestrian-vertical-reverse-unique, .skeleton2'));
        backVerticals.forEach(el => {
        try {
        const r = el.getBoundingClientRect();
        if (r.width > maxDim * 0.6 || r.height > maxDim * 0.6) return; // skip giant elements
        el.style.animationDirection = 'reverse';
        el.classList.remove('top-to-bottom');
        if (!el.classList.contains('bottom-to-top')) el.classList.add('bottom-to-top');
        el.classList.remove('paused'); el.style.display = 'block'; el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.animationPlayState = 'running';
        const prev = el.style.animation || '';
        el.style.animation = 'none'; void el.offsetWidth; el.style.animation = prev || '';
        const head = el.querySelector && el.querySelector('.head');
        const torso = el.querySelector && el.querySelector('.torso');
        if (head && torso) { head.style.zIndex = 5; torso.style.zIndex = 10; head.style.visibility = 'visible'; torso.style.visibility = 'visible'; }
    } catch (e) {}
    });
    }

        // current scenario store
        let currentScenario = null;

        function applyScenario(n) {
        currentScenario = n;
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-gesture="${n}"]`)?.classList.add('active');
        activeScenarioLabel.textContent = `Сценарий: ${scenarios[n].name}`;

        stopMainArc();
        stopReverseThreePhase();
        hardResetAnimations();

        setTimeout(() => {
        if (scenarios[n].horizontalCars === 'go') setElementsState(carsHorizontal, true);
        else if (scenarios[n].horizontalCars === 'top-only') {
        carsHorizontal.forEach(car => {
        const t = parseFloat(car.dataset.topPercent || 1000);
        setElementsState([car], t <= 25);
    });
    } else setElementsState(carsHorizontal, false);

        // vertical cars on/off
        setElementsState(carsVertical, scenarios[n].verticalCars === 'go');

        if (n === 4) {
        // pedestrians: horizontal off, vertical on
        setElementsState(pedestriansH, false);
        setElementsState(pedestriansUniqueH, false);

        setElementsState(pedestriansV, true);
        setElementsState(pedestriansUniqueV, true);
        setElementsState(pedestriansReverse, true);

        // set animationDirection by side (but we'll later enforce by class)
        const midX = window.innerWidth / 2;
        const verticalEls = [
        ...document.querySelectorAll('.pedestrian-vertical, .pedestrian-vertical-unique, .pedestrian-vertical-reverse, .pedestrian-vertical-reverse-unique')
        ];
        verticalEls.forEach(el => {
        const r = el.getBoundingClientRect();
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        if (r.width > maxDim * 0.6 || r.height > maxDim * 0.6) return;
        el.classList.remove('paused'); el.style.display = 'block'; el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.animationPlayState = 'running';
        const centerX = r.left + r.width / 2;
        if (centerX > midX) el.style.animationDirection = 'reverse';
        else el.style.animationDirection = 'normal';
        const prev = el.style.animation || '';
        el.style.animation = 'none'; void el.offsetWidth; el.style.animation = prev || '';
    });

        if (Array.isArray(window.pedestriansData)) {
        window.pedestriansData.forEach(d => {
        if (!d || !d.el) return;
        d.el.classList.add('paused');
        d.el.style.left = '-120vw';           // вместо display:none
        d.el.style.opacity = '0';
        d.el.style.visibility = 'hidden';
    });
    }
    }

        // update car sprites
        updateVerticalCarSprites();

        // enforce pedestrian directions using class (this ensures front/back behave correctly)
        enforcePedestrianDirectionsByClass();

        // reset small pedestrian animations safely
        resetPedestriansAnimations();

        if (scenarios[n].pedestriansH === 'go' || scenarios[n].pedestriansH === 'all') {
        setElementsState(pedestriansH, true); setElementsState(pedestriansUniqueH, true);
    } else if (scenarios[n].pedestriansH === 'unique-only') {
        setElementsState(pedestriansUniqueH, true);
        const normalH = pedestriansH.filter(el => !el.classList.contains('pedestrian-horizontal-unique'));
        setElementsState(normalH, false);
    } else {
        setElementsState(pedestriansH, false); setElementsState(pedestriansUniqueH, false);
    }

        const isVertGo = scenarios[n].pedestriansV === 'go';
        setElementsState(pedestriansV, isVertGo);
        setElementsState(pedestriansUniqueV, isVertGo);
        setElementsState(pedestriansReverse, isVertGo);

        if (n == 1) {
        startMainArc();
        startReverseThreePhase();
    }

        // Поменять позу регулятора (по ПДД-назначению, как вы просили).
        // Согласно вашим указаниям:
        // 1 — правая рука вперед, 3 — стоп (рука вверх), 4 — по линии рук (нейтраль).
        setRegulatorPose(n);
    }, 50);
    }

        buttons.forEach(btn => btn.addEventListener('click', () => applyScenario(parseInt(btn.dataset.gesture, 10))));

        // main loop
        let lastTime = performance.now();
        function animate(time) {
        const delta = (time - lastTime) / 1000 || 0;
        lastTime = time;

        animateLegs(delta);
        animateArmsForAll(time);
        animatePedestrianHorizontalMovement(time);

        for (let i = 0; i < skeletonsAll.length; i++) {
        const sk = skeletonsAll[i];
        const head = sk.querySelector('.head');
        if (head) head.style.transform = `rotate(${Math.sin(time * 0.003) * 5}deg)`;
    }

        requestAnimationFrame(animate);
    }

        requestAnimationFrame(animate);

        // start default
        applyScenario(1);
        updateVerticalCarSprites();
        enforcePedestrianDirectionsByClass();
        resetPedestriansAnimations();

        // preload regulator poses early
        preloadRegulatorImages();

        // on resize update params and sprites
        window.addEventListener('resize', () => {
        mainParams.centerX = Math.round(window.innerWidth * 0.5);
        mainParams.startY = Math.round(window.innerHeight * 0.35);
        revParams.upTargetY = Math.round(window.innerHeight * 0.45);

        setTimeout(() => {
        if (currentScenario !== 4) updateVerticalCarSprites();
        enforcePedestrianDirectionsByClass();
        resetPedestriansAnimations();
    }, 50);
    });