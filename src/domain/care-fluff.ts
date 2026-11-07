export interface CareFluffPorts {
  readonly gameTcp: number;
  readonly voiceUdp: number;
  readonly bluemapTcp: number;
  readonly rconTcp: number;
  readonly queryUdp: number;
}

export interface ServerEndpointSummary {
  readonly mcAddress: string;
  readonly directSocket: string;
  readonly voiceSocket: string;
  readonly bluemapOrigin: string;
}

export const DEFAULT_CARE_FLUFF_PORTS: CareFluffPorts = {
  gameTcp: 25965,
  queryUdp: 25966,
  rconTcp: 25967,
  voiceUdp: 25968,
  bluemapTcp: 25969,
};

export function buildServerEndpoints(
  ip: string,
  ports: CareFluffPorts
): ServerEndpointSummary {
  return {
    mcAddress: 'mc.fluff.care',
    directSocket: `${ip}:${String(ports.gameTcp)}`,
    voiceSocket: `${ip}:${String(ports.voiceUdp)}`,
    bluemapOrigin: `http://${ip}:${String(ports.bluemapTcp)}`,
  };
}

export function hasDistinctPorts(ports: CareFluffPorts): boolean {
  const unique = new Set([
    ports.gameTcp,
    ports.voiceUdp,
    ports.bluemapTcp,
    ports.rconTcp,
    ports.queryUdp,
  ]);
  return unique.size === 5;
}

export function formatPlayerStatus(online: number, max: number): string {
  if (online <= 0) {
    return `Cozy Realm Ready • 0/${String(max)} Floofs`;
  }
  return `ONLINE • ${String(online)}/${String(max)} Floofs Playing`;
}
