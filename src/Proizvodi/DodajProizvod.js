import React, { useState } from 'react';
import axios from 'axios';

const DodajProizvod = () => {
  const [imeProizvoda, setImeProizvoda] = useState('');
  const [opisProizvoda, setOpisProizvoda] = useState('');
  const [cenaProizvoda, setCenaProizvoda] = useState('');
  const [kolicinaProizvoda, setKolicinaProizvoda] = useState('');
  const [slikaProizvoda, setSlikaProizvoda] = useState(null);
  const [poruka, setPoruka] = useState('');

  const dodajProizvod = async () => {
    const formData = new FormData();
    formData.append('ime', imeProizvoda);
    formData.append('opis', opisProizvoda);
    formData.append('cena', cenaProizvoda);
    formData.append('kolicina', kolicinaProizvoda);
    if (slikaProizvoda) {
      formData.append('slika', slikaProizvoda);
    }

    try {
      const response = await axios.post('http://localhost:5000/api/proizvodi', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPoruka(`Proizvod je uspešno dodat! Slika: ${response.data.slikaUrl}`);
      setImeProizvoda('');
      setOpisProizvoda('');
      setCenaProizvoda('');
      setKolicinaProizvoda('');
      setSlikaProizvoda(null);
      document.querySelector('input[type="file"]').value = ''; // Reset polja za sliku
    } catch (error) {
      setPoruka('Greška prilikom dodavanja proizvoda: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Dodaj novi proizvod</h2>
      <input
        type="text"
        placeholder="Ime proizvoda"
        value={imeProizvoda}
        onChange={(e) => setImeProizvoda(e.target.value)}
      />
      <input
        type="text"
        placeholder="Opis proizvoda"
        value={opisProizvoda}
        onChange={(e) => setOpisProizvoda(e.target.value)}
      />
      <input
        type="number"
        placeholder="Cena proizvoda"
        value={cenaProizvoda}
        onChange={(e) => setCenaProizvoda(e.target.value)}
      />
      <input
        type="number"
        placeholder="Količina proizvoda"
        value={kolicinaProizvoda}
        onChange={(e) => setKolicinaProizvoda(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setSlikaProizvoda(e.target.files[0])}
      />
      <button onClick={dodajProizvod}>Dodaj proizvod</button>
      {poruka && <p>{poruka}</p>}
    </div>
  );
};

export default DodajProizvod;