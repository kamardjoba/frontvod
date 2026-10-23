import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const url = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '');
    const s = io(url, { withCredentials: true, transports: ['websocket', 'polling'] });
    if (user.role === 'administrator') {
      s.emit('join', { room: 'admin' });
    }
    setSocket(s);
    return () => s.disconnect();
  }, [user?.id, user?.role]);

  const value = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
