import { useEffect, useCallback } from 'react';
import type { ClientEvent } from '@color-battle/shared';
import { connect, send as wsSend } from '../lib/websocket';

export function useWebSocket() {
  useEffect(() => {
    connect();
  }, []);

  const send = useCallback((event: ClientEvent) => {
    wsSend(event);
  }, []);

  return { send };
}
