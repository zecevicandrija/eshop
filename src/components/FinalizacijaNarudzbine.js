import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from './Modal';
import './FinalizacijaNarudzbine.css';

const FinalizacijaNarudzbine = ({ isprazniKorpu }) => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [transakcijaData, setTransakcijaData] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");

    useEffect(() => {
        if (state && state.korpa) {
            setTransakcijaData({
                ime: state.ime,
                prezime: state.prezime,
                email: state.email,
                adresa: state.adresa,
                telefon: state.telefon,
                datum_transakcije: new Date().toISOString(),
                izabranih_proizovda: state.korpa.length,
                proizvodi: state.korpa.map(proizvod => ({
                    id: proizvod.id,
                    ime: proizvod.ime,
                    cena: proizvod.cena,
                    kolicina: proizvod.kolicina,
                    popust: proizvod.popust || proizvod.cena
                }))
            });
            setLoading(false);
        } else {
            navigate('/korpa');
        }
    }, [state, navigate]);

    const handleZavrsiNarudzbinu = async () => {
        try {
            const { ime, prezime, email, adresa, telefon, datum_transakcije, proizvodi } = transakcijaData;
    
            if (!ime || !prezime || !email || !adresa || !telefon || !datum_transakcije || !proizvodi) {
                throw new Error('Neka obavezna polja nedostaju');
            }
    
            const formattedDate = new Date(datum_transakcije).toISOString().slice(0, 19).replace('T', ' ');
    
            const dataToSend = {
                ...transakcijaData,
                datum_transakcije: formattedDate,
            };
    
            // Pošalji podatke transakcije
            await axios.post('http://localhost:5000/api/transakcije', dataToSend);
    
            // Ažuriraj količine proizvoda
            for (const proizvod of proizvodi) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/proizvodi/${proizvod.id}`);
                    const trenutnaKolicina = response.data.kolicina;
    
                    if (trenutnaKolicina !== undefined) {
                        // Proveri da li je količina dovoljna
                        if (trenutnaKolicina < proizvod.kolicina) {
                            throw new Error(`Nema dovoljno zaliha za proizvod ID: ${proizvod.id}`);
                        }
    
                        await axios.put(`http://localhost:5000/api/proizvodi/${proizvod.id}`, {
                            kolicina: trenutnaKolicina - proizvod.kolicina
                        });
                    } else {
                        throw new Error(`Proizvod sa ID: ${proizvod.id} ne postoji.`);
                    }
                } catch (err) {
                    console.error(`Greška pri ažuriranju količine za proizvod ID: ${proizvod.id}`, err);
                    throw new Error('Došlo je do greške prilikom ažuriranja količine proizvoda.');
                }
            }
    
            // Uspeh: Isprazni korpu i prikaži modal uspeha
            if (typeof isprazniKorpu === 'function') {
                isprazniKorpu(); 
            }
            setModalMessage("Uspešno ste završili kupovinu!");
            setShowModal(true);
    
        } catch (error) {
            console.error('Greška pri završavanju narudžbine:', error);
            setModalMessage("Došlo je do greške prilikom kupovine.");
            setShowModal(true);
        }
    };
    

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/'); // Preusmeri na početnu stranicu
    };

    if (loading) {
        return <p>Učitavanje...</p>;
    }

    return (
        <div className="finalizacija-narudzbine-container">
            <h1>Finalizacija Narudžbine</h1>
            <h2>Vaši Podaci</h2>
            <p>Ime: {transakcijaData.ime}</p>
            <p>Prezime: {transakcijaData.prezime}</p>
            <p>Email: {transakcijaData.email}</p>
            <p>Adresa: {transakcijaData.adresa}</p>
            <p>Telefon: {transakcijaData.telefon}</p>

            <h2>Vaša Narudžbina</h2>
            <ul>
                {transakcijaData.proizvodi && transakcijaData.proizvodi.map((proizvod) => (
                    <li key={proizvod.id}>
                        {proizvod.ime} - Cena: {proizvod.popust} RSD - Količina: {proizvod.kolicina}
                    </li>
                ))}
            </ul>
            <p>Ukupno izabranih proizvoda: {transakcijaData.izabranih_proizovda}</p>

            <button onClick={handleZavrsiNarudzbinu}>Završi</button>

            {/* Modal Component */}
            <Modal show={showModal} message={modalMessage} onClose={handleCloseModal} />
        </div>
    );
};

export default FinalizacijaNarudzbine;
