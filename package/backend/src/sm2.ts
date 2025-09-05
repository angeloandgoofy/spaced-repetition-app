export interface SM2Result {
  easiness: number;
  interval: number;
  repetitions: number;
  dueDate: Date;
}

export interface SM2Input {
  quality: number; 
  easiness: number;
  interval: number;
  repetitions: number;
}

const LEARNING_INTERVALS = {
  HARD: 1,
  GOOD: 10,
  EASY_FIRST_REP: 1440, // 1 day in minutes
  EASY_SECOND_REP: 8640, // 6 days in minutes
} as const;

const MIN_EASINESS = 1.3;
const EASINESS_ADJUSTMENT = {
  BASE: 0.1,
  PENALTY_FACTOR: 0.08,
  PENALTY_MULTIPLIER: 0.02,
} as const;

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easiness, interval, repetitions } = input;
  
  // Validate and normalize inputs
  const normalizedQuality = Math.max(0, Math.min(5, Math.round(quality)));
  const normalizedEasiness = Math.max(MIN_EASINESS, easiness);
  const normalizedInterval = Math.max(0, interval);
  const normalizedRepetitions = Math.max(0, repetitions);
  
  let newEasiness = normalizedEasiness;
  let newIntervalMs: number;
  let newRepetitions = normalizedRepetitions;
  
  const now = Date.now();
  
  if (normalizedQuality >= 3) {
    // Successful review
    newRepetitions = normalizedRepetitions + 1;
    
    if (normalizedQuality === 3) {
      // Hard - short learning step
      newIntervalMs = LEARNING_INTERVALS.HARD * 60 * 1000;
    } else if (normalizedQuality === 4) {
      // Good - medium learning step  
      newIntervalMs = LEARNING_INTERVALS.GOOD * 60 * 1000;
    } else {
      // Easy - graduate to spaced repetition or use longer intervals
      if (newRepetitions === 1) {
        newIntervalMs = LEARNING_INTERVALS.EASY_FIRST_REP * 60 * 1000;
      } else if (newRepetitions === 2) {
        newIntervalMs = LEARNING_INTERVALS.EASY_SECOND_REP * 60 * 1000;
      } else {
        // Use previous interval in milliseconds for calculation
        newIntervalMs = Math.round(normalizedInterval * normalizedEasiness);
      }
    }
    
    // Update easiness factor using SM-2 formula
    newEasiness = normalizedEasiness + (
      EASINESS_ADJUSTMENT.BASE - 
      (5 - normalizedQuality) * (
        EASINESS_ADJUSTMENT.PENALTY_FACTOR + 
        (5 - normalizedQuality) * EASINESS_ADJUSTMENT.PENALTY_MULTIPLIER
      )
    );
  } else {
    // Failed review - reset card
    newRepetitions = 0;
    newIntervalMs = LEARNING_INTERVALS.HARD * 60 * 1000;
    // Easiness stays the same on failure
  }
  
  // Ensure easiness doesn't go below minimum
  newEasiness = Math.max(MIN_EASINESS, newEasiness);
  
  // Calculate due date
  const dueDate = new Date(now + newIntervalMs);
  
  return {
    easiness: Number(newEasiness.toFixed(2)),
    interval: Math.round(newIntervalMs), // Integer milliseconds for database
    repetitions: newRepetitions,
    dueDate,
  };
}


export function isDue(dueDate: Date, threshold = 1): boolean {
  const thresholdMS = threshold * 60 * 1000;

    const now = Date.now();
    const dueTime = dueDate.getTime();

    const diffMs = dueTime - now;

    return diffMs <= thresholdMS; 
}
