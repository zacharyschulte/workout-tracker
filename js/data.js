// Storage keys
export const KEYS = {
    templates: 'iron_templates_v4',
    history: 'iron_history_v4',
    profile: 'iron_profile_v4',
    exercises: 'iron_exercises_v4',
    plans: 'iron_plans_v4'
};

// IRON v4 - Comprehensive Exercise Library
export const EXERCISE_LIBRARY = {
    // Strength - Barbell
    'bench-press': { id: 'bench-press', name: 'Bench Press', category: 'strength', equipment: 'barbell', muscleGroup: 'chest', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'incline-bench': { id: 'incline-bench', name: 'Incline Bench Press', category: 'strength', equipment: 'barbell', muscleGroup: 'chest', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'back-squat': { id: 'back-squat', name: 'Back Squat', category: 'strength', equipment: 'barbell', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 10 },
    'front-squat': { id: 'front-squat', name: 'Front Squat', category: 'strength', equipment: 'barbell', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'deadlift': { id: 'deadlift', name: 'Deadlift', category: 'strength', equipment: 'barbell', muscleGroup: 'back', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 10 },
    'romanian-deadlift': { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'strength', equipment: 'barbell', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 10 },
    'overhead-press': { id: 'overhead-press', name: 'Overhead Press', category: 'strength', equipment: 'barbell', muscleGroup: 'shoulders', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },
    'barbell-row': { id: 'barbell-row', name: 'Barbell Row', category: 'strength', equipment: 'barbell', muscleGroup: 'back', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'barbell-curl': { id: 'barbell-curl', name: 'Barbell Curl', category: 'strength', equipment: 'barbell', muscleGroup: 'arms', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },

    // Strength - Dumbbell
    'db-bench': { id: 'db-bench', name: 'Dumbbell Bench Press', category: 'strength', equipment: 'dumbbell', muscleGroup: 'chest', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'db-row': { id: 'db-row', name: 'Dumbbell Row', category: 'strength', equipment: 'dumbbell', muscleGroup: 'back', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'lateral-raise': { id: 'lateral-raise', name: 'Lateral Raises', category: 'strength', equipment: 'dumbbell', muscleGroup: 'shoulders', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },
    'db-curl': { id: 'db-curl', name: 'Dumbbell Curls', category: 'strength', equipment: 'dumbbell', muscleGroup: 'arms', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },
    'tricep-extension': { id: 'tricep-extension', name: 'Tricep Extensions', category: 'strength', equipment: 'dumbbell', muscleGroup: 'arms', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },
    'db-lunge': { id: 'db-lunge', name: 'Dumbbell Lunges', category: 'strength', equipment: 'dumbbell', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'goblet-squat': { id: 'goblet-squat', name: 'Goblet Squat', category: 'strength', equipment: 'dumbbell', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'db-shoulder-press': { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'strength', equipment: 'dumbbell', muscleGroup: 'shoulders', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },
    'db-chest-fly': { id: 'db-chest-fly', name: 'Dumbbell Chest Fly', category: 'strength', equipment: 'dumbbell', muscleGroup: 'chest', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },

    // Strength - Kettlebell
    'kb-swing': { id: 'kb-swing', name: 'Kettlebell Swing', category: 'strength', equipment: 'kettlebell', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 5 },
    'kb-goblet-squat': { id: 'kb-goblet-squat', name: 'Kettlebell Goblet Squat', category: 'strength', equipment: 'kettlebell', muscleGroup: 'legs', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 5 },
    'turkish-getup': { id: 'turkish-getup', name: 'Turkish Get-up', category: 'strength', equipment: 'kettlebell', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 5 },
    'farmers-walk': { id: 'farmers-walk', name: 'Farmers Walk', category: 'strength', equipment: 'kettlebell', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'weight-time', weightIncrement: 5 },
    'kb-clean-press': { id: 'kb-clean-press', name: 'Kettlebell Clean & Press', category: 'strength', equipment: 'kettlebell', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 5 },

    // Strength - Cable/Machine
    'lat-pulldown': { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'strength', equipment: 'cable', muscleGroup: 'back', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'cable-row': { id: 'cable-row', name: 'Cable Row', category: 'strength', equipment: 'cable', muscleGroup: 'back', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'leg-press': { id: 'leg-press', name: 'Leg Press', category: 'strength', equipment: 'machine', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 10 },
    'leg-curl': { id: 'leg-curl', name: 'Leg Curl', category: 'strength', equipment: 'machine', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'leg-extension': { id: 'leg-extension', name: 'Leg Extension', category: 'strength', equipment: 'machine', muscleGroup: 'legs', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 5 },
    'cable-fly': { id: 'cable-fly', name: 'Cable Fly', category: 'strength', equipment: 'cable', muscleGroup: 'chest', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },
    'tricep-pushdown': { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'strength', equipment: 'cable', muscleGroup: 'arms', hasStandards: true, trackingType: 'weight-reps', weightIncrement: 2.5 },

    // Strength - Bodyweight
    'pullup': { id: 'pullup', name: 'Pull-ups', category: 'strength', equipment: 'bodyweight', muscleGroup: 'back', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 5 },
    'pushup': { id: 'pushup', name: 'Push-ups', category: 'strength', equipment: 'bodyweight', muscleGroup: 'chest', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 0 },
    'dip': { id: 'dip', name: 'Dips', category: 'strength', equipment: 'bodyweight', muscleGroup: 'chest', hasStandards: false, trackingType: 'weight-reps', weightIncrement: 5 },
    'plank': { id: 'plank', name: 'Plank', category: 'strength', equipment: 'bodyweight', muscleGroup: 'core', hasStandards: false, trackingType: 'weight-time', weightIncrement: 0 },

    // Cardio
    'treadmill': { id: 'treadmill', name: 'Treadmill', category: 'cardio', equipment: 'machine', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'cardio', cardioFields: ['time', 'speed', 'incline'] },
    'elliptical': { id: 'elliptical', name: 'Elliptical', category: 'cardio', equipment: 'machine', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'cardio', cardioFields: ['time', 'resistance'] },
    'stationary-bike': { id: 'stationary-bike', name: 'Stationary Bike', category: 'cardio', equipment: 'machine', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'cardio', cardioFields: ['time', 'resistance'] },
    'rowing-machine': { id: 'rowing-machine', name: 'Rowing Machine', category: 'cardio', equipment: 'machine', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'cardio', cardioFields: ['time', 'distance'] },
    'stair-climber': { id: 'stair-climber', name: 'Stair Climber', category: 'cardio', equipment: 'machine', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'cardio', cardioFields: ['time', 'resistance'] },
    'jump-rope': { id: 'jump-rope', name: 'Jump Rope', category: 'cardio', equipment: 'bodyweight', muscleGroup: 'fullbody', hasStandards: false, trackingType: 'cardio', cardioFields: ['time'] }
};

// Strength standards (multipliers of bodyweight)
export const STANDARDS = {
    male: {
        'bench-press': [0.50, 0.75, 1.00, 1.50, 2.00],
        'incline-bench': [0.50, 0.75, 1.00, 1.50, 2.00],
        'back-squat': [0.75, 1.00, 1.50, 2.00, 2.75],
        'front-squat': [0.60, 0.85, 1.15, 1.50, 1.90],
        'deadlift': [1.00, 1.25, 1.75, 2.25, 3.00],
        'overhead-press': [0.35, 0.50, 0.75, 1.00, 1.25],
        'barbell-row': [0.40, 0.55, 0.75, 1.00, 1.25],
        'romanian-deadlift': [0.75, 1.00, 1.35, 1.75, 2.25],
        'barbell-curl': [0.30, 0.40, 0.55, 0.70, 0.90],
        'db-bench': [0.20, 0.30, 0.40, 0.60, 0.80],
        'db-row': [0.20, 0.30, 0.40, 0.55, 0.70],
        'db-shoulder-press': [0.15, 0.20, 0.30, 0.40, 0.50],
        'lateral-raise': [0.05, 0.08, 0.12, 0.17, 0.22],
        'db-curl': [0.08, 0.12, 0.17, 0.23, 0.30],
        'lat-pulldown': [0.50, 0.70, 0.90, 1.20, 1.50],
        'cable-row': [0.50, 0.70, 0.90, 1.20, 1.50],
        'leg-press': [1.50, 2.00, 2.75, 3.50, 4.50],
        'leg-curl': [0.25, 0.35, 0.50, 0.65, 0.85],
        'leg-extension': [0.30, 0.40, 0.55, 0.75, 1.00],
        'cable-fly': [0.15, 0.20, 0.30, 0.40, 0.55],
        'tricep-pushdown': [0.20, 0.30, 0.45, 0.60, 0.80]
    },
    female: {
        'bench-press': [0.25, 0.40, 0.60, 0.85, 1.15],
        'incline-bench': [0.25, 0.40, 0.60, 0.85, 1.15],
        'back-squat': [0.50, 0.75, 1.00, 1.35, 1.75],
        'front-squat': [0.40, 0.55, 0.75, 1.00, 1.30],
        'deadlift': [0.65, 0.90, 1.25, 1.65, 2.10],
        'overhead-press': [0.20, 0.30, 0.45, 0.60, 0.80],
        'barbell-row': [0.25, 0.40, 0.55, 0.70, 0.90],
        'romanian-deadlift': [0.50, 0.70, 0.95, 1.25, 1.60],
        'barbell-curl': [0.20, 0.25, 0.35, 0.45, 0.60],
        'db-bench': [0.10, 0.15, 0.25, 0.35, 0.45],
        'db-row': [0.10, 0.18, 0.25, 0.35, 0.45],
        'db-shoulder-press': [0.08, 0.12, 0.18, 0.25, 0.32],
        'lateral-raise': [0.03, 0.05, 0.08, 0.11, 0.15],
        'db-curl': [0.05, 0.08, 0.11, 0.15, 0.20],
        'lat-pulldown': [0.35, 0.50, 0.65, 0.85, 1.10],
        'cable-row': [0.35, 0.50, 0.65, 0.85, 1.10],
        'leg-press': [1.00, 1.50, 2.00, 2.75, 3.50],
        'leg-curl': [0.15, 0.25, 0.35, 0.50, 0.65],
        'leg-extension': [0.20, 0.30, 0.40, 0.55, 0.75],
        'cable-fly': [0.08, 0.12, 0.18, 0.25, 0.35],
        'tricep-pushdown': [0.12, 0.18, 0.28, 0.40, 0.55]
    }
};

export const LEVELS = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
