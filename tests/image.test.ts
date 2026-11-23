import { describe, expect, it } from 'vitest';
import { clampTransform, fitImage, zoomAt } from '../src/image';

describe('photo framing', () => {
  it('covers the square with portrait and landscape photos', () => {
    expect(fitImage(600, 1200)).toEqual({ width: 1, height: 2 });
    expect(fitImage(1200, 600)).toEqual({ width: 2, height: 1 });
  });

  it('never exposes blank edges after dragging, even at 1000%', () => {
    const value = clampTransform({ x: 99, y: -99, zoom: 10 }, { width: 1, height: 2 });
    expect(value.x).toBeCloseTo(3.5325);
    expect(value.y).toBeCloseTo(-7.4575);
    expect(value.zoom).toBe(10);
    expect(clampTransform({ x: 1, y: 1, zoom: 1 }, { width: 1, height: 1 }))
      .toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('uses the inset photo area when limiting portrait and landscape dragging', () => {
    expect(clampTransform({ x: 1, y: -1, zoom: 1 }, fitImage(1200, 600)).x)
      .toBeCloseTo(0.3925);
    expect(clampTransform({ x: 1, y: -1, zoom: 1 }, fitImage(600, 1200)).y)
      .toBeCloseTo(-0.3925);
  });

  it('keeps the point under the fingers fixed when pinching', () => {
    const next = zoomAt({ x: 0, y: 0, zoom: 1 }, 2, { x: 0.2, y: 0.1 });
    expect(next.x).toBeCloseTo(-0.2);
    expect(next.y).toBeCloseTo(-0.1);
    expect(next.zoom).toBe(2);
  });
});
