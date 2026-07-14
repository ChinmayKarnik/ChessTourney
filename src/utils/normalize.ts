import { Dimensions, PixelRatio } from 'react-native';

// Reference screen dimensions (design based on 360x800)
const REFERENCE_WIDTH = 360;
const REFERENCE_HEIGHT = 800;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Normalize width based on reference width (360)
 * @param {number} size - The design pixel value
 * @returns {number} - The scaled value for the current device
 */
export function normalizeWidth(size: number): number {
  return Math.round((SCREEN_WIDTH / REFERENCE_WIDTH) * size);
}

/**
 * Normalize height based on reference height (800)
 * @param {number} size - The design pixel value
 * @returns {number} - The scaled value for the current device
 */
export function normalizeHeight(size: number): number {
  return Math.round((SCREEN_HEIGHT / REFERENCE_HEIGHT) * size);
}

export const normalize = normalizeHeight;

export const normalizeHeightF = (x: number, y: number): number => {
  return normalizeHeight(x)*(1.0/y);
}

export const normalizeWidthF = (x: number, y: number): number => {
  return normalizeWidth(x)*(1.0/y);
}

export const normalizeF = (x: number, y: number): number => {
  return normalize(x)*(1.0/y)
}