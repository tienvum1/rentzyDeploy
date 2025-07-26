// fe/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // isLoading now represents the initial auth check
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

  useEffect(() => {
    // This effect runs once on mount to check the user's authentication status
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile`, {
          withCredentials: true,
        });
        const fetchedUser = response.data.user;
        setUser(fetchedUser);
        // If user is fetched, load their favorites from localStorage
        if (fetchedUser) {
          const storedFavorites = localStorage.getItem(`favoriteVehicles_${fetchedUser._id}`);
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          }
        }
      } catch (error) {
        // Not logged in or token expired
        setUser(null);
        setFavorites([]);
      } finally {
        // Auth check is complete, app is no longer loading
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = async () => {
    setIsLoading(true);
    setFavorites([]); // Immediately clear favorites on login attempt
    try {
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        withCredentials: true,
      });
      const loggedInUser = response.data.user;
      setUser(loggedInUser);
      if (loggedInUser) {
        const storedFavorites = localStorage.getItem(`favoriteVehicles_${loggedInUser._id}`);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        } else {
          setFavorites([]); // Ensure favorites are empty if nothing is in storage
        }
      } else {
        setUser(null);
        setFavorites([]);
      }
    } catch (error) {
      setUser(null);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setFavorites([]); // Clear favorites from UI state on logout

    // DO NOT REMOVE from localStorage. The user's favorites should persist for their next login.
    // The line below was incorrect and has been removed.
    // localStorage.removeItem(`favoriteVehicles_${user?._id}`); 

    try {
      await axios.get(`${backendUrl}/api/auth/logout`, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error during backend logout:", error);
    }
  };

  const toggleFavorite = (vehicle) => {
    if (!user) {
      console.log("User must be logged in to favorite items.");
      return;
    }
    const key = `favoriteVehicles_${user._id}`;
    
    // Use a callback with setFavorites to ensure we have the latest state
    setFavorites(prevFavorites => {
      const isAlreadyFavorite = prevFavorites.some(fav => fav._id === vehicle._id);
      let updatedFavorites;

      if (isAlreadyFavorite) {
        updatedFavorites = prevFavorites.filter(fav => fav._id !== vehicle._id);
      } else {
        updatedFavorites = [...prevFavorites, vehicle];
      }
      
      localStorage.setItem(key, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    user,
    setUser, // Keep setUser for direct updates if needed elsewhere
    isAuthenticated: !!user,
    isLoading,
    favorites,
    toggleFavorite,
    login,
    logout,
  }), [user, isLoading, favorites]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
