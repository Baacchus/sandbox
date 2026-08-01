/**
 * Application Mobile de Visualisation de Planning - Balabar 2026
 * Gestion de l'authentification PIN (1312), sélection de bénévole et affichage des créneaux.
 */

function initApp() {

  // ==========================================
  // 1. ÉTAT DE L'APPLICATION & SÉCURITÉ PIN
  // ==========================================
  const PIN_CORRECT = "1312";
  let currentPinInput = "";
  let allPeopleData = [];
  let selectedPerson = null;
  let activePeriodFilter = 'all';

  // Éléments DOM - Écran PIN
  const pinScreen = document.getElementById('pin-screen');
  const appWrapper = document.getElementById('app-wrapper');
  const pinDots = document.querySelectorAll('#pin-dots .dot');
  const pinErrorMsg = document.getElementById('pin-error');
  const numpadBtns = document.querySelectorAll('.num-btn[data-val]');
  const pinClearBtn = document.getElementById('pin-clear');
  const pinBackBtn = document.getElementById('pin-back');

  // Éléments DOM - Interface Principale
  const lockBtn = document.getElementById('lock-btn');
  const personSelect = document.getElementById('person-select');
  const personSearch = document.getElementById('person-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const personSummaryCard = document.getElementById('person-summary-card');
  const personAvatar = document.getElementById('person-avatar');
  const personNameDisplay = document.getElementById('person-name-display');
  const personTeamBadge = document.getElementById('person-team-badge');
  const personTags = document.getElementById('person-tags');

  // Éléments DOM - Stats & Liste
  const statTotalShifts = document.getElementById('stat-total-shifts');
  const statTotalHours = document.getElementById('stat-total-hours');
  const statRolesCount = document.getElementById('stat-roles-count');
  const shiftCountBadge = document.getElementById('shift-count-badge');
  const scheduleList = document.getElementById('schedule-list');
  const filterTabs = document.querySelectorAll('.filter-tabs .tab-btn');

  // ==========================================
  // 2. GESTION DU PAVÉ NUMÉRIQUE & PIN (1312)
  // ==========================================
  if (numpadBtns) {
    numpadBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        if (currentPinInput.length < 4) {
          currentPinInput += val;
          updatePinDots();
          if (currentPinInput.length === 4) {
            validatePin();
          }
        }
      });
    });
  }

  if (pinClearBtn) {
    pinClearBtn.addEventListener('click', () => {
      currentPinInput = "";
      updatePinDots();
      if (pinErrorMsg) pinErrorMsg.textContent = "";
    });
  }

  if (pinBackBtn) {
    pinBackBtn.addEventListener('click', () => {
      if (currentPinInput.length > 0) {
        currentPinInput = currentPinInput.slice(0, -1);
        updatePinDots();
        if (pinErrorMsg) pinErrorMsg.textContent = "";
      }
    });
  }

  function updatePinDots() {
    if (!pinDots) return;
    pinDots.forEach((dot, idx) => {
      if (idx < currentPinInput.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  }

  function validatePin() {
    if (currentPinInput === PIN_CORRECT) {
      // Déverrouillage réussi
      if (pinErrorMsg) pinErrorMsg.textContent = "";
      if (pinScreen) pinScreen.classList.remove('active');
      if (appWrapper) appWrapper.classList.remove('hidden');
      loadData();
    } else {
      // Erreur de PIN
      const dotsContainer = document.getElementById('pin-dots');
      if (dotsContainer) dotsContainer.classList.add('shake');
      if (pinErrorMsg) pinErrorMsg.textContent = "Code PIN incorrect. Veuillez réessayer.";
      
      setTimeout(() => {
        if (dotsContainer) dotsContainer.classList.remove('shake');
        currentPinInput = "";
        updatePinDots();
      }, 500);
    }
  }

  // Support de la saisie clavier physique pour le PIN
  document.addEventListener('keydown', (e) => {
    if (pinScreen && pinScreen.classList.contains('active')) {
      if (e.key >= '0' && e.key <= '9') {
        if (currentPinInput.length < 4) {
          currentPinInput += e.key;
          updatePinDots();
          if (currentPinInput.length === 4) {
            validatePin();
          }
        }
      } else if (e.key === 'Backspace') {
        currentPinInput = currentPinInput.slice(0, -1);
        updatePinDots();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        currentPinInput = "";
        updatePinDots();
      }
    }
  });

  // Bouton de re-verrouillage
  if (lockBtn) {
    lockBtn.addEventListener('click', () => {
      currentPinInput = "";
      updatePinDots();
      if (appWrapper) appWrapper.classList.add('hidden');
      if (pinScreen) pinScreen.classList.add('active');
    });
  }

  // ==========================================
  // 3. CHARGEMENT & TRAITEMENT DES DONNÉES JSON
  // ==========================================
  async function loadData() {
    try {
      const response = await fetch('data.json');
      if (!response.ok) throw new Error("Erreur de chargement de data.json");
      allPeopleData = await response.json();
      
      populatePersonSelect(allPeopleData);
    } catch (err) {
      console.error("Erreur d'import des données :", err);
      if (scheduleList) {
        scheduleList.innerHTML = `
          <div class="empty-state glass-panel">
            <span class="empty-icon">⚠️</span>
            <p>Impossible de charger le fichier data.json. Veuillez réactualiser la page.</p>
          </div>
        `;
      }
    }
  }

  function populatePersonSelect(list) {
    if (!personSelect) return;
    personSelect.innerHTML = `<option value="">-- Choisir une personne (${list.length} bénévoles) --</option>`;
    
    list.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      const shiftCount = p.shifts ? p.shifts.length : 0;
      option.textContent = `${p.fullName} (${shiftCount} créneau${shiftCount > 1 ? 'x' : ''})`;
      personSelect.appendChild(option);
    });
  }

  // ==========================================
  // 4. RECHERCHE & SÉLECTION
  // ==========================================
  if (personSearch) {
    personSearch.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (clearSearchBtn) {
        if (query) {
          clearSearchBtn.classList.remove('hidden');
        } else {
          clearSearchBtn.classList.add('hidden');
        }
      }

      const filtered = allPeopleData.filter(p => p.fullName.toLowerCase().includes(query));
      populatePersonSelect(filtered);

      if (filtered.length === 1 && personSelect) {
        personSelect.value = filtered[0].id;
        selectPerson(filtered[0].id);
      }
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (personSearch) personSearch.value = "";
      clearSearchBtn.classList.add('hidden');
      populatePersonSelect(allPeopleData);
    });
  }

  if (personSelect) {
    personSelect.addEventListener('change', (e) => {
      selectPerson(e.target.value);
    });
  }

  function selectPerson(personId) {
    if (!personId) {
      selectedPerson = null;
      if (personSummaryCard) personSummaryCard.classList.add('hidden');
      renderSchedule([]);
      updateStats(0, 0, 0);
      return;
    }

    selectedPerson = allPeopleData.find(p => p.id === personId);
    if (!selectedPerson) return;

    // Mise à jour de la carte profil hiérarchique
    const initials = selectedPerson.prenom ? selectedPerson.prenom.charAt(0) + (selectedPerson.nom ? selectedPerson.nom.charAt(0) : '') : 'B';
    if (personAvatar) personAvatar.textContent = initials.toUpperCase();
    if (personNameDisplay) personNameDisplay.textContent = selectedPerson.fullName;
    
    const roleContainer = document.getElementById('person-role-badge-container');
    if (roleContainer) {
      roleContainer.innerHTML = `<span class="badge badge-role">${selectedPerson.role || 'Bénévole'}</span>`;
    }

    const extraInfo = document.getElementById('person-extra-info');
    if (extraInfo) {
      let items = [];
      if (selectedPerson.phone) {
        items.push(`<div class="info-pill phone-pill"><span>📞</span> <span>${selectedPerson.phone}</span></div>`);
      }
      if (selectedPerson.regime) {
        items.push(`<div class="info-pill regime-pill"><span>🥗</span> <span>${selectedPerson.regime}</span></div>`);
      }
      extraInfo.innerHTML = items.join('');
      if (items.length === 0) {
        extraInfo.style.display = 'none';
      } else {
        extraInfo.style.display = 'flex';
      }
    }

    if (personSummaryCard) personSummaryCard.classList.remove('hidden');

    applyFiltersAndRender();
  }

  // ==========================================
  // 5. FILTRES DE PÉRIODE & RENDU DU PLANNING
  // ==========================================
  if (filterTabs) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activePeriodFilter = tab.getAttribute('data-period');
        applyFiltersAndRender();
      });
    });
  }

  function applyFiltersAndRender() {
    if (!selectedPerson || !selectedPerson.shifts) {
      renderSchedule([]);
      updateStats(0, 0, 0);
      return;
    }

    let shifts = [...selectedPerson.shifts];

    shifts.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    if (activePeriodFilter === 'today') {
      const todayISO = new Date().toISOString().split('T')[0];
      shifts = shifts.filter(s => s.date === todayISO);
    } else if (activePeriodFilter === 'upcoming') {
      const todayISO = new Date().toISOString().split('T')[0];
      shifts = shifts.filter(s => s.date >= todayISO);
    }

    renderSchedule(shifts);

    const totalShifts = shifts.length;
    const totalHours = shifts.reduce((sum, s) => sum + (s.durationHours || 1), 0);
    const uniqueTeams = new Set(shifts.map(s => s.team)).size;

    updateStats(totalShifts, totalHours, uniqueTeams);
  }

  function updateStats(shiftsCount, hoursCount, rolesCount) {
    if (statTotalShifts) statTotalShifts.textContent = shiftsCount;
    if (statTotalHours) statTotalHours.textContent = `${hoursCount}h`;
    if (statRolesCount) statRolesCount.textContent = rolesCount;
    if (shiftCountBadge) shiftCountBadge.textContent = `${shiftsCount} créneau${shiftsCount > 1 ? 'x' : ''}`;
  }

  function renderSchedule(shifts) {
    if (!scheduleList) return;

    if (shifts.length === 0) {
      scheduleList.innerHTML = `
        <div class="empty-state glass-panel">
          <span class="empty-icon">📅</span>
          <p>${selectedPerson ? 'Aucun créneau ne correspond à cette période.' : 'Veuillez sélectionner une personne ci-dessus.'}</p>
        </div>
      `;
      return;
    }

    scheduleList.innerHTML = "";

    shifts.forEach(shift => {
      const card = document.createElement('div');
      
      let shiftColorClass = 'shift-soir';
      const teamLower = (shift.team || '').toLowerCase();
      if (teamLower.includes('bar')) shiftColorClass = 'shift-bar';
      else if (teamLower.includes('accueil') || teamLower.includes('billetterie')) shiftColorClass = 'shift-aprem';
      else if (teamLower.includes('green') || teamLower.includes('resto') || teamLower.includes('cuisine')) shiftColorClass = 'shift-matin';
      else if (teamLower.includes('kif') || teamLower.includes('brigade') || teamLower.includes('artiste')) shiftColorClass = 'shift-nuit';

      card.className = `shift-card glass-panel ${shiftColorClass}`;

      card.innerHTML = `
        <div class="shift-header">
          <div class="shift-date-box">
            <span class="shift-day-name">${shift.dateLabel || shift.date}</span>
            <span class="shift-date">${formatDateFR(shift.date)}</span>
          </div>
          <div class="shift-time-badge">
            <span class="time-icon">⏰</span>
            <span>${shift.time}</span>
          </div>
        </div>

        <div class="shift-body">
          <div class="shift-role-title">${shift.team}</div>
          <div class="shift-info-row">
            <div class="info-item">
              <span>🎯 Position :</span>
              <strong>${shift.role || shift.assignment || 'Membre d\'équipe'}</strong>
            </div>
            <div class="info-item">
              <span>⏳ Durée :</span>
              <span>${shift.durationHours || 1} heure(s)</span>
            </div>
          </div>
          ${shift.notes ? `<div class="shift-notes">💡 ${shift.notes}</div>` : ''}
        </div>
      `;

      scheduleList.appendChild(card);
    });
  }

  function formatDateFR(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}

// Initialisation sécurisée sur DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Enregistrement du Service Worker pour PWA Standalone
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration skipped or failed:', err);
    });
  });
}
