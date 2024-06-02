document.addEventListener('DOMContentLoaded', () => {
    // Constantes para claves de localStorage
    const LOCAL_STORAGE_PLAYERS_KEY = 'players';
    const LOCAL_STORAGE_ADDITIONAL_FEATURES_KEY = 'additionalFeatures';
    const LOCAL_STORAGE_INJURY_HISTORY_KEY = 'injuryHistory';

    // Elementos del DOM
    const registerPlayerLink = document.getElementById('register-player');
    const registeredPlayersLink = document.getElementById('registered-players');
    const injuredPlayersLink = document.getElementById('injured-players');
    const injuredHistoryLink = document.getElementById('injured-history');
    const registerSection = document.getElementById('register-section');
    const registeredSection = document.getElementById('registered-section');
    const injuredSection = document.getElementById('injured-section');
    const injuredHistorySection = document.getElementById('injured-history-section');
    const playerForm = document.getElementById('player-form');
    const playersHeader = document.getElementById('players-header');
    const playersList = document.getElementById('players-list');
    const injuredHeader = document.getElementById('injured-header');
    const injuredList = document.getElementById('injured-list');
    const injuredHistoryList = document.getElementById('injured-history-list');
    const additionalFeaturesContainer = document.getElementById('additional-features');
    const featureForm = document.getElementById('feature-form');
    const newFeatureInput = document.getElementById('new-feature');
    const addFeatureButton = document.getElementById('add-feature');
    const searchInput = document.getElementById('search');
    const exportCsvButton = document.getElementById('export-csv');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete');
    const cancelDeleteButton = document.getElementById('cancel-delete');

    // Estado de la aplicación
    let players = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PLAYERS_KEY)) || [];
    let additionalFeatures = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ADDITIONAL_FEATURES_KEY)) || [];
    let playerIndexToDelete = null;
    let injuryHistory = JSON.parse(localStorage.getItem(LOCAL_STORAGE_INJURY_HISTORY_KEY)) || [];

    // Configuración de toastr
    toastr.options = {
        closeButton: true,
        debug: false,
        newestOnTop: true,
        progressBar: true,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        onclick: null,
        showDuration: '300',
        hideDuration: '1000',
        timeOut: '5000',
        extendedTimeOut: '1000',
        showEasing: 'swing',
        hideEasing: 'linear',
        showMethod: 'fadeIn',
        hideMethod: 'fadeOut'
    };

    // Funciones
    const showSection = (section) => {
        registerSection.classList.remove('active');
        registeredSection.classList.remove('active');
        injuredSection.classList.remove('active');
        injuredHistorySection.classList.remove('active');
        section.classList.add('active');
    };

    const renderAdditionalFeatures = () => {
        additionalFeaturesContainer.innerHTML = '';
        additionalFeatures.forEach(feature => {
            const featureLabel = document.createElement('label');
            featureLabel.textContent = `${feature}:`;
            const featureInput = document.createElement('input');
            featureInput.type = 'text';
            featureInput.classList.add('feature-input');
            featureInput.dataset.featureName = feature;
            additionalFeaturesContainer.appendChild(featureLabel);
            additionalFeaturesContainer.appendChild(featureInput);
        });
    };

    const renderTableHeaders = () => {
        const createHeaderRow = () => {
            const headerRow = document.createElement('tr');
            ['Nombre', 'Edad', 'Posición', ...additionalFeatures, 'Acciones'].forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            return headerRow;
        };

        playersHeader.innerHTML = '';
        injuredHeader.innerHTML = '';

        playersHeader.appendChild(createHeaderRow());
        injuredHeader.appendChild(createHeaderRow().cloneNode(true));
    };

    const createPlayerRow = (player, index) => {
        const playerRow = document.createElement('tr');
        const playerData = [player.name, player.age, player.position, ...additionalFeatures.map(feature => player[feature] || '')];

        playerData.forEach(data => {
            const td = document.createElement('td');
            td.textContent = data;
            playerRow.appendChild(td);
        });

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => editPlayer(index));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.addEventListener('click', () => {
            playerIndexToDelete = index;
            confirmModal.style.display = 'block';
        });

        const actionsTd = document.createElement('td');
        actionsTd.appendChild(editButton);
        actionsTd.appendChild(deleteButton);
        playerRow.appendChild(actionsTd);

        return playerRow;
    };

    const displayPlayers = (query = '') => {
        const filterPlayers = (player) => player.name.toLowerCase().includes(query) || player.position.toLowerCase().includes(query);

        playersList.innerHTML = '';
        injuredList.innerHTML = '';
        injuredHistoryList.innerHTML = '';

        players.filter(filterPlayers).forEach((player, index) => {
            const playerRow = createPlayerRow(player, index);
            (player.injured ? injuredList : playersList).appendChild(playerRow);
        });

        injuryHistory.forEach((record) => {
            const historyRow = document.createElement('tr');
            [record.name, record.age, record.position, record.injuryDate].forEach(data => {
                const td = document.createElement('td');
                td.textContent = data;
                historyRow.appendChild(td);
            });
            injuredHistoryList.appendChild(historyRow);
        });
    };

    const exportToCsv = (filename, data) => {
        const headers = ['Nombre', 'Edad', 'Posición', ...additionalFeatures, 'Lesionado'];
        const csvData = [headers.join(',')];
        data.forEach(player => {
            const row = [player.name, player.age, player.position, ...additionalFeatures.map(feature => player[feature] || ''), player.injured ? 'Sí' : 'No'];
            csvData.push(row.join(','));
        });

        const blob = new Blob([csvData.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const editPlayer = (index) => {
        const player = players[index];
        document.getElementById('name').value = player.name;
        document.getElementById('age').value = player.age;
        document.getElementById('position').value = player.position;
        document.getElementById('injured').checked = player.injured;
        additionalFeatures.forEach(feature => {
            document.querySelector(`.feature-input[data-feature-name="${feature}"]`).value = player[feature] || '';
        });
        players.splice(index, 1);
        localStorage.setItem(LOCAL_STORAGE_PLAYERS_KEY, JSON.stringify(players));
        displayPlayers();
        toastr.info('Jugador listo para editar');
    };

    // Event Listeners
    registerPlayerLink.addEventListener('click', () => showSection(registerSection));
    registeredPlayersLink.addEventListener('click', () => showSection(registeredSection));
    injuredPlayersLink.addEventListener('click', () => showSection(injuredSection));
    injuredHistoryLink.addEventListener('click', () => showSection(injuredHistorySection));

    featureForm.addEventListener('submit', (e) => e.preventDefault());

    addFeatureButton.addEventListener('click', () => {
        const featureName = newFeatureInput.value.trim();
        if (featureName && !additionalFeatures.includes(featureName)) {
            additionalFeatures.push(featureName);
            localStorage.setItem(LOCAL_STORAGE_ADDITIONAL_FEATURES_KEY, JSON.stringify(additionalFeatures));
            renderAdditionalFeatures();
            newFeatureInput.value = '';
            renderTableHeaders();
            toastr.success('Característica agregada correctamente');
        } else {
            toastr.error('Característica ya existe o es inválida');
        }
    });

    searchInput.addEventListener('input', () => displayPlayers(searchInput.value.toLowerCase()));

    exportCsvButton.addEventListener('click', () => {
        exportToCsv('jugadores.csv', players);
        toastr.success('Lista de jugadores exportada a CSV');
    });

    confirmDeleteButton.addEventListener('click', () => {
        if (playerIndexToDelete !== null) {
            players.splice(playerIndexToDelete, 1);
            localStorage.setItem(LOCAL_STORAGE_PLAYERS_KEY, JSON.stringify(players));
            displayPlayers();
            playerIndexToDelete = null;
            toastr.success('Jugador eliminado correctamente');
        }
        confirmModal.style.display = 'none';
    });

    cancelDeleteButton.addEventListener('click', () => {
        playerIndexToDelete = null;
        confirmModal.style.display = 'none';
    });

    playerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const age = document.getElementById('age').value.trim();
        const position = document.getElementById('position').value.trim();
        const injured = document.getElementById('injured').checked;

        if (!name || !age || !position) {
            toastr.error('Por favor complete todos los campos obligatorios.');
            return;
        }

        const additionalFeatureValues = {};
        document.querySelectorAll('.feature-input').forEach(input => {
            additionalFeatureValues[input.dataset.featureName] = input.value.trim();
        });

        const player = { name, age, position, injured, ...additionalFeatureValues };
        players.push(player);
        localStorage.setItem(LOCAL_STORAGE_PLAYERS_KEY, JSON.stringify(players));

        if (injured) {
            const injuryRecord = { ...player, injuryDate: new Date().toLocaleDateString() };
            injuryHistory.push(injuryRecord);
            localStorage.setItem(LOCAL_STORAGE_INJURY_HISTORY_KEY, JSON.stringify(injuryHistory));
        }

        displayPlayers();
        playerForm.reset();
        renderAdditionalFeatures();
        toastr.success('Jugador registrado correctamente');
    });

    // Inicializar la aplicación
    renderAdditionalFeatures();
    renderTableHeaders();
    displayPlayers();
});
