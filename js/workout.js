import { KEYS } from './data.js';
import { get, getObj, set, genId, esc, showToast, getExercise } from './storage.js';

// State
export let activeWorkout = null;
export let workoutStartTime = null;
export let timerInterval = null;

// Confirm dialog state
let confirmCallback = null;

// Get last workout for exercise
export function getLastWorkoutForExercise(exerciseId) {
    const history = get(KEYS.history);
    for (let i = history.length - 1; i >= 0; i--) {
        const workout = history[i];
        const ex = workout.exercises.find(e => e.exerciseId === exerciseId);
        if (ex) return { workout, exercise: ex };
    }
    return null;
}

// Start workout
export function startWorkout(templateId) {
    const t = get(KEYS.templates).find(x => x.id === templateId);
    if (!t) return;

    activeWorkout = {
        templateId: t.id,
        templateName: t.name,
        notes: '',
        exercises: t.exercises.map(e => {
            const exercise = getExercise(e.exerciseId);
            if (!exercise) return null;

            const lastWorkout = getLastWorkoutForExercise(e.exerciseId);

            if (exercise.category === 'cardio') {
                return {
                    exerciseId: e.exerciseId,
                    isWarmup: e.isWarmup,
                    type: 'cardio',
                    targetTime: e.targetTime || 10,
                    targetResistance: e.targetResistance || 8,
                    actualTime: e.targetTime || 10,
                    actualResistance: e.targetResistance || 8,
                    completed: false,
                    lastWorkout: lastWorkout ? {
                        date: lastWorkout.workout.date,
                        time: lastWorkout.exercise.time,
                        resistance: lastWorkout.exercise.resistance
                    } : null
                };
            } else {
                const targetWeight = e.targetWeight || exercise.workingWeight || '';
                return {
                    exerciseId: e.exerciseId,
                    isWarmup: e.isWarmup,
                    type: 'strength',
                    targetSets: e.targetSets || 3,
                    targetReps: e.targetReps || 8,
                    targetWeight: targetWeight,
                    sets: Array.from({ length: e.targetSets || 3 }, () => ({
                        weight: targetWeight,
                        reps: e.targetReps || 8,
                        completed: false
                    })),
                    lastWorkout: lastWorkout ? {
                        date: lastWorkout.workout.date,
                        sets: lastWorkout.exercise.sets
                    } : null
                };
            }
        }).filter(e => e !== null)
    };

    workoutStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    renderActiveWorkout();

    document.getElementById('template-view').style.display = 'none';
    document.getElementById('active-workout').style.display = 'block';
    document.getElementById('fab-btn').style.display = 'none';
}

// Update timer
export function updateTimer() {
    const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
    document.getElementById('workout-timer').textContent =
        `${Math.floor(elapsed / 60).toString().padStart(2, '0')}:${(elapsed % 60).toString().padStart(2, '0')}`;
}

// Render active workout
export function renderActiveWorkout() {
    document.getElementById('active-workout-name').textContent = activeWorkout.templateName;
    document.getElementById('active-exercises').innerHTML = activeWorkout.exercises.map((ex, ei) => {
        const exercise = getExercise(ex.exerciseId);
        if (!exercise) return '';

        const isCardio = ex.type === 'cardio';
        const warmupLabel = ex.isWarmup ? '☀ ' : '';

        // Last workout info
        let lastWorkoutInfo = '';
        if (ex.lastWorkout) {
            const daysAgo = Math.floor((Date.now() - new Date(ex.lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24));
            const daysText = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;

            if (isCardio) {
                lastWorkoutInfo = `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">📊 Last: ${ex.lastWorkout.time}min @ R${ex.lastWorkout.resistance} (${daysText})</div>`;
            } else {
                const lastSummary = ex.lastWorkout.sets.map(s => `${s.weight}×${s.reps}`).join(', ');
                lastWorkoutInfo = `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">📊 Last: ${lastSummary} (${daysText})</div>`;
            }
        }

        // Goal/progress indicator
        let goalInfo = '';
        const plans = get(KEYS.plans);
        const plan = plans.find(p => p.exerciseId === ex.exerciseId && p.status === 'active');
        if (plan && !ex.isWarmup) {
            const progress = Math.round(((plan.currentWeight - plan.startWeight) / (plan.goalWeight - plan.startWeight)) * 100);
            goalInfo = `<div style="font-size: 11px; color: var(--accent); margin-bottom: 8px;">🎯 Goal: ${plan.goalWeight} lbs (${progress}% complete)</div>`;
        }

        if (isCardio) {
            return `
                <div class="exercise-block">
                    <div class="exercise-block-header">
                        <span class="exercise-block-name">${warmupLabel}${esc(exercise.name)}${ex.isWarmup ? ' (warmup)' : ''}</span>
                        <button type="button" class="set-check ${ex.completed ? 'checked' : ''}" onclick="window.toggleCardioComplete(${ei})" aria-label="Mark complete">✓</button>
                    </div>
                    ${lastWorkoutInfo}
                    ${goalInfo}
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                        <div>
                            <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Time (min)</label>
                            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                                <button type="button" class="weight-adjust-btn" onclick="window.adjustCardioField(${ei}, 'actualTime', -1)">−</button>
                                <input type="number" class="set-input" style="text-align: center;" value="${ex.actualTime}" onchange="window.updateCardioField(${ei}, 'actualTime', this.value)" min="1" max="120">
                                <button type="button" class="weight-adjust-btn" onclick="window.adjustCardioField(${ei}, 'actualTime', 1)">+</button>
                            </div>
                        </div>
                        <div>
                            <label style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Resistance</label>
                            <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                                <button type="button" class="weight-adjust-btn" onclick="window.adjustCardioField(${ei}, 'actualResistance', -1)">−</button>
                                <input type="number" class="set-input" style="text-align: center;" value="${ex.actualResistance}" onchange="window.updateCardioField(${ei}, 'actualResistance', this.value)" min="1" max="20">
                                <button type="button" class="weight-adjust-btn" onclick="window.adjustCardioField(${ei}, 'actualResistance', 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        } else {
            return `
                <div class="exercise-block">
                    <div class="exercise-block-header">
                        <span class="exercise-block-name">${warmupLabel}${esc(exercise.name)}${ex.isWarmup ? ' (warmup)' : ''}</span>
                        <span class="exercise-block-target">${ex.targetSets}×${ex.targetReps}${ex.targetWeight ? ' @ ' + ex.targetWeight : ''}</span>
                    </div>
                    ${lastWorkoutInfo}
                    ${goalInfo}
                    <div class="set-list">
                        ${ex.sets.map((s, si) => `
                            <div class="set-row ${s.completed ? 'completed' : ''}" data-ei="${ei}" data-si="${si}">
                                <span class="set-num">${si + 1}</span>
                                <div style="display: flex; align-items: center; gap: 4px; flex: 1;">
                                    <button type="button" class="weight-adjust-btn" onclick="window.adjustWeight(${ei}, ${si}, -${exercise.weightIncrement || 5})">−${exercise.weightIncrement || 5}</button>
                                    <input type="text" inputmode="decimal" class="set-input" value="${s.weight}" onchange="window.updateSet(${ei},${si},'weight',this.value)" placeholder="Weight" style="text-align: center; min-width: 60px;">
                                    <button type="button" class="weight-adjust-btn" onclick="window.adjustWeight(${ei}, ${si}, ${exercise.weightIncrement || 5})">+${exercise.weightIncrement || 5}</button>
                                </div>
                                <input type="number" inputmode="numeric" class="set-input" style="width: 50px; flex: none; text-align: center;" value="${s.reps}" onchange="window.updateSet(${ei},${si},'reps',this.value)" min="1" max="100" placeholder="Reps">
                                <button type="button" class="set-check ${s.completed ? 'checked' : ''}" onclick="window.toggleSet(${ei},${si})" aria-label="Mark set complete">✓</button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="add-set-btn" onclick="window.addSet(${ei})">+ Add Set</button>
                </div>`;
        }
    }).join('');
}

// Set management functions
export function updateSet(ei, si, field, val) {
    activeWorkout.exercises[ei].sets[si][field] = val;
}

export function toggleSet(ei, si) {
    activeWorkout.exercises[ei].sets[si].completed = !activeWorkout.exercises[ei].sets[si].completed;
    renderActiveWorkout();
}

export function addSet(ei) {
    const ex = activeWorkout.exercises[ei];
    const last = ex.sets[ex.sets.length - 1];
    ex.sets.push({ weight: last.weight, reps: last.reps, completed: false });
    renderActiveWorkout();
}

// Quick weight adjust
export function adjustWeight(ei, si, delta) {
    const set = activeWorkout.exercises[ei].sets[si];
    const currentWeight = parseFloat(set.weight) || 0;
    set.weight = Math.max(0, currentWeight + delta).toString();
    renderActiveWorkout();
}

// Cardio controls
export function updateCardioField(ei, field, val) {
    activeWorkout.exercises[ei][field] = parseFloat(val) || 0;
}

export function adjustCardioField(ei, field, delta) {
    const ex = activeWorkout.exercises[ei];
    ex[field] = Math.max(1, (ex[field] || 0) + delta);
    renderActiveWorkout();
}

export function toggleCardioComplete(ei) {
    activeWorkout.exercises[ei].completed = !activeWorkout.exercises[ei].completed;
    renderActiveWorkout();
}

// Calculate 1RM using Epley formula
export function calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
}

// Finish workout
export function finishWorkout() {
    if (!activeWorkout) return;

    // Get notes
    const notesInput = document.getElementById('workout-notes');
    activeWorkout.notes = notesInput ? notesInput.value.trim() : '';

    const prsAchieved = [];
    const exercises = getObj(KEYS.exercises);

    // Process each exercise for PR detection and stats updates
    activeWorkout.exercises.forEach(ex => {
        const exercise = exercises[ex.exerciseId];
        if (!exercise || ex.isWarmup) return; // Skip warmups

        if (ex.type === 'strength' && ex.sets && ex.sets.length > 0) {
            // Get completed sets
            const completedSets = ex.sets.filter(s => s.completed);
            if (completedSets.length === 0) return;

            // Calculate max weight lifted
            const maxWeight = Math.max(...completedSets.map(s => parseFloat(s.weight) || 0));

            // Calculate estimated 1RM from best set
            let best1RM = 0;
            completedSets.forEach(s => {
                const weight = parseFloat(s.weight) || 0;
                const reps = parseInt(s.reps) || 0;
                if (weight > 0 && reps > 0) {
                    const rm = calculate1RM(weight, reps);
                    if (rm > best1RM) best1RM = rm;
                }
            });

            // Check for PRs
            if (!exercise.pr) exercise.pr = {};

            if (!exercise.pr.max1RM || best1RM > exercise.pr.max1RM) {
                exercise.pr.max1RM = best1RM;
                prsAchieved.push(`${exercise.name}: ${best1RM} lbs 1RM`);
            }

            if (!exercise.pr.maxWeight || maxWeight > exercise.pr.maxWeight) {
                exercise.pr.maxWeight = maxWeight;
                if (prsAchieved.indexOf(`${exercise.name}:`) === -1) {
                    prsAchieved.push(`${exercise.name}: ${maxWeight} lbs max weight`);
                }
            }

            // Update exercise data
            exercise.estimated1RM = best1RM;
            exercise.workingWeight = maxWeight; // Update working weight to what was lifted
            exercise.lastPerformed = new Date().toISOString();
        }

        if (ex.type === 'cardio' && ex.completed) {
            // Update cardio PRs
            if (!exercise.pr) exercise.pr = {};

            if (!exercise.pr.longestTime || ex.actualTime > exercise.pr.longestTime) {
                exercise.pr.longestTime = ex.actualTime;
                prsAchieved.push(`${exercise.name}: ${ex.actualTime}min longest time`);
            }

            if (ex.actualResistance && (!exercise.pr.highestResistance || ex.actualResistance > exercise.pr.highestResistance)) {
                exercise.pr.highestResistance = ex.actualResistance;
            }

            exercise.lastPerformed = new Date().toISOString();
        }
    });

    // Save updated exercise data
    set(KEYS.exercises, exercises);

    // Save workout to history
    const history = get(KEYS.history);
    history.push({
        id: genId(),
        templateId: activeWorkout.templateId,
        templateName: activeWorkout.templateName,
        date: new Date().toISOString(),
        duration: Date.now() - workoutStartTime,
        notes: activeWorkout.notes,
        exercises: activeWorkout.exercises,
        prsAchieved: prsAchieved
    });
    set(KEYS.history, history);

    endWorkout();

    // Import renderHistory if needed (will be provided by app.js)
    if (typeof window.renderHistory === 'function') {
        window.renderHistory();
    }

    // Show PR toast if any were achieved
    if (prsAchieved.length > 0) {
        showToast(`🏆 ${prsAchieved.length} PR${prsAchieved.length > 1 ? 's' : ''} achieved!`, 'success');
    } else {
        showToast('Workout saved!', 'success');
    }
}

// Cancel workout
export function cancelWorkout() {
    showConfirm('Cancel workout? Progress will be lost.', function() {
        endWorkout();
    });
}

// End workout
export function endWorkout() {
    activeWorkout = null;
    clearInterval(timerInterval);
    document.getElementById('active-workout').style.display = 'none';
    document.getElementById('template-view').style.display = 'block';
    document.getElementById('fab-btn').style.display = 'block';
    if (document.getElementById('workout-notes')) {
        document.getElementById('workout-notes').value = '';
    }
}

// Confirm dialog
export function showConfirm(message, onYes) {
    document.getElementById('confirm-message').textContent = message;
    confirmCallback = onYes;
    document.getElementById('confirm-modal').classList.add('active');
}

export function confirmYes() {
    document.getElementById('confirm-modal').classList.remove('active');
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
}

export function confirmNo() {
    document.getElementById('confirm-modal').classList.remove('active');
    confirmCallback = null;
}
