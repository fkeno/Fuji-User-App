// This file contains the JavaScript code that enables the functionality of the movable window.

const movableWindow = document.getElementById('movable-window');
let isDragging = false;
let offsetX, offsetY;

movableWindow.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - movableWindow.getBoundingClientRect().left;
    offsetY = e.clientY - movableWindow.getBoundingClientRect().top;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        movableWindow.style.left = `${e.clientX - offsetX}px`;
        movableWindow.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});