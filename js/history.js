import { KEYS } from './data.js';
import { get, set, esc, showToast, getExercise } from './storage.js';
import { showConfirm } from './workout.js';

// Render history list
export function renderHistory() {
    const history = get(KEYS.history).sort((a, b) => new Date(b.date) - new Date(a.date));
    const list = document.getElementById('history-list');

    if (history.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p class="empty-text">No workouts logged yet.</p></div>';
        return;
    }

    list.innerHTML = history.map(w => {
        const date = new Date(w.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const duration = w.duration ? Math.round(w.duration / 60000) + ' min' : '';
        const hasPRs = w.prsAchieved && w.prsAchieved.length > 0;

        // Format exercise summary for v4
        const summary = w.exercises.map(e => {
            const exercise = getExercise(e.exerciseId);
            if (!exercise) return '';

            if (e.type === 'cardio') {
                return `${e.isWarmup ? '☀ ' : ''}${exercise.name}: ${e.actualTime || e.time}min`;
            } else {
                const completed = e.sets ? e.sets.filter(s => s.completed) : [];
                if (completed.length === 0) return '';
                const topSet = completed.reduce((max, s) => (parseFloat(s.weight) || 0) > (parseFloat(max.weight) || 0) ? s : max, completed[0]);
                return `${e.isWarmup ? '☀ ' : ''}${exercise.name}: ${topSet.weight}×${topSet.reps}`;
            }
        }).filter(s => s).join(' • ');

        return `
            <div class="history-card" onclick="window.viewWorkout('${w.id}')">
                <div class="history-header">
                    <span class="history-name">${esc(w.templateName)} ${hasPRs ? '🏆' : ''}</span>
                    <span class="history-date">${date}</span>
                </div>
                <div class="history-summary">${summary || 'No exercises completed'}</div>
                ${duration ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${duration}</div>` : ''}
            </div>`;
    }).join('');
}

// View workout detail
export function viewWorkout(id) {
    const w = get(KEYS.history).find(x => x.id === id);
    if (!w) return;

    const date = new Date(w.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const hasPRs = w.prsAchieved && w.prsAchieved.length > 0;

    document.getElementById('workout-modal-title').textContent = w.templateName + (hasPRs ? ' 🏆' : '');
    document.getElementById('workout-modal-date').textContent = date;

    let html = '';

    // Show PRs if any
    if (hasPRs) {
        html += `<div style="padding: 12px; background: var(--bg); border-radius: 8px; margin-bottom: 12px; border-left: 3px solid var(--accent);">
            <strong style="color: var(--accent);">🏆 Personal Records</strong>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 6px;">${w.prsAchieved.join('<br>')}</div>
        </div>`;
    }

    // Show exercises
    html += w.exercises.map(e => {
        const exercise = getExercise(e.exerciseId);
        if (!exercise) return '';

        const warmupLabel = e.isWarmup ? ' (warmup)' : '';

        if (e.type === 'cardio') {
            return `<div class="card" style="margin-bottom: 10px;">
                <div class="card-title">${e.isWarmup ? '☀ ' : ''}${esc(exercise.name)}${warmupLabel}</div>
                <div class="card-subtitle">${e.actualTime || e.time} min @ Resistance ${e.actualResistance || e.resistance || 'N/A'}</div>
            </div>`;
        } else {
            const completed = e.sets ? e.sets.filter(s => s.completed) : [];
            return `<div class="card" style="margin-bottom: 10px;">
                <div class="card-title">${e.isWarmup ? '☀ ' : ''}${esc(exercise.name)}${warmupLabel}</div>
                <div class="card-subtitle">${completed.map((s, i) => `Set ${i + 1}: ${s.weight} × ${s.reps}`).join('<br>') || 'No sets completed'}</div>
            </div>`;
        }
    }).join('');

    // Show notes if any
    if (w.notes && w.notes.trim()) {
        html += `<div style="padding: 12px; background: var(--bg); border-radius: 8px; margin-top: 12px;">
            <strong style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">Notes</strong>
            <div style="font-size: 13px; color: var(--text); margin-top: 6px; line-height: 1.5;">${esc(w.notes)}</div>
        </div>`;
    }

    document.getElementById('workout-modal-exercises').innerHTML = html;

    document.getElementById('delete-workout-btn').onclick = () => {
        showConfirm('Delete this workout?', function() {
            set(KEYS.history, get(KEYS.history).filter(x => x.id !== id));
            renderHistory();
            document.getElementById('workout-modal').classList.remove('active');
            showToast('Workout deleted');
        });
    };
    document.getElementById('workout-modal').classList.add('active');
}
