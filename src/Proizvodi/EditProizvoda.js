import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditProizvoda = () => {
  const [proizvodi, setProizvodi] = useState([]);
  const [selectedProizvodId, setSelectedProizvodId] = useState('');
  const [ime, setIme] = useState('');
  const [opis, setOpis] = useState('');
  const [cena, setCena] = useState('');
  const [kolicina, setKolicina] = useState('');
  const [slika, setSlika] = useState(null);
  const [poruka, setPoruka] = useState('');
  const [preporuke, setPreporuke] = useState([]); // Lista trenutnih preporuka
  const [sviProizvodi, setSviProizvodi] = useState([]); // Svi proizvodi za izbor

  useEffect(() => {
    const fetchProizvodi = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/proizvodi');
        setProizvodi(response.data);
        setSviProizvodi(response.data); // Popunjavamo listu za izbor preporuka
      } catch (error) {
        setPoruka('Greška pri učitavanju proizvoda: ' + error.message);
      }
    };
    fetchProizvodi();
  }, []);

  useEffect(() => {
    if (selectedProizvodId) {
      const fetchProizvod = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/proizvodi/${selectedProizvodId}`);
          const { ime, opis, cena, kolicina } = response.data;
          setIme(ime);
          setOpis(opis || '');
          setCena(cena);
          setKolicina(kolicina);
          setSlika(null);

          // Dobavi trenutne preporuke za izabrani proizvod
          const preporukeResponse = await axios.get(`http://localhost:5000/api/preporuke/${selectedProizvodId}`);
          setPreporuke(preporukeResponse.data);
        } catch (error) {
          setPoruka('Greška pri učitavanju proizvoda: ' + error.message);
        }
      };
      fetchProizvod();
    }
  }, [selectedProizvodId]);

  const azurirajProizvod = async () => {
    if (!selectedProizvodId) {
      setPoruka('Izaberite proizvod za uređivanje!');
      return;
    }

    const formData = new FormData();
    if (ime) formData.append('ime', ime);
    if (opis) formData.append('opis', opis);
    if (cena) formData.append('cena', cena);
    if (kolicina) formData.append('kolicina', kolicina);
    if (slika) formData.append('slika', slika);

    try {
      await axios.put(`http://localhost:5000/api/proizvodi/${selectedProizvodId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPoruka('Proizvod je uspešno ažuriran!');
    } catch (error) {
      setPoruka('Greška prilikom ažuriranja proizvoda: ' + error.message);
    }
  };

  const dodajPreporuku = async (preporuceniId) => {
    try {
      await axios.post('http://localhost:5000/api/preporuke', {
        proizvod_id: selectedProizvodId,
        preporuceni_proizvod_id: preporuceniId,
      });
      const updatedPreporuke = await axios.get(`http://localhost:5000/api/preporuke/${selectedProizvodId}`);
      setPreporuke(updatedPreporuke.data);
      setPoruka('Preporuka uspešno dodata!');
    } catch (error) {
      setPoruka('Greška pri dodavanju preporuke: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Uredi proizvod</h2>
      <select
        value={selectedProizvodId}
        onChange={(e) => setSelectedProizvodId(e.target.value)}
      >
        <option value="">Izaberi proizvod</option>
        {proizvodi.map((proizvod) => (
          <option key={proizvod.id} value={proizvod.id}>
            {proizvod.ime}
          </option>
        ))}
      </select>

      {selectedProizvodId && (
        <>
          <input type="text" placeholder="Ime proizvoda" value={ime} onChange={(e) => setIme(e.target.value)} />
          <input type="text" placeholder="Opis proizvoda" value={opis} onChange={(e) => setOpis(e.target.value)} />
          <input type="number" placeholder="Cena proizvoda" value={cena} onChange={(e) => setCena(e.target.value)} />
          <input type="number" placeholder="Količina proizvoda" value={kolicina} onChange={(e) => setKolicina(e.target.value)} />
          <input type="file" accept="image/*" onChange={(e) => setSlika(e.target.files[0])} />
          <button onClick={azurirajProizvod}>Sačuvaj promene</button>

          {/* Sekcija za preporuke */}
          <h3>Preporučeni proizvodi</h3>
          <ul>
            {preporuke.map((preporuka) => (
              <li key={preporuka.id}>{preporuka.ime}</li>
            ))}
          </ul>
          <select onChange={(e) => dodajPreporuku(e.target.value)}>
            <option value="">Dodaj preporuku</option>
            {sviProizvodi
              .filter((p) => p.id !== parseInt(selectedProizvodId))
              .map((proizvod) => (
                <option key={proizvod.id} value={proizvod.id}>
                  {proizvod.ime}
                </option>
              ))}
          </select>
        </>
      )}
      {poruka && <p>{poruka}</p>}
    </div>
  );
};

export default EditProizvoda;