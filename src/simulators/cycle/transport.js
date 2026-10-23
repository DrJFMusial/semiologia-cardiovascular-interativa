import { normalizeTime } from './model.js';

// Resolução didática fixa: 80 quadros por ciclo, independente da velocidade.
export const FRAME_SECONDS = 0.01;
export function advanceFrame(t, direction = 1) {
  if (direction !== 1 && direction !== -1) throw new RangeError('Direção deve ser 1 ou -1');
  return normalizeTime(t + direction * FRAME_SECONDS);
}
