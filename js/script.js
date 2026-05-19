let control = false;
let playMusic = true;
let gameStarted = false;
let gameMusic = new Audio('audio/el_pollo_loco.mp3');
let fullscreenMode = false;

function startGame() {
    showGame();
    gameStarted = true;
    checkPlayMusic();
    showResponsiveBtn();

    if (fullscreenMode) {
        showCanvasinFull();
        showNavinFull();
    }
}

function showGame() {
    let canvas = document.getElementById('canvas');
    let startScreen = document.getElementById('first-screen');
    let gameNav = document.getElementById('game-nav');

    canvas.classList.remove('d-none');
    startScreen.classList.add('d-none');
    gameNav.classList.remove('d-none');
}

function showResponsiveBtn() {
    let mobileControl = document.getElementById('mobile-cont');

    if (!mobileControl) {
        return;
    }

    if ((window.innerHeight < 520 || window.innerWidth < 900) && gameStarted) {
        mobileControl.classList.remove('d-none');
    }
}

function checkPlayMusic() {
    if (playMusic) {
        gameMusic.play().catch(() => {
            console.log('Musik konnte nicht automatisch gestartet werden');
        });
    }
}

function showControl() {
    let controlMenu = document.getElementById('controller-exp');

    if (!control) {
        controlMenu.classList.remove('d-none');
        control = true;
    } else {
        controlMenu.classList.add('d-none');
        control = false;
    }
}

function muteSound() {
    let mute = document.getElementById('mute');
    let unmute = document.getElementById('unmute');
    let muteInGame = document.getElementById('muteInGame');
    let unmuteInGame = document.getElementById('unmuteInGame');

    if (playMusic) {
        gameMusic.pause();
        playMusic = false;
        muteIcon(mute, unmute, muteInGame, unmuteInGame);
    } else {
        if (gameStarted) {
            gameMusic.play().catch(() => {
                console.log('Musik konnte nicht gestartet werden');
            });
        }

        playMusic = true;
        unmuteIcon(mute, unmute, muteInGame, unmuteInGame);
    }
}

function muteIcon(mute, unmute, muteInGame, unmuteInGame) {
    mute.classList.add('d-none');
    unmute.classList.remove('d-none');
    muteInGame.classList.add('d-none');
    unmuteInGame.classList.remove('d-none');
}

function unmuteIcon(mute, unmute, muteInGame, unmuteInGame) {
    mute.classList.remove('d-none');
    unmute.classList.add('d-none');
    muteInGame.classList.remove('d-none');
    unmuteInGame.classList.add('d-none');
}

async function setFullscreen() {
    let fullscreenCont = document.getElementById('canvas-cont');

    if (!fullscreenMode) {
        showCanvasinFull();
        showNavinFull();
        fullscreenMode = true;

        try {
            await enterFullscreen(fullscreenCont);
        } catch (error) {
            console.log('Echter Fullscreen nicht verfügbar, CSS-Fallback aktiv');
        }

        setTimeout(resizeCanvasToViewport, 100);
    } else {
        try {
            await exitFullscreen();
        } catch (error) {
            console.log('Fullscreen konnte nicht beendet werden');
        }

        closeFullCanvas();
        closeFullNav();
        fullscreenMode = false;
    }
}

function showCanvasinFull() {
    let canvasCont = document.getElementById('canvas-cont');
    let headline = document.getElementById('headline');

    document.body.classList.add('fullscreen-fallback');
    canvasCont.classList.add('fullscreen-mode');

    if (headline) {
        headline.classList.add('d-none');
    }

    resizeCanvasToViewport();
}

function closeFullCanvas() {
    let canvas = document.getElementById('canvas');
    let canvasCont = document.getElementById('canvas-cont');
    let headline = document.getElementById('headline');

    document.body.classList.remove('fullscreen-fallback');
    canvasCont.classList.remove('fullscreen-mode');

    canvas.style.width = '';
    canvas.style.height = '';
    canvasCont.style.width = '';
    canvasCont.style.height = '';

    if (headline) {
        headline.classList.remove('d-none');
    }
}

function showNavinFull() {
    let gameNav = document.getElementById('game-nav');

    if (gameNav) {
        gameNav.classList.add('fullscreen-nav');
    }
}

function closeFullNav() {
    let gameNav = document.getElementById('game-nav');

    if (gameNav) {
        gameNav.classList.remove('fullscreen-nav');
    }
}

function resizeCanvasToViewport() {
    let canvasCont = document.getElementById('canvas-cont');

    if (!canvasCont || !canvasCont.classList.contains('fullscreen-mode')) {
        return;
    }

    let width = window.innerWidth;
    let height = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    canvasCont.style.width = `${width}px`;
    canvasCont.style.height = `${height}px`;
}

function enterFullscreen(element) {
    if (!element) {
        return Promise.reject('Kein Fullscreen-Element gefunden');
    }

    if (element.requestFullscreen) {
        return element.requestFullscreen({ navigationUI: 'hide' });
    }

    if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
        return Promise.resolve();
    }

    if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
        return Promise.resolve();
    }

    return Promise.reject('Fullscreen API nicht verfügbar');
}

function exitFullscreen() {
    if (document.fullscreenElement && document.exitFullscreen) {
        return document.exitFullscreen();
    }

    if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        return Promise.resolve();
    }

    if (document.msFullscreenElement && document.msExitFullscreen) {
        document.msExitFullscreen();
        return Promise.resolve();
    }

    return Promise.resolve();
}

function fullscreenchanged() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && fullscreenMode) {
        closeFullCanvas();
        closeFullNav();
        fullscreenMode = false;
    }
}

document.addEventListener('fullscreenchange', fullscreenchanged);
document.addEventListener('webkitfullscreenchange', fullscreenchanged);

window.addEventListener('resize', () => {
    resizeCanvasToViewport();
    showResponsiveBtn();
});

window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        resizeCanvasToViewport();
        showResponsiveBtn();
    }, 300);
});

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeCanvasToViewport);
}