import { KEYS } from './data.js';
import { get, getObj, set, genId, esc, showToast, getExercise } from './storage.js';

// Template exercises state
export let templateExercises = [];

// Render templates list
export function renderTemplates() {
    const templates = get(KEYS.templates);
    const list = document.getElementById('template-list');

    if (templates.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p class="empty-text">No templates yet. Create one to get started!</p>
                <button type="button" class="btn btn-primary" onclick="window.openTemplateModal()" style="width: auto; padding: 12px 24px;">Create Template</button>
            </div>`;
        return;
    }

    list.innerHTML = templates.map(t => {
        // Format exercise summary
        const exerciseSummary = t.exercises.map(e => {
            const exercise = getExercise(e.exerciseId);
            if (!exercise) return '';

            if (exercise.category === 'cardio') {
                return `${e.isWarmup ? '☀ ' : ''}${exercise.name}: ${e.targetTime || 10}min`;
            } else {
                const weight = e.targetWeight || '';
                return `${e.isWarmup ? '☀ ' : ''}${exercise.name}: ${e.targetSets || 3}×${e.targetReps || 8}${weight ? ' @ ' + weight : ''}`;
            }
        }).filter(s => s).join('<br>');

        return `
            <div class="card">
                <div class="card-title">${esc(t.name)}</div>
                <div class="card-subtitle">${exerciseSummary || 'No exercises'}</div>
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button type="button" class="btn btn-primary" style="flex: 1;" onclick="window.startWorkout('${t.id}')">Start</button>
                    <button type="button" class="btn btn-secondary" style="width: 50px;" onclick="window.openTemplateModal(null, '${t.id}')" aria-label="Copy template" title="Copy">⎘</button>
                    <button type="button" class="btn btn-secondary" style="width: 50px;" onclick="window.openTemplateModal('${t.id}')" aria-label="Edit template" title="Edit">✎</button>
                </div>
            </div>`;
    }).join('');
}

// Render exercise categories in picker
export function renderExercisePicker(searchTerm = '') {
    const container = document.getElementById('exercise-categories');
    const exercises = getObj(KEYS.exercises);
    const term = searchTerm.toLowerCase();

    // Group exercises
    const favorites = Object.values(exercises).filter(e => e.isFavorite);
    const byEquipment = {
        barbell: [],
        dumbbell: [],
        kettlebell: [],
        cable: [],
        machine: [],
        bodyweight: [],
        cardio: []
    };

    Object.values(exercises).forEach(ex => {
        if (term && !ex.name.toLowerCase().includes(term)) return;

        if (ex.category === 'cardio') {
            byEquipment.cardio.push(ex);
        } else {
            if (byEquipment[ex.equipment]) {
                byEquipment[ex.equipment].push(ex);
            }
        }
    });

    let html = '';

    // Favorites
    if (favorites.length > 0 && !term) {
        html += '<div style="margin-bottom: 8px;"><strong style="color: var(--accent); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">★ Favorites</strong><div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">';
        favorites.forEach(ex => {
            html += `<button type="button" class="exercise-pill" data-exercise-id="${ex.id}">${esc(ex.name)}</button>`;
        });
        html += '</div></div>';
    }

    // Strength categories
    const strengthCategories = [
        { key: 'barbell', label: 'Barbell' },
        { key: 'dumbbell', label: 'Dumbbell' },
        { key: 'kettlebell', label: 'Kettlebell' },
        { key: 'cable', label: 'Cable/Machine' },
        { key: 'bodyweight', label: 'Bodyweight' }
    ];

    strengthCategories.forEach(cat => {
        const list = byEquipment[cat.key];
        if (cat.key === 'cable') {
            // Combine cable and machine
            list.push(...byEquipment.machine);
        }

        if (list.length > 0) {
            html += `<div style="margin-bottom: 8px;"><strong style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">${cat.label}</strong><div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">`;
            list.forEach(ex => {
                html += `<button type="button" class="exercise-pill" data-exercise-id="${ex.id}">${esc(ex.name)}</button>`;
            });
            html += '</div></div>';
        }
    });

    // Cardio
    if (byEquipment.cardio.length > 0) {
        html += '<div style="margin-bottom: 8px;"><strong style="color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Cardio</strong><div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;">';
        byEquipment.cardio.forEach(ex => {
            html += `<button type="button" class="exercise-pill" data-exercise-id="${ex.id}">${esc(ex.name)}</button>`;
        });
        html += '</div></div>';
    }

    container.innerHTML = html || '<p style="color: var(--text-muted); font-size: 12px;">No exercises found</p>';

    // Add click handlers
    container.querySelectorAll('.exercise-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const exerciseId = btn.dataset.exerciseId;
            addExerciseToTemplate(exerciseId);
        });
    });
}

// Add exercise to template
export function addExerciseToTemplate(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise) return;

    const templateEx = {
        exerciseId: exercise.id,
        isWarmup: false,
        targetSets: 3,
        targetReps: 8,
        targetWeight: exercise.workingWeight || null,
        targetTime: null,
        targetResistance: null,
        targetSpeed: null,
        targetIncline: null,
        targetDistance: null
    };

    // Set cardio defaults
    if (exercise.category === 'cardio') {
        templateEx.targetTime = 10;
        templateEx.targetResistance = 8;
    }

    templateExercises.push(templateEx);
    renderTemplateExercises();
}

// Render added exercises in template
export function renderTemplateExercises() {
    const container = document.getElementById('template-exercises');

    if (templateExercises.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 12px; padding: 12px;">No exercises added yet. Select from above.</p>';
        return;
    }

    container.innerHTML = templateExercises.map((ex, idx) => {
        const exercise = getExercise(ex.exerciseId);
        if (!exercise) return '';

        const isCardio = exercise.category === 'cardio';
        const warmupChecked = ex.isWarmup ? 'checked' : '';

        let fields = '';
        if (isCardio) {
            fields = `
                <div class="exercise-field-row">
                    <div class="exercise-field-group">
                        <span class="exercise-field-label">Time (min)</span>
                        <input type="number" inputmode="numeric" class="exercise-field" data-idx="${idx}" data-field="targetTime" value="${ex.targetTime || 10}" min="1" max="120" step="1">
                    </div>
                    <div class="exercise-field-group">
                        <span class="exercise-field-label">Resistance</span>
                        <input type="number" inputmode="numeric" class="exercise-field" data-idx="${idx}" data-field="targetResistance" value="${ex.targetResistance || 8}" min="1" max="20" step="1">
                    </div>
                </div>`;
        } else {
            const workingWeight = exercise.workingWeight || '';
            fields = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 11px; color: var(--text-muted);">Working: ${workingWeight ? workingWeight + ' lbs' : 'Not set'}</span>
                    <button type="button" class="btn-text" data-idx="${idx}" data-action="autofill" style="font-size: 11px; padding: 4px 8px;">Auto-fill</button>
                </div>
                <div class="exercise-field-row">
                    <div class="exercise-field-group">
                        <span class="exercise-field-label">Sets</span>
                        <input type="number" inputmode="numeric" class="exercise-field" data-idx="${idx}" data-field="targetSets" value="${ex.targetSets || 3}" min="1" max="20" step="1">
                    </div>
                    <div class="exercise-field-group">
                        <span class="exercise-field-label">Reps</span>
                        <input type="number" inputmode="numeric" class="exercise-field" data-idx="${idx}" data-field="targetReps" value="${ex.targetReps || 8}" min="1" max="100" step="1">
                    </div>
                </div>
                <div class="exercise-field-group">
                    <span class="exercise-field-label">Weight (lbs)</span>
                    <input type="number" inputmode="decimal" class="exercise-field" data-idx="${idx}" data-field="targetWeight" placeholder="${workingWeight || '135'}" value="${ex.targetWeight || ''}" autocomplete="off">
                </div>`;
        }

        return `
            <div class="exercise-entry">
                <div class="exercise-entry-header">
                    <div>
                        <span class="exercise-num">${ex.isWarmup ? '☀ ' : ''}${esc(exercise.name)}</span>
                        <label style="display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; cursor: pointer;">
                            <input type="checkbox" data-idx="${idx}" data-field="isWarmup" ${warmupChecked} style="margin-right: 4px;">
                            Warmup
                        </label>
                    </div>
                    <button type="button" class="remove-btn" data-idx="${idx}" data-action="remove">×</button>
                </div>
                <div class="exercise-fields">
                    ${fields}
                </div>
            </div>`;
    }).join('');

    // Add event listeners
    container.querySelectorAll('input[data-idx]').forEach(input => {
        input.addEventListener('change', e => {
            const idx = parseInt(e.target.dataset.idx);
            const field = e.target.dataset.field;
            if (field === 'isWarmup') {
                templateExercises[idx][field] = e.target.checked;
            } else {
                templateExercises[idx][field] = e.target.type === 'number' ? (parseFloat(e.target.value) || null) : e.target.value;
            }
            renderTemplateExercises(); // Re-render to update warmup icon
        });
    });

    container.querySelectorAll('button[data-action="remove"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            templateExercises.splice(idx, 1);
            renderTemplateExercises();
        });
    });

    container.querySelectorAll('button[data-action="autofill"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            const ex = templateExercises[idx];
            const exercise = getExercise(ex.exerciseId);
            if (exercise && exercise.workingWeight) {
                ex.targetWeight = exercise.workingWeight;
                renderTemplateExercises();
                showToast('Auto-filled from working weight');
            } else {
                showToast('No working weight set for this exercise');
            }
        });
    });
}

