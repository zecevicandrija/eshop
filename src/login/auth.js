import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MDBModal,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter,
  MDBBtn,
} from "mdb-react-ui-kit"; // Uvoz komponenti modala

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null; // Postavi inicijalno stanje iz localStorage
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      setUser(null); // Osiguraj da je user null ako nema podataka
    }
  }, []); // Prazan dependency array jer se ovo izvršava samo pri montiranju

  const login = async (email, sifra) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, sifra });
      if (response.status === 200) {
        const loggedInUser = response.data.user;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        navigate("/profil");
        return loggedInUser;
      } else {
        setShowModal(true);
        setModalMessage("Neuspešna prijava. Proverite podatke.");
        console.error("Login failed:", response.data.message);
        return null;
      }
    } catch (error) {
      setModalMessage("Greška prilikom prijave. Pokušajte kasnije.");
      setShowModal(true);
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateUser = async (userData) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/update", userData);
      if (response.status === 200) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("User updated successfully:", updatedUser);
        return updatedUser;
      } else {
        setShowModal(true);
        setModalMessage("Neuspešno ažuriranje korisnika.");
        console.error("Update failed:", response.data.message);
        return null;
      }
    } catch (error) {
      setModalMessage("Greška prilikom ažuriranja korisnika.");
      setShowModal(true);
      console.error("Error updating user:", error);
      throw error;
    }
  };

  return (
    <>
      <AuthContext.Provider value={{ user, login, logout, updateUser }}>
        {children}
      </AuthContext.Provider>
      <MDBModal
        tabIndex="-1"
        show={showModal}
        getOpenState={(isOpen) => setShowModal(isOpen)}
        centered
      >
        <MDBModalHeader>Greška pri prijavi</MDBModalHeader>
        <MDBModalBody>{modalMessage}</MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color="secondary" onClick={closeModal}>
            Zatvori
          </MDBBtn>
        </MDBModalFooter>
      </MDBModal>
    </>
  );
};

export const useAuth = () => React.useContext(AuthContext);