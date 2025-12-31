import { KEYS, STANDARDS, LEVELS } from './data.js';
import { get, getObj, set, genId, showToast, getExercise, updateExercise } from './storage.js';
import { calculate1RM } from './workout.js';

// Current progress exercise state
export let currentProgressExercise = null;

// Populate progress exercise select
export function populateProgressExercises() {
    const select = document.getElementById('progress-exercise-select');
    const exercises = getObj(KEYS.exercises);

    const strengthExercises = Object.values(exercises).filter(e => e.category === 'strength' && !e.isCustom);
    const customExercises = Object.values(exercises).filter(e => e.isCustom);

    let html = '<option value="">Select an exercise...</option>';
    html += '<optgroup label="Strength">';
    strengthExercises.forEach(ex => {
        html += `<option value="${ex.id}">${ex.name}</option>`;
    });
    html += '</optgroup>';

    if (customExercises.length > 0) {
        html += '<optgroup label="Custom">';
        customExercises.forEach(ex => {
            html += `<option value="${ex.id}">${ex.name}</option>`;
        });
        html += '</optgroup>';
    }

    select.innerHTML = html;

    // Select first strength exercise by default
    if (strengthExercises.length > 0) {
        select.value = strengthExercises[0].id;
        loadProgressExercise(strengthExercises[0].id);
    }
}

// Load exercise data into Progress tab
export function loadProgressExercise(exerciseId) {
    const exercise = getExercise(exerciseId);
    if (!exercise) return;

    currentProgressExercise = exercise;

    // Update stats
    document.getElementById('progress-1rm').textContent = exercise.estimated1RM ? exercise.estimated1RM + ' lbs' : '—';
    document.getElementById('progress-working').textContent = exercise.workingWeight ? exercise.workingWeight + ' lbs' : '—';
    document.getElementById('progress-trend').textContent = exercise.trend === 'up' ? '↑' : exercise.trend === 'down' ? '↓' : '→';

    // Update strength level
    updateProgressLevel(exercise);

    // Render standards table and goal suggestions
    renderStandardsTable(exercise);
    renderGoalSuggestions(exercise);

    // Populate plan fields with current data
    document.getElementById('progress-plan-current').value = exercise.workingWeight || '';
    document.getElementById('progress-plan-increment').value = exercise.weightIncrement || 5;

    // Show active plan if exists
    const plans = get(KEYS.plans);
    const activePlan = plans.find(p => p.exerciseId === exerciseId && p.status === 'active');
    if (activePlan) {
        showActivePlan(activePlan);
    } else {
        document.getElementById('progress-active-plan').style.display = 'none';
    }
}

// Update strength level visualization
export function updateProgressLevel(exercise) {
    const profile = getObj(KEYS.profile);
    const bodyWeight = profile.bodyWeight || profile.weight || 180;
    const sex = profile.sex || 'male';

    if (!exercise.hasStandards || !exercise.estimated1RM) {
        document.getElementById('progress-level-display').style.display = 'none';
        return;
    }

    document.getElementById('progress-level-display').style.display = 'block';

    const standards = STANDARDS[sex][exercise.id];
    if (!standards) return;

    const ratio = exercise.estimated1RM / bodyWeight;
    let level = 0;
    for (let i = 0; i < standards.length; i++) {
        if (ratio >= standards[i]) level = i + 1;
    }

    const nextLevel = level < 5 ? standards[level] * bodyWeight : null;
    const levelName = LEVELS[level] || 'Beginner';
    const progress = level < 5 ? Math.min(100, ((ratio - (standards[level - 1] || 0)) / ((standards[level] || 999) - (standards[level - 1] || 0))) * 100) : 100;

    // Position marker
    const markerPos = (level * 20) + (progress / 100 * 20);
    document.getElementById('progress-marker').style.left = markerPos + '%';

    // Update info
    if (nextLevel) {
        const lbsToGo = Math.round(nextLevel - exercise.estimated1RM);
        document.getElementById('progress-level-info').textContent = `${levelName} • ${lbsToGo} lbs to ${LEVELS[level]}`;
    } else {
        document.getElementById('progress-level-info').textContent = `${levelName} • You've reached Elite!`;
    }
}

// Update 1RM and working weight
export function updateProgress() {
    const weight = parseFloat(document.getElementById('progress-calc-weight').value);
    const reps = parseInt(document.getElementById('progress-calc-reps').value);

    if (!weight || !reps || !currentProgressExercise) {
        showToast('Enter weight and reps');
        return;
    }

    const oneRM = calculate1RM(weight, reps);

    // Update exercise in library
    updateExercise(currentProgressExercise.id, {
        estimated1RM: oneRM,
        workingWeight: weight
    });

    // Refresh display
    loadProgressExercise(currentProgressExercise.id);
    showToast(`Updated! Est. 1RM: ${oneRM} lbs`, 'success');

    // Clear inputs
    document.getElementById('progress-calc-weight').value = '';
    document.getElementById('progress-calc-reps').value = '';
}

