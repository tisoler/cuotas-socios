'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Usuario } from '../modelos/usuario';
import { getToken, removeToken, validateToken } from '../lib/autenticar';

interface UserContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
  cargandoUsuario: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      setCargandoUsuario(true);
      const token = getToken();
      if (token) {
        const validatedUser = await validateToken(token);
        if (validatedUser) {
          setUser(validatedUser);
        } else {
          removeToken();
        }
        setCargandoUsuario(false);
      }
      setCargandoUsuario(false);
    };

    checkUser();
  }, []);

  const logout = () => {
    setUser(null);
    removeToken();
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, cargandoUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