// Open template modal
export function openTemplateModal(editId = null, copyId = null) {
    templateExercises.length = 0;

    if (editId || copyId) {
        const t = get(KEYS.templates).find(x => x.id === (editId || copyId));
        if (t) {
            if (editId) {
                document.getElementById('template-modal-title').textContent = 'Edit Template';
                document.getElementById('template-name').value = t.name;
                document.getElementById('editing-template-id').value = editId;
                document.getElementById('delete-template-btn').style.display = 'block';
            } else {
                document.getElementById('template-modal-title').textContent = 'Copy Template';
                document.getElementById('template-name').value = t.name + ' (Copy)';
                document.getElementById('editing-template-id').value = '';
                document.getElementById('delete-template-btn').style.display = 'none';
            }
            templateExercises.push(...t.exercises);
        }
    } else {
        document.getElementById('template-modal-title').textContent = 'New Template';
        document.getElementById('template-name').value = '';
        document.getElementById('editing-template-id').value = '';
        document.getElementById('delete-template-btn').style.display = 'none';
    }

    renderExercisePicker();
    renderTemplateExercises();
    document.getElementById('template-modal').classList.add('active');
}

// Create custom exercise
export function createCustomExercise(name, category, equipment, muscleGroup) {
    const exercises = getObj(KEYS.exercises);
    const id = 'custom-' + genId();

    exercises[id] = {
        id,
        name,
        category,
        equipment,
        muscleGroup,
        hasStandards: false,
        trackingType: category === 'cardio' ? 'cardio' : 'weight-reps',
        weightIncrement: 5,
        cardioFields: category === 'cardio' ? ['time', 'resistance'] : undefined,
        isCustom: true,
        isFavorite: false,
        workingWeight: null,
        estimated1RM: null,
        pr: {},
        lastPerformed: null,
        trend: 'stable'
    };

    set(KEYS.exercises, exercises);
    renderExercisePicker();
    showToast('Custom exercise created!', 'success');
}

// Save template
export function saveTemplate(name, editId = null) {
    if (!name) return;
    if (templateExercises.length === 0) {
        showToast('Add at least one exercise');
        return;
    }

    const templates = get(KEYS.templates);

    if (editId) {
        const idx = templates.findIndex(t => t.id === editId);
        if (idx !== -1) {
            templates[idx] = { ...templates[idx], name, exercises: [...templateExercises] };
        }
    } else {
        templates.push({
            id: genId(),
            name,
            exercises: [...templateExercises],
            createdAt: new Date().toISOString(),
            lastPerformed: null
        });
    }

    set(KEYS.templates, templates);
    renderTemplates();
    document.getElementById('template-modal').classList.remove('active');
    showToast(editId ? 'Template updated!' : 'Template created!', 'success');
}

// Delete template
export function deleteTemplate(templateId) {
    set(KEYS.templates, get(KEYS.templates).filter(t => t.id !== templateId));
    renderTemplates();
    document.getElementById('template-modal').classList.remove('active');
    showToast('Template deleted!', 'success');
}
