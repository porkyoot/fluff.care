import { describe, expect, it } from 'vitest';
import {
  ACCENT_THEMES,
  CARE_FLUFF_STRINGS,
  DEFAULT_CARE_FLUFF_PORTS,
  buildServerEndpoints,
  formatPlayerStatus,
  hasDistinctPorts,
} from '../index';

describe('care-fluff domain configuration', () => {
  it('defines non-overlapping ports for Game, VoiceChat, BlueMap, RCON, and Query', () => {
    expect(DEFAULT_CARE_FLUFF_PORTS.gameTcp).toBe(25965);
    expect(DEFAULT_CARE_FLUFF_PORTS.queryUdp).toBe(25966);
    expect(DEFAULT_CARE_FLUFF_PORTS.rconTcp).toBe(25967);
    expect(DEFAULT_CARE_FLUFF_PORTS.voiceUdp).toBe(25968);
    expect(DEFAULT_CARE_FLUFF_PORTS.bluemapTcp).toBe(25969);
    expect(hasDistinctPorts(DEFAULT_CARE_FLUFF_PORTS)).toBe(true);
  });

  it('detects colliding port allocations when any two services share a port', () => {
    const colliding = {
      ...DEFAULT_CARE_FLUFF_PORTS,
      voiceUdp: 25966,
    };
    expect(hasDistinctPorts(colliding)).toBe(false);
  });

  it('builds complete socket and BlueMap origin URLs for the Nitro Games host', () => {
    const endpoints = buildServerEndpoints(
      '109.239.158.180',
      DEFAULT_CARE_FLUFF_PORTS
    );
    expect(endpoints).toStrictEqual({
      mcAddress: 'mc.fluff.care',
      directSocket: '109.239.158.180:25965',
      voiceSocket: '109.239.158.180:25968',
      bluemapOrigin: 'http://109.239.158.180:25969',
    });
  });

  it('formats live player counts accurately for zero, negative, and active players', () => {
    expect(formatPlayerStatus(0, 64)).toBe('Cozy Realm Ready • 0/64 Floofs');
    expect(formatPlayerStatus(-1, 64)).toBe('Cozy Realm Ready • 0/64 Floofs');
    expect(formatPlayerStatus(12, 64)).toBe('ONLINE • 12/64 Floofs Playing');
  });

  it('exposes complete design tokens and localized UI strings from the barrel', () => {
    expect(Object.keys(ACCENT_THEMES)).toHaveLength(8);
    expect(CARE_FLUFF_STRINGS.brandName).toBe('Care Fluff');
  });
});
