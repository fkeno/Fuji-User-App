// FILE: /Fuji-User-App/Fuji-User-App/src/scripts/app.js

document.addEventListener('DOMContentLoaded', () => {
    const movableWindow = document.getElementById('movableWindow');
    const header = document.getElementById('header');
    const settingsIcon = document.getElementById('settingsIcon');
    const content = document.getElementById('content');
    const settingsContent = document.getElementById('settingsContent');
    const backButton = document.getElementById('backButton');
    const getStartedButton = document.getElementById('getStartedButton');

    let isDragging = false;
    let startX, startY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - movableWindow.offsetLeft;
        startY = e.clientY - movableWindow.offsetTop;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            movableWindow.style.left = `${e.clientX - startX}px`;
            movableWindow.style.top = `${e.clientY - startY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    settingsIcon.addEventListener('click', () => {
        content.style.display = 'none';
        settingsContent.style.display = 'block';
    });

    backButton.addEventListener('click', () => {
        settingsContent.style.display = 'none';
        content.style.display = 'block';
    });

    getStartedButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
});

// Dashboard page functionality
if (window.location.pathname.endsWith('dashboard.html')) {
    const bxpExpButton = document.getElementById('bxpExpButton');
    const wipButton1 = document.getElementById('wipButton1');
    const wipButton2 = document.getElementById('wipButton2');

    bxpExpButton.addEventListener('click', () => {
        // Redirect to BXP/EXP Token Page (placeholder)
        alert('Redirecting to BXP/EXP Token Page...');
    });

    wipButton1.addEventListener('click', () => {
        alert('WIP Button 1 clicked!');
    });

    wipButton2.addEventListener('click', () => {
        alert('WIP Button 2 clicked!');
    });
}