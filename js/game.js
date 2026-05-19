let canvas;
let world
let keyboard = new Keyboard();
function init() {
    canvas = document.getElementById('canvas');
    world = new World(canvas, keyboard);
    console.log('My Character is', world.character);
    responsiveControl();

}

function responsiveControl() {
    goRight();
    goLeft();
    goJump();
    goThrow();
}

function goLeft() {
    let btnLeft = document.getElementById('btnLeft');
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keyboard.LEFT = true;
        }, {passive: false});
        btnLeft.addEventListener('touchend', (e) => {
            e.preventDefault();
            keyboard.LEFT = false;
        }, {passive: false});
    }
}

function goRight() {
    let btnRight = document.getElementById('btnRight');
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keyboard.RIGHT = true;
        }, {passive: false});
        btnRight.addEventListener('touchend', (e) => {
            e.preventDefault();
            keyboard.RIGHT = false;
        }, {passive: false});
    }
}

function goJump() {
    let btnJump = document.getElementById('btnJump');
    if (btnJump) {
        btnJump.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keyboard.UP = true;
        }, {passive: false});
        btnJump.addEventListener('touchend', (e) => {
            e.preventDefault();
            keyboard.UP = false;
        }, {passive: false});
    }
}

function goThrow() {
    let btnThrow = document.getElementById('btnThrow');
    if (btnThrow) {
        btnThrow.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keyboard.D = true;
        }, {passive: false});
        btnThrow.addEventListener('touchend', (e) => {
            e.preventDefault();
            keyboard.D = false;
        }, {passive: false});
    }
}


window.addEventListener("keydown", (e) => {
    if (e.keyCode == '39') {
        keyboard.RIGHT = true;
    }
    if (e.keyCode == '37') {
        keyboard.LEFT = true;
    }
    if (e.keyCode == '38') {
        keyboard.UP = true;
    }
    if (e.keyCode == '40') {
        keyboard.DOWN = true;
    }
    if (e.keyCode == '68') {
        keyboard.D = true;
    }
    if (e.keyCode == '27') {
        keyboard.ESC = true;
    }

});

window.addEventListener("keyup", (e) => {
    if (e.keyCode == '39') {
        keyboard.RIGHT = false;
    }
    if (e.keyCode == '37') {
        keyboard.LEFT = false;
    }
    if (e.keyCode == '38') {
        keyboard.UP = false;
    }
    if (e.keyCode == '40') {
        keyboard.DOWN = false;
    }
    if (e.keyCode == '68') {
        keyboard.D = false;
    }

});



