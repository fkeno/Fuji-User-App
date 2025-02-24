document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const movableWindow = document.getElementById('movableWindow');
    const header = document.getElementById('header');
    const settingsIcon = document.getElementById('settingsIcon');
    const content = document.getElementById('content');
    const dashboardContent = document.getElementById('dashboardContent');
    const expBxpContent = document.getElementById('expBxpContent');
    const getStartedButton = document.getElementById('getStartedButton');
    const expBxpButton = document.getElementById('expBxpButton');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const settingsModal = document.getElementById('settingsModal');
    const feedbackMessage = document.getElementById('feedbackMessage');
    
    let isDragging = false;
    let startX, startY;

    // Load saved position and size
    const savedPosition = localStorage.getItem('movableWindowPosition');
    const savedSize = localStorage.getItem('movableWindowSize');
    if (savedPosition) {
        const { left, top } = JSON.parse(savedPosition);
        movableWindow.style.left = `${left}px`;
        movableWindow.style.top = `${top}px`;
    }
    if (savedSize) {
        const { width, height } = JSON.parse(savedSize);
        movableWindow.style.width = `${width}px`;
        movableWindow.style.height = `${height}px`;
    }

    // Drag functionality for movable window
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - movableWindow.offsetLeft;
        startY = e.clientY - movableWindow.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const left = e.clientX - startX;
            const top = e.clientY - startY;
            movableWindow.style.left = `${left}px`;
            movableWindow.style.top = `${top}px`;
            localStorage.setItem('movableWindowPosition', JSON.stringify({ left, top }));
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Resize functionality for movable window
    const resizeObserver = new ResizeObserver(() => {
        const width = movableWindow.offsetWidth;
        const height = movableWindow.offsetHeight;
        localStorage.setItem('movableWindowSize', JSON.stringify({ width, height }));
    });
    resizeObserver.observe(movableWindow);

    // Settings modal behavior
    settingsIcon.addEventListener('click', () => {
        // Apply the appropriate mode class to the modal based on body class
        if (document.body.classList.contains('dark-mode')) {
            settingsModal.classList.add('dark-mode');
            settingsModal.classList.remove('light-mode');
        } else {
            settingsModal.classList.add('light-mode');
            settingsModal.classList.remove('dark-mode');
        }
        $('#settingsModal').modal('show');
    });
    
    $('#settingsModal').on('hidden.bs.modal', () => {
        // Remove mode classes from the modal after hiding
        settingsModal.classList.remove('dark-mode', 'light-mode');
        // Restore the dashboard alignment
        if (dashboardContent.style.display === 'flex') {
            dashboardContent.style.display = 'flex';
        }
    });

    getStartedButton.addEventListener('click', () => {
        hideAllContent();
        dashboardContent.style.display = 'flex';
    });

    expBxpButton.addEventListener('click', () => {
        hideAllContent();
        expBxpContent.style.display = 'block';
        loadExpBxpContent();
    });

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.classList.add('light-mode');
        }
    });

    function hideAllContent() {
        content.style.display = 'none';
        dashboardContent.style.display = 'none';
        expBxpContent.style.display = 'none';
    }

    function loadExpBxpContent() {
        const expBxpHTML = `
            <p>EXP/BXP in Inventory.</p>
            <input type="text" class="form-control search-bar" id="searchBar" placeholder="Search for items...">
            <button class="window-button btn btn-secondary" id="backToDashboardButton">Back to Dashboard</button>
            <div id="expBxpTable"></div>
        `;
        expBxpContent.innerHTML = expBxpHTML;

        const backToDashboardButton = document.getElementById('backToDashboardButton');
        backToDashboardButton.addEventListener('click', () => {
            hideAllContent();
            dashboardContent.style.display = 'flex';
        });

        // Load the EXP/BXP Token Page content
        window.parent.postMessage({ type: 'getData' }, '*');

        window.addEventListener('message', (event) => {
            const evt = event.data;
            if (evt.data && evt.data.inventory) {
                const inventoryData = JSON.parse(evt.data.inventory);
                const combinedData = {};

                // Combine data for exp_token and exp_token_a
                for (const key in inventoryData) {
                    if (itemNames[key]) {
                        combinedData[key] = inventoryData[key];
                    }
                }

                // Sort the keys alphabetically
                const sortedKeys = Object.keys(combinedData).sort((a, b) => {
                    const nameA = itemNames[a].toUpperCase();
                    const nameB = itemNames[b].toUpperCase();
                    return nameA.localeCompare(nameB);
                });

                function renderTable(filteredKeys) {
                    let inventoryHTML =
                        '<table class="table"><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>';
                    if (filteredKeys.length === 0) {
                        inventoryHTML +=
                            '<tr><td colspan="2">Nothing found in inventory</td></tr>';
                    } else {
                        for (const key of filteredKeys) {
                            const itemName = itemNames[key] || key;
                            const formattedAmount = formatNumber(combinedData[key].amount);
                            inventoryHTML += `<tr><td>${itemName}</td><td>${formattedAmount}</td></tr>`;
                        }
                    }
                    inventoryHTML += '</tbody></table>';
                    document.getElementById('expBxpTable').innerHTML = inventoryHTML;
                }

                renderTable(sortedKeys);

                const searchBar = document.getElementById('searchBar');
                searchBar.addEventListener('input', () => {
                    const searchTerm = searchBar.value.toLowerCase();
                    const filteredKeys = sortedKeys.filter((key) =>
                        itemNames[key].toLowerCase().includes(searchTerm)
                    );
                    renderTable(filteredKeys);
                });

                // Retain search term on inventory update
                const searchTerm = searchBar.value.toLowerCase();
                const filteredKeys = sortedKeys.filter((key) =>
                    itemNames[key].toLowerCase().includes(searchTerm)
                );
                renderTable(filteredKeys);
            }
        });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const itemNames = {
        "exp_token|piloting|piloting": "Airline EXP-Token",
        "exp_token_a|piloting|piloting": "Airline BXP-Token",
        "exp_token|business|business": "Business EXP-Token",
        "exp_token_a|business|business": "Business BXP-Token",
        "exp_token|train|bus": "Bus Driver EXP-Token",
        "exp_token_a|train|bus": "Bus Driver BXP-Token",
        "exp_token|piloting|cargos": "Cargo Pilot EXP-Token",
        "exp_token_a|piloting|cargos": "Cargo Pilot BXP-Token",
        "exp_token|train|train": "Conductor EXP-Token",
        "exp_token_a|train|train": "Conductor BXP-Token",
        "exp_token|ems|ems": "EMS EXP-Token",
        "exp_token_a|ems|ems": "EMS BXP-Token",
        "exp_token|farming|farming": "Farming EXP-Token",
        "exp_token_a|farming|farming": "Farming BXP-Token",
        "exp_token|ems|fire": "Firefighter EXP-Token",
        "exp_token_a|ems|fire": "Firefighter BXP-Token",
        "exp_token|farming|fishing": "Fishing EXP-Token",
        "exp_token_a|farming|fishing": "Fishing BXP-Token",
        "exp_token|trucking|garbage": "Garbage EXP-Token",
        "exp_token_a|trucking|garbage": "Garbage BXP-Token",
        "exp_token|piloting|heli": "Helicopter EXP-Token",
        "exp_token_a|piloting|heli": "Helicopter BXP-Token",
        "exp_token|hunting|skill": "Hunting EXP-Token",
        "exp_token_a|hunting|skill": "Hunting BXP-Token",
        "exp_token|trucking|mechanic": "Mechanic EXP-Token",
        "exp_token_a|trucking|mechanic": "Mechanic BXP-Token",
        "exp_token|farming|mining": "Mining EXP-Token",
        "exp_token_a|farming|mining": "Mining BXP-Token",
        "exp_token|player|player": "Player EXP-Token",
        "exp_token_a|player|player": "Player BXP-Token",
        "exp_token_a|trucking|postop": "PostOP BXP-Token",
        "exp_token|trucking|postop": "PostOP BXP-Token",
        "exp_token_a|player|racing": "Racing BXP-Token",
        "exp_token|player|racing": "Racing BXP-Token",
        "exp_token|physical|strength": "Strength BXP-Token",
        "exp_token_a|physical|strength": "Strength BXP-Token",
        "exp_token|trucking|trucking": "Trucking BXP-Token",
        "exp_token_a|trucking|trucking": "Trucking BXP-Token"
    };
});