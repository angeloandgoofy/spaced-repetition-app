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

export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easiness, interval, repetitions } = input;
  let newEasiness = easiness;
  let newInterval = interval;
  let newRepetitions = repetitions;
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  if (q >= 3) {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easiness);
    }
    newEasiness = easiness + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }
  newEasiness = Math.max(1.3, newEasiness);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);
  return {
    easiness: Number(newEasiness.toFixed(2)),
    interval: newInterval,
    repetitions: newRepetitions,
    dueDate,
  };
}

export function isDue(dueDate: Date): boolean {
  return new Date() >= dueDate;
}