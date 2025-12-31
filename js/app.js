// Import all modules
import { initExerciseLibrary, migrateToV4 } from './storage.js';
import { renderTemplates, openTemplateModal, renderExercisePicker, createCustomExercise, saveTemplate, deleteTemplate, templateExercises } from './templates.js';
import { startWorkout, finishWorkout, cancelWorkout, updateSet, toggleSet, addSet, adjustWeight, updateCardioField, adjustCardioField, toggleCardioComplete, confirmYes, confirmNo } from './workout.js';
import { populateProgressExercises, loadProgressExercise, updateProgress, generateProgressPlan, cancelProgressPlan, selectGoal } from './progress.js';
import { renderHistory, viewWorkout } from './history.js';
import { loadProfile, saveProfile, exportData, importData, clearAllData } from './settings.js';

// Expose functions to window for onclick handlers
window.openTemplateModal = openTemplateModal;
window.startWorkout = startWorkout;
window.finishWorkout = finishWorkout;
window.cancelWorkout = cancelWorkout;
window.updateSet = updateSet;
window.toggleSet = toggleSet;
window.addSet = addSet;
window.adjustWeight = adjustWeight;
window.updateCardioField = updateCardioField;
window.adjustCardioField = adjustCardioField;
window.toggleCardioComplete = toggleCardioComplete;
window.viewWorkout = viewWorkout;
window.renderHistory = renderHistory;
window.selectGoal = selectGoal;

// App initialization
document.addEventListener('DOMContentLoaded', function() {
    // Migrate data if needed
    migrateToV4();

    // Initialize exercise library
    initExerciseLibrary();

    // Load initial data
    loadProfile();
    renderTemplates();
    populateProgressExercises();
    renderHistory();

    // Tab navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            document.querySelectorAll('.nav-item').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');

            // Show/hide FAB based on active tab
            const isWorkoutTab = tab === 'workout';
            const hasActiveWorkout = document.getElementById('active-workout').style.display !== 'none';
            document.getElementById('fab-btn').style.display = (isWorkoutTab && !hasActiveWorkout) ? 'block' : 'none';
        });
    });

    // FAB button
    document.getElementById('fab-btn').addEventListener('click', () => openTemplateModal());

    // Settings button (open settings tab)
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        const settingsNav = document.querySelector('.nav-item[data-tab="settings"]');
        if (settingsNav) {
            settingsNav.classList.add('active');
            settingsNav.setAttribute('aria-selected', 'true');
        }
        document.getElementById('tab-settings').classList.add('active');
        document.getElementById('fab-btn').style.display = 'none';
    });

    // Template modal - search exercises
    document.getElementById('exercise-search').addEventListener('input', e => {
        renderExercisePicker(e.target.value);
    });

    // Template modal - create custom exercise button
    document.getElementById('create-custom-exercise-btn').addEventListener('click', () => {
        document.getElementById('custom-exercise-modal').classList.add('active');
    });

    // Custom exercise modal - close
    document.getElementById('close-custom-exercise-modal').addEventListener('click', () => {
        document.getElementById('custom-exercise-modal').classList.remove('active');
    });

    // Custom exercise form - submit
    document.getElementById('custom-exercise-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('custom-exercise-name').value.trim();
        const category = document.getElementById('custom-exercise-category').value;
        const equipment = document.getElementById('custom-exercise-equipment').value;
        const muscleGroup = document.getElementById('custom-exercise-muscle').value;

        if (!name) return;

        createCustomExercise(name, category, equipment, muscleGroup);
        document.getElementById('custom-exercise-modal').classList.remove('active');
        document.getElementById('custom-exercise-form').reset();
    });

    // Template modal - close
    document.getElementById('close-template-modal').addEventListener('click', () => {
        document.getElementById('template-modal').classList.remove('active');
    });

    // Template form - submit
    document.getElementById('template-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('template-name').value.trim();
        const editId = document.getElementById('editing-template-id').value;
        saveTemplate(name, editId || null);
    });

    // Template form - delete
    document.getElementById('delete-template-btn').addEventListener('click', () => {
        const editId = document.getElementById('editing-template-id').value;
        if (editId) {
            import('./workout.js').then(({ showConfirm }) => {
                showConfirm('Delete this template?', function() {
                    deleteTemplate(editId);
                });
            });
        }
    });

    // Workout modal - close
    document.getElementById('close-workout-modal').addEventListener('click', () => {
        document.getElementById('workout-modal').classList.remove('active');
    });

    // Confirm modal - yes/no
    document.getElementById('confirm-yes').addEventListener('click', confirmYes);
    document.getElementById('confirm-no').addEventListener('click', confirmNo);

    // Progress tab - exercise selection
    document.getElementById('progress-exercise-select').addEventListener('change', e => {
        if (e.target.value) {
            loadProgressExercise(e.target.value);
        }
    });

    // Progress tab - update 1RM button
    document.getElementById('progress-update-btn').addEventListener('click', updateProgress);

    // Progress tab - generate plan button
    document.getElementById('progress-generate-plan-btn').addEventListener('click', generateProgressPlan);

    // Progress tab - cancel plan button
    document.getElementById('progress-cancel-plan').addEventListener('click', cancelProgressPlan);

    // Settings - save profile
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);

    // Settings - export data
    document.getElementById('export-btn').addEventListener('click', exportData);

    // Settings - import data
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-input').click();
    });

    document.getElementById('import-input').addEventListener('change', e => {
        importData(e.target);
    });

    // Settings - clear all data
    document.getElementById('clear-btn').addEventListener('click', clearAllData);

    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
});
