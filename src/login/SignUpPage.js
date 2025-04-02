import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import styles from './SignUpPage.module.css';

const SignUpPage = () => {
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [email, setEmail] = useState("");
  const [sifra, setSifra] = useState("");
  const [adresa, setAdresa] = useState("");
  const [telefon, setTelefon] = useState("");
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/korisnici", {
        ime,
        prezime,
        email,
        sifra,
        uloga: "korisnik", // Fiksna vrednost
        telefon,
        adresa
      });
      alert(response.data.message);
      navigate("/");
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className={styles.container}>
        <div className={styles.card}>
            <div className={styles.header}>
                <h1 className={styles.mainTitle}>BalkanKeys</h1>
                <h2 className={styles.subTitle}>Registrujte se</h2>
            </div>

            <div className={styles.sectionDivider}></div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Ime</label>
                        <input
                            className={styles.inputField}
                            type="text"
                            placeholder="Enter first name"
                            value={ime}
                            onChange={(e) => setIme(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Prezime</label>
                        <input
                            className={styles.inputField}
                            type="text"
                            placeholder="Enter last name"
                            value={prezime}
                            onChange={(e) => setPrezime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className={styles.sectionDivider}></div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email</label>
                    <input
                        className={styles.inputField}
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Lozinka</label>
                    <input
                        className={styles.inputField}
                        type="password"
                        placeholder="Enter password"
                        value={sifra}
                        onChange={(e) => setSifra(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Telefon</label>
                    <input
                        className={styles.inputField}
                        type="tel"
                        placeholder="Enter phone number"
                        value={telefon}
                        onChange={(e) => setTelefon(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Adresa</label>
                    <input
                        className={styles.inputField}
                        type="text"
                        placeholder="Enter address"
                        value={adresa}
                        onChange={(e) => setAdresa(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.sectionDivider}></div>

                <div className={styles.termsGroup}>
                    <input 
                        type="checkbox" 
                        id="terms" 
                        className={styles.checkbox}
                        required 
                    />
                    <label className={styles.termsLabel}>
                        I agree with the <a href="/terms" className={styles.termsLink}>Terms</a> and 
                        <a href="/privacy" className={styles.termsLink}> Privacy policy</a>
                    </label>
                </div>

                <button type="submit" className={styles.submitButton}>
                    Submit
                </button>

                <a href="/" className={styles.backLink}>« Back</a>
            </form>
        </div>
    </div>
  );
};

export default SignUpPage;