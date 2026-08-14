import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKG9PJIjx9G-4mxwsQu2gwGyV4oGedItM",
  authDomain: "finanzas-club-jb.firebaseapp.com",
  projectId: "finanzas-club-jb",
  storageBucket: "finanzas-club-jb.firebasestorage.app",
  messagingSenderId: "900869725908",
  appId: "1:900869725908:web:50411a5b41f05d2679e541"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function useClubData() {
  const [clubInfo, setClubInfo] = useState<any>({
    name: 'Joga Bonito FC',
    description: 'Club Guaymense conformado por auténticos amantes del fútbol. Más que un equipo, una familia en la cancha.',
    heroImages: ['https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
    defaultLineups: {}
  });
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error("Error auth:", error));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'club_info'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        const images = data.heroImages || (data.heroImage ? [data.heroImage] : ['https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']);
        setClubInfo({ ...data, heroImages: images, defaultLineups: data.defaultLineups || {} });
      }
    });

    const unsubTx = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      txs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txs);
      setLoading(false);
    });

    const unsubPlayers = onSnapshot(collection(db, 'players'), (snapshot) => {
      const plys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      plys.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setPlayers(plys);
    });

    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setInventory(items);
    });

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const evts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      evts.sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
      setEvents(evts);
    });

    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      imgs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setGallery(imgs);
    });

    return () => {
      unsubSettings(); unsubTx(); unsubPlayers(); unsubInventory(); unsubEvents(); unsubGallery();
    };
  }, []);

  return { clubInfo, transactions, players, inventory, events, gallery, loading };
}