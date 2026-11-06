
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('newsreader_user');

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (username, password, role = 'regular') => {
    if (!username.trim() || !password.trim()) {
      throw new Error('Username and password are required');
    }

    const newUser = {
      username: username.trim(),
      role,
    };

    setUser(newUser);
    localStorage.setItem(
      'newsreader_user',
      JSON.stringify(newUser)
    );

    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('newsreader_user');
  };

  const isAuthenticated = () => {
    return Boolean(user);
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}
