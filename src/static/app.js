// static/app.js

async function performSearch() {
    const query = document.getElementById('searchBar').value;
    const limitToFiltered = document.getElementById('filterCheckbox').checked;
    // Pour l'instant, on ne gère que le français comme dans gui.py
    const response = await fetch(`/search?regex=${encodeURIComponent(query)}&language=fr`);
    const data = await response.json();
    updatePanel('frenchPanel', data.results);
    // Pour l'italien et l'anglais, il suffit de dupliquer la logique si besoin
}

function updatePanel(panelId, results) {
    const panel = document.getElementById(panelId);
    // On garde le titre (premier enfant)
    while (panel.children.length > 1) {
        panel.removeChild(panel.lastChild);
    }
    results.forEach(result => {
        const label = document.createElement('div');
        label.className = 'result-label';
        label.textContent = result;
        panel.appendChild(label);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('searchBar').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('filterCheckbox').addEventListener('change', performSearch);
    document.getElementById('filterButton').addEventListener('click', function() {
        alert('Fonctionnalité de filtre à implémenter');
    });
    // Recherche initiale
    performSearch();
});
