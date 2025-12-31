import { KEYS } from './data.js';
import { getObj, set, showToast } from './storage.js';
import { showConfirm } from './workout.js';

// Get profile
export function getProfile() {
    return getObj(KEYS.profile);
}

// Load profile
export function loadProfile() {
    const p = getProfile();
    const bodyWeight = p.bodyWeight || p.weight; // v4 + backward compat
    if (bodyWeight) document.getElementById('profile-weight').value = bodyWeight;
    if (p.sex) document.getElementById('profile-sex').value = p.sex;
}

// Save profile
export function saveProfile() {
    const bodyWeight = parseFloat(document.getElementById('profile-weight').value);
    const sex = document.getElementById('profile-sex').value;
    if (!bodyWeight) {
        showToast('Enter your body weight');
        return;
    }
    set(KEYS.profile, { bodyWeight, sex, weight: bodyWeight }); // v4 format + backward compat
    showToast('Profile saved!', 'success');

    // Refresh Progress tab if exercise selected
    if (window.currentProgressExercise && typeof window.loadProgressExercise === 'function') {
        window.loadProgressExercise(window.currentProgressExercise.id);
    }
}

// Export data
export function exportData() {
    const data = {
        version: 'v4',
        templates: localStorage.getItem(KEYS.templates),
        history: localStorage.getItem(KEYS.history),
        profile: localStorage.getItem(KEYS.profile),
        exercises: localStorage.getItem(KEYS.exercises),
        plans: localStorage.getItem(KEYS.plans),
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported!', 'success');
}

// Import data
export function importData(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.templates) localStorage.setItem(KEYS.templates, data.templates);
            if (data.history) localStorage.setItem(KEYS.history, data.history);
            if (data.profile) localStorage.setItem(KEYS.profile, data.profile);
            if (data.exercises) localStorage.setItem(KEYS.exercises, data.exercises);
            if (data.plans) localStorage.setItem(KEYS.plans, data.plans);

            showToast('Data imported! Reloading...', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            showToast('Import failed: invalid file');
            console.error(err);
        }
    };
    reader.readAsText(file);
}

// Clear all data
export function clearAllData() {
    showConfirm('Clear all data? This cannot be undone!', function() {
        localStorage.removeItem(KEYS.templates);
        localStorage.removeItem(KEYS.history);
        localStorage.removeItem(KEYS.profile);
        localStorage.removeItem(KEYS.exercises);
        localStorage.removeItem(KEYS.plans);
        showToast('All data cleared. Reloading...', 'success');
        setTimeout(() => location.reload(), 1000);
    });
}
