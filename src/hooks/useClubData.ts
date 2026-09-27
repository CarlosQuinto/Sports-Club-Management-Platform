import { useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  DEFAULT_CLUB_NAME,
  DEFAULT_CLUB_DESCRIPTION,
  DEFAULT_HERO_IMAGE,
} from "../lib/clubDefaults";

// Re-exportados para mantener compatibilidad con los módulos que importan
// `db`/`auth` desde este hook.
export { auth, db };

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

export function useClubData() {
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    name: DEFAULT_CLUB_NAME,
    description: DEFAULT_CLUB_DESCRIPTION,
    heroImages: [DEFAULT_HERO_IMAGE],
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
