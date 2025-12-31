import { KEYS, EXERCISE_LIBRARY } from './data.js';

// Helper functions
export const get = key => JSON.parse(localStorage.getItem(key) || '[]');
export const getObj = key => JSON.parse(localStorage.getItem(key) || '{}');
export const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
export const genId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
export const esc = text => { const d = document.createElement('div'); d.textContent = text || ''; return d.innerHTML; };

// Toast notifications
export function showToast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    setTimeout(() => t.classList.remove('show'), 2500);
}

// Initialize exercise library with user data
export function initExerciseLibrary() {
    let exercises = getObj(KEYS.exercises);

    // If empty or missing exercises, initialize from library
    if (Object.keys(exercises).length === 0) {
        exercises = {};
        Object.entries(EXERCISE_LIBRARY).forEach(([id, exercise]) => {
            exercises[id] = {
                ...exercise,
                isCustom: false,
                isFavorite: false,
                workingWeight: null,
                estimated1RM: null,
                pr: {},
                lastPerformed: null,
                trend: 'stable'
            };
        });
        set(KEYS.exercises, exercises);
    } else {
        // Add any new predefined exercises
        Object.entries(EXERCISE_LIBRARY).forEach(([id, exercise]) => {
            if (!exercises[id]) {
                exercises[id] = {
                    ...exercise,
                    isCustom: false,
                    isFavorite: false,
                    workingWeight: null,
                    estimated1RM: null,
                    pr: {},
                    lastPerformed: null,
                    trend: 'stable'
                };
            }
        });
        set(KEYS.exercises, exercises);
    }

    return exercises;
}

// Get all exercises
export function getAllExercises() {
    return getObj(KEYS.exercises);
}

// Get exercise by ID
export function getExercise(exerciseId) {
    const exercises = getObj(KEYS.exercises);
    return exercises[exerciseId] || null;
}

// Update exercise data
export function updateExercise(exerciseId, updates) {
    const exercises = getObj(KEYS.exercises);
    if (exercises[exerciseId]) {
        exercises[exerciseId] = { ...exercises[exerciseId], ...updates };
        set(KEYS.exercises, exercises);
    }
}

// Migration from v3 to v4
export function migrateToV4() {
    // Check if already migrated
    if (localStorage.getItem(KEYS.exercises)) {
        return; // Already on v4
    }

    const oldTemplates = localStorage.getItem('iron_templates');
    const oldHistory = localStorage.getItem('iron_history');
    const oldProfile = localStorage.getItem('iron_profile');
    const oldEstimates = localStorage.getItem('iron_estimates');
    const oldPlans = localStorage.getItem('iron_plans');

    if (!oldTemplates && !oldHistory) {
        return; // Fresh install, no migration needed
    }

    console.log('Migrating to IRON v4...');

    // Migration mapping for old exercise IDs
    const exerciseIdMap = {
        'bench': 'bench-press',
        'squat': 'back-squat',
        'deadlift': 'deadlift',
        'ohp': 'overhead-press',
        'row': 'barbell-row',
        'front-squat': 'front-squat'
    };

    // Migrate templates
    if (oldTemplates) {
        try {
            const templates = JSON.parse(oldTemplates);
            const newTemplates = templates.map(t => ({
                ...t,
                exercises: t.exercises.map(e => ({
                    exerciseId: exerciseIdMap[e.id] || e.id,
                    isWarmup: false,
                    targetSets: e.sets,
                    targetReps: e.reps,
                    targetWeight: e.weight
                }))
            }));
            set(KEYS.templates, newTemplates);
        } catch (err) {
            console.error('Template migration error:', err);
        }
    }

    // Migrate history
    if (oldHistory) {
        try {
            const history = JSON.parse(oldHistory);
            const newHistory = history.map(w => ({
                ...w,
                exercises: w.exercises.map(e => {
                    const newId = exerciseIdMap[e.id] || e.id;
                    const exercise = EXERCISE_LIBRARY[newId];

                    if (exercise && exercise.category === 'cardio') {
                        return {
                            exerciseId: newId,
                            isWarmup: false,
                            type: 'cardio',
                            time: e.sets ? e.sets[0]?.reps : 10,
                            resistance: 8
                        };
                    }

                    return {
                        exerciseId: newId,
                        isWarmup: false,
                        type: 'strength',
                        sets: e.sets || []
                    };
                })
            }));
            set(KEYS.history, newHistory);
        } catch (err) {
            console.error('History migration error:', err);
        }
    }

    // Copy profile and plans as-is
    if (oldProfile) localStorage.setItem(KEYS.profile, oldProfile);
    if (oldPlans) localStorage.setItem(KEYS.plans, oldPlans);

    console.log('Migration complete!');
    showToast('Upgraded to IRON v4!', 'success');
}
