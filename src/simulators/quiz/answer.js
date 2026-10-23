import { CASOS } from '../../core/audio.js';

export function evaluateAnswer(expected, selected) {
  if (!Object.hasOwn(CASOS, expected) || !Object.hasOwn(CASOS, selected)) {
    throw new RangeError('Caso auditivo desconhecido');
  }
  return { correct: expected === selected, expected, selected };
}
