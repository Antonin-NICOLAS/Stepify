// context/UserContext.jsx
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get(process.env.NODE_ENV === "production" ? '/api/auth/profile' : '/auth/profile', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUser(response.data);
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      console.error("Unauthorized:", msg);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);