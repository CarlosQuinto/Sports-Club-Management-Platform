import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc } from "firebase/firestore";

// 1. Define Basic Interfaces for Type Safety
interface ClubInfo {
  name: string;
  description: string;
  heroImages: string[];
  defaultLineups: Record<string, any>;
  logoUrl?: string; // 👈 ¡AÑADE ESTA LÍNEA! (El '?' significa que es opcional)
}

// Add more specific types as your schema solidifies
interface FirestoreDoc {
  id: string;
  [key: string]: any;
}

const firebaseConfig = {
  apiKey: "AIzaSyCKG9PJIjx9G-4mxwsQu2gwGyV4oGedItM",
  authDomain: "finanzas-club-jb.firebaseapp.com",
  projectId: "finanzas-club-jb",
  storageBucket: "finanzas-club-jb.firebasestorage.app",
  messagingSenderId: "900869725908",
  appId: "1:900869725908:web:50411a5b41f05d2679e541",
};

// 2. Safely Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export function useClubData() {
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    name: "Joga Bonito FC",
    description:
      "Club Guaymense conformado por auténticos amantes del fútbol. Más que un equipo, una familia en la cancha.",
    heroImages: [
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    ],
    defaultLineups: {},
  });

  const [transactions, setTransactions] = useState<FirestoreDoc[]>([]);
  const [players, setPlayers] = useState<FirestoreDoc[]>([]);
  const [inventory, setInventory] = useState<FirestoreDoc[]>([]);
  const [events, setEvents] = useState<FirestoreDoc[]>([]);
  const [gallery, setGallery] = useState<FirestoreDoc[]>([]);
  const [goals, setGoals] = useState<FirestoreDoc[]>([]); // 👈 AÑADIDO: Estado para metas
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signInAnonymously(auth).catch((error) =>
      console.error("Error auth:", error),
    );

    const handleSnapshotError = (err: any) =>
      console.error("Firestore Error:", err);

    const unsubSettings = onSnapshot(
      doc(db, "settings", "club_info"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const images =
            data.heroImages ||
            (data.heroImage ? [data.heroImage] : clubInfo.heroImages);
          setClubInfo((prev) => ({ ...prev, ...data, heroImages: images }));
        }
      },
      handleSnapshotError,
    );

    const unsubTx = onSnapshot(
      collection(db, "transactions"),
      (snapshot) => {
        const txs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as FirestoreDoc,
        );
        txs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setTransactions(txs);
        setLoading(false);
      },
      handleSnapshotError,
    );

    const unsubPlayers = onSnapshot(
      collection(db, "players"),
      (snapshot) => {
        const plys = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreDoc,
        );
        plys.sort((a, b) => a.name.localeCompare(b.name));
        setPlayers(plys);
      },
      handleSnapshotError,
    );

    const unsubInventory = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        const items = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreDoc,
        );
        items.sort((a, b) => a.name.localeCompare(b.name));
        setInventory(items);
      },
      handleSnapshotError,
    );

    const unsubEvents = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        const evts = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreDoc,
        );
        evts.sort(
          (a, b) =>
            new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
        );
        setEvents(evts);
      },
      handleSnapshotError,
    );

    const unsubGallery = onSnapshot(
      collection(db, "gallery"),
      (snapshot) => {
        const imgs = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreDoc,
        );
        imgs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setGallery(imgs);
      },
      handleSnapshotError,
    );

    // 👇 AÑADIDO: Suscripción a la colección 'goals' en Firebase 👇
    const unsubGoals = onSnapshot(
      collection(db, "goals"),
      (snapshot) => {
        const fetchedGoals = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as FirestoreDoc,
        );
        // Ordenamos las metas más recientes primero
        fetchedGoals.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setGoals(fetchedGoals);
      },
      handleSnapshotError,
    );

    return () => {
      unsubSettings();
      unsubTx();
      unsubPlayers();
      unsubInventory();
      unsubEvents();
      unsubGallery();
      unsubGoals(); // 👈 Limpiamos el listener al desmontar
    };
  }, []);

  return {
    clubInfo,
    transactions,
    players,
    inventory,
    events,
    gallery,
    goals, // 👈 AÑADIDO: Exportamos 'goals' para que App.tsx lo pueda usar
    loading,
  };
}