// Generate progression plan
export function generateProgressPlan() {
    const current = parseFloat(document.getElementById('progress-plan-current').value);
    const goal = parseFloat(document.getElementById('progress-plan-goal').value);
    const frequency = parseInt(document.getElementById('progress-plan-frequency').value);
    const increment = parseFloat(document.getElementById('progress-plan-increment').value);

    if (!current || !goal || !currentProgressExercise) {
        showToast('Fill in current and goal weights');
        return;
    }

    if (goal <= current) {
        showToast('Goal must be higher than current');
        return;
    }

    const totalIncrease = goal - current;
    const totalWeeks = Math.ceil(totalIncrease / increment) * (7 / frequency);

    const plans = get(KEYS.plans);

    // Cancel any existing plan for this exercise
    plans.forEach(p => {
        if (p.exerciseId === currentProgressExercise.id && p.status === 'active') {
            p.status = 'cancelled';
        }
    });

    // Create new plan
    const newPlan = {
        id: genId(),
        exerciseId: currentProgressExercise.id,
        type: 'strength',
        name: `${currentProgressExercise.name} to ${goal}`,
        startWeight: current,
        goalWeight: goal,
        currentWeight: current,
        weeklyIncrement: increment,
        frequencyPerWeek: frequency,
        currentWeek: 1,
        totalWeeks: Math.ceil(totalWeeks),
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    plans.push(newPlan);
    set(KEYS.plans, plans);

    showActivePlan(newPlan);
    showToast('Plan created!', 'success');
}

// Show active plan
export function showActivePlan(plan) {
    document.getElementById('progress-active-plan').style.display = 'block';
    document.getElementById('progress-plan-name').textContent = plan.name;

    const progress = ((plan.currentWeight - plan.startWeight) / (plan.goalWeight - plan.startWeight)) * 100;
    document.getElementById('progress-plan-progress').textContent = `Week ${plan.currentWeek} of ${plan.totalWeeks} • ${plan.currentWeight} lbs this week`;
    document.getElementById('progress-plan-bar').style.width = Math.min(100, progress) + '%';
}

// Cancel active plan
export function cancelProgressPlan() {
    if (!currentProgressExercise) return;

    const plans = get(KEYS.plans);
    const plan = plans.find(p => p.exerciseId === currentProgressExercise.id && p.status === 'active');

    if (plan) {
        plan.status = 'cancelled';
        set(KEYS.plans, plans);
        document.getElementById('progress-active-plan').style.display = 'none';
        showToast('Plan cancelled');
    }
}

// Render standards table
export function renderStandardsTable(exercise) {
    const profile = getObj(KEYS.profile);
    const bodyWeight = profile.bodyWeight || profile.weight || 180;
    const sex = profile.sex || 'male';

    const section = document.getElementById('progress-standards-section');
    const container = document.getElementById('progress-standards-table');

    if (!exercise.hasStandards || !STANDARDS[sex][exercise.id]) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    const standards = STANDARDS[sex][exercise.id];
    const current1RM = exercise.estimated1RM || 0;

    let html = '<div class="standards-table">';
    html += '<div class="standards-row header">';
    html += '<div class="standards-cell name">Level</div>';
    html += '<div class="standards-cell">1RM</div>';
    html += '<div class="standards-cell">Working (70%)</div>';
    html += '</div>';

    LEVELS.forEach((level, i) => {
        const rm = Math.round(standards[i] * bodyWeight);
        const working = Math.round(rm * 0.7);
        const isCurrent = current1RM >= rm && (i === LEVELS.length - 1 || current1RM < Math.round(standards[i + 1] * bodyWeight));

        html += `<div class="standards-row">`;
        html += `<div class="standards-cell name ${isCurrent ? 'current' : ''}">${level}</div>`;
        html += `<div class="standards-cell ${isCurrent ? 'current' : ''}">${rm}</div>`;
        html += `<div class="standards-cell ${isCurrent ? 'current' : ''}">${working}</div>`;
        html += `</div>`;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Render goal suggestions
export function renderGoalSuggestions(exercise) {
    const profile = getObj(KEYS.profile);
    const bodyWeight = profile.bodyWeight || profile.weight || 180;
    const sex = profile.sex || 'male';

    const section = document.getElementById('progress-goal-suggestions');
    const container = document.getElementById('progress-goal-chips');

    if (!exercise.hasStandards || !exercise.estimated1RM || !STANDARDS[sex][exercise.id]) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    const standards = STANDARDS[sex][exercise.id];
    const current1RM = exercise.estimated1RM;
    const currentWorking = exercise.workingWeight || Math.round(current1RM * 0.7);

    const goals = [];

    // Next weight increment (small goal)
    const increment = exercise.weightIncrement || 5;
    goals.push({
        weight: currentWorking + increment,
        label: `+${increment} lbs`,
        type: 'next'
    });

    // Round number milestones
    const milestones = [100, 135, 185, 225, 275, 315, 365, 405, 495];
    milestones.forEach(m => {
        if (m > currentWorking && m <= currentWorking + 100) {
            goals.push({
                weight: m,
                label: `${m} lbs plate`,
                type: 'milestone'
            });
        }
    });

    // Next strength level
    LEVELS.forEach((level, i) => {
        const levelRM = Math.round(standards[i] * bodyWeight);
        const levelWorking = Math.round(levelRM * 0.7);
        if (levelWorking > currentWorking && levelWorking <= currentWorking + 100) {
            goals.push({
                weight: levelWorking,
                label: level,
                type: 'level'
            });
        }
    });

    // Remove duplicates and sort
    const uniqueGoals = goals.filter((g, i, arr) =>
        arr.findIndex(x => x.weight === g.weight) === i
    ).sort((a, b) => a.weight - b.weight).slice(0, 6);

    let html = uniqueGoals.map(g => `
        <button type="button" class="goal-chip ${g.type}" onclick="window.selectGoal(${g.weight})">
            ${g.weight} lbs
            <span class="chip-label">${g.label}</span>
        </button>
    `).join('');

    container.innerHTML = html;
}

// Select goal (called from goal chip)
export function selectGoal(weight) {
    document.getElementById('progress-plan-goal').value = weight;
    showToast('Goal set to ' + weight + ' lbs');
}
