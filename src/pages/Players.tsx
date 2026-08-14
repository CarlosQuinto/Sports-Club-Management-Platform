import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Edit, Trash2, ArrowRightLeft, Trophy, Medal, Star, Goal, Shield, TrendingUp, Hand, ChevronDown, ChevronUp, X, Target, Search } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../hooks/useClubData';
import { C, RADIUS, SHADOWS, SectionCard, FormInput, FormSelect, PrimaryButton, SecondaryButton, Badge, StatBox } from '../components/ui';
import { isBirthdayToday, calculateAge } from '../utils/helpers';
import { CompareModal } from '../components/AppComponents';

export default function Players({ players, events, perms }: any) {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState('Delantero');
  const [playerVariant, setPlayerVariant] = useState('');
  const [playerBirthDate, setPlayerBirthDate] = useState('');
  const [playerImageUrl, setPlayerImageUrl] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showTrophies, setShowTrophies] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('Todos');

  // ─── LÓGICA DE PERMISOS GRANULARES ───
  const canEditAll = perms?.canEditJugadores;
  // Si no es admin total, pero tiene permiso de portada/prensa, es Encargado de Prensa
  const isPressOnly = !canEditAll && (perms?.canEditPortada || perms?.canEditPrensa);

  useEffect(() => { setShowTrophies(false); }, [selectedPlayer]);

  // ─── Asegurar que events sea un array válido ───
  const safeEvents = Array.isArray(events) ? events : [];

  // ─── Guardar jugador (crear o editar) ───
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName) return;

    const data = {
      name: playerName,
      number: playerNumber || 'S/N',
      position: playerPosition,
      variant: playerVariant.trim(),
      birthDate: playerBirthDate || '', // ← NUNCA undefined
      imageUrl: playerImageUrl.trim(),
    };

    if (editingPlayerId) {
      await updateDoc(doc(db, 'players', editingPlayerId), data);
      setEditingPlayerId(null);
    } else {
      await addDoc(collection(db, 'players'), { ...data, amount_paid: 0, timestamp: new Date().toISOString() });
    }

    // Resetear formulario
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('Delantero');
    setPlayerVariant('');
    setPlayerBirthDate('');
    setPlayerImageUrl('');
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('Delantero');
    setPlayerVariant('');
    setPlayerBirthDate('');
    setPlayerImageUrl('');
  };

  // ─── Editar jugador (cargar datos en el formulario) ───
  const handleEdit = (p: any) => {
    setEditingPlayerId(p.id);
    setPlayerName(p.name);
    setPlayerNumber(p.number === 'S/N' ? '' : p.number);
    setPlayerPosition(p.position);
    setPlayerVariant(p.variant || '');
    setPlayerBirthDate(p.birthDate || ''); // ← NUNCA undefined
    setPlayerImageUrl(p.imageUrl || '');
    
    // Hacemos scroll hacia arriba para que el CM vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar a este jugador?')) await deleteDoc(doc(db, 'players', id));
  };

  // ─── Contador de posiciones ───
  const positionCounts = useMemo(() => {
    const counts = { Portero: 0, Defensa: 0, Medio: 0, Delantero: 0 };
    players.forEach((p: any) => {
      if (counts[p.position as keyof typeof counts] !== undefined) {
        counts[p.position as keyof typeof counts]++;
      } else {
        counts.Delantero++;
      }
    });
    return counts;
  }, [players]);

  // ─── Jugadores filtrados (búsqueda y posición) ───
  const filteredPlayers = useMemo(() => {
    return players.filter((player: any) => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            player.number.toString().includes(searchTerm);
      const matchesPosition = positionFilter === 'Todos' || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [players, searchTerm, positionFilter]);

  // ─── Estadísticas de cada jugador ───
  const clubPlayerStats = useMemo(() => {
    return players.map((p: any) => {
      let goals = 0, assists = 0, cleanSheets = 0, goalsConceded = 0;
      let matchesAttended = 0, trainingsAttended = 0, mvps = 0;
      let yellowCards = 0, redCards = 0;

      safeEvents.filter((e: any) => new Date(e.eventDate + 'T' + e.eventTime) < new Date()).forEach((ev: any) => {
        const attended = (ev.attendees || []).some((att: string) => att === p.id || att === p.name);

        if (ev.eventType === 'Partido' && attended) matchesAttended++;
        if (ev.eventType === 'Entrenamiento' && attended) trainingsAttended++;

        if (ev.eventType === 'Partido') {
          // Goles y asistencias
          ev.stats?.forEach((s: any) => {
            if (s.scorer === p.id || s.scorer === p.name) goals++;
            if (s.assist === p.id || s.assist === p.name) assists++;
          });

          // Porteros (nuevo formato con múltiples porteros)
          if (ev.goalkeepers && Array.isArray(ev.goalkeepers) && ev.goalkeepers.length > 0) {
            const gkEntry = ev.goalkeepers.find((gk: any) => gk.id === p.id || gk.id === p.name);
            if (gkEntry) {
              goalsConceded += (gkEntry.conceded || 0);
              if ((gkEntry.conceded || 0) === 0) cleanSheets++;
            }
          } else if (ev.goalkeeper) {
            // Formato antiguo (un solo portero)
            if (ev.goalkeeper === p.id || ev.goalkeeper === p.name) {
              goalsConceded += (ev.scoreTheirs || 0);
              if (ev.scoreTheirs === 0) cleanSheets++;
            }
          }

          // MVP y tarjetas
          if (ev.mvp === p.id || ev.mvp === p.name) mvps++;
          yellowCards += (ev.yellowCards || []).filter((id: string) => id === p.id || id === p.name).length;
          redCards += (ev.redCards || []).filter((id: string) => id === p.id || id === p.name).length;
        }
      });

      return {
        ...p,
        goals,
        assists,
        cleanSheets,
        goalsConceded,
        matchesAttended,
        trainingsAttended,
        mvps,
        yellowCards,
        redCards,
        totalAttendance: matchesAttended + trainingsAttended,
      };
    });
  }, [players, safeEvents]);

  // ─── Logros del jugador seleccionado ───
  const selectedPlayerAchievements = useMemo(() => {
    if (!selectedPlayer) return [];
    const pStats = clubPlayerStats.find((p: any) => p.id === selectedPlayer.id);
    if (!pStats) return [];

    let maxGoalsInMatch = 0;
    let maxAssistsInMatch = 0;

    safeEvents.forEach((ev: any) => {
      if (ev.eventType === 'Partido' && ev.stats) {
        let goalsHere = ev.stats.filter((s: any) => s.scorer === selectedPlayer.id || s.scorer === selectedPlayer.name).length;
        let assistsHere = ev.stats.filter((s: any) => s.assist === selectedPlayer.id || s.assist === selectedPlayer.name).length;
        if (goalsHere > maxGoalsInMatch) maxGoalsInMatch = goalsHere;
        if (assistsHere > maxAssistsInMatch) maxAssistsInMatch = assistsHere;
      }
    });

    const amountPaid = selectedPlayer.amount_paid || 0;

    return [
      // ─── GOLES ──────────────────────────────────────
      { id: 1, title: 'El Bautizo', desc: 'Anota 1 gol', icon: '⚽', unlocked: pStats.goals >= 1 },
      { id: 2, title: 'El Francotirador', desc: 'Llega a 10 goles', icon: '🎯', unlocked: pStats.goals >= 10 },
      { id: 3, title: 'Killer del Área', desc: 'Llega a 25 goles', icon: '🦈', unlocked: pStats.goals >= 25 },
      { id: 4, title: 'Bota de Oro', desc: 'Llega a 50 goles', icon: '👢', unlocked: pStats.goals >= 50 },
      { id: 36, title: 'Goleador Legendario', desc: 'Llega a 75 goles', icon: '⚡', unlocked: pStats.goals >= 75 },
      { id: 49, title: 'Máquina de Goles', desc: 'Llega a 100 goles', icon: '🚀', unlocked: pStats.goals >= 100 },

      // ─── GOLES EN UN PARTIDO ────────────────────────
      { id: 5, title: 'Hat-Trick', desc: '3 goles en 1 partido', icon: '🎩', unlocked: maxGoalsInMatch >= 3 },
      { id: 6, title: 'El Póker', desc: '4 goles en 1 partido', icon: '🃏', unlocked: maxGoalsInMatch >= 4 },
      { id: 37, title: 'Manita', desc: '5 goles en 1 partido', icon: '✋', unlocked: maxGoalsInMatch >= 5 },

      // ─── ASISTENCIAS ──────────────────────────────────
      { id: 7, title: 'El Buen Socio', desc: 'Da 1 asistencia', icon: '🤝', unlocked: pStats.assists >= 1 },
      { id: 8, title: 'Guante en el Pie', desc: 'Llega a 5 asistencias', icon: '🧤', unlocked: pStats.assists >= 5 },
      { id: 9, title: 'Dueño del Medio', desc: 'Llega a 10 asistencias', icon: '🧠', unlocked: pStats.assists >= 10 },
      { id: 10, title: 'El De Bruyne', desc: 'Llega a 25 asistencias', icon: '👑', unlocked: pStats.assists >= 25 },
      { id: 38, title: 'Asistente Legendario', desc: 'Llega a 50 asistencias', icon: '🧩', unlocked: pStats.assists >= 50 },

      // ─── ASISTENCIAS EN UN PARTIDO ──────────────────
      { id: 11, title: 'Dúo Dinámico', desc: '2 asistencias en 1 partido', icon: '👯', unlocked: maxAssistsInMatch >= 2 },
      { id: 12, title: 'El Repartidor', desc: '3 asistencias en 1 partido', icon: '🛵', unlocked: maxAssistsInMatch >= 3 },
      { id: 39, title: 'Asistencia Estelar', desc: '5 asistencias en 1 partido', icon: '🤹', unlocked: maxAssistsInMatch >= 5 },

      // ─── MVPs ──────────────────────────────────────
      { id: 13, title: 'MVP', desc: 'Gana 1 MVP', icon: '🏅', unlocked: pStats.mvps >= 1 },
      { id: 14, title: 'El Galáctico', desc: 'Gana 3 MVPs', icon: '🌠', unlocked: pStats.mvps >= 3 },
      { id: 40, title: 'MVP Estrella', desc: 'Gana 5 MVPs', icon: '⭐', unlocked: pStats.mvps >= 5 },
      { id: 15, title: 'Balón de Oro', desc: 'Gana 10 MVPs', icon: '🌍', unlocked: pStats.mvps >= 10 },
      { id: 41, title: 'MVP Legendario', desc: 'Gana 20 MVPs', icon: '🌟', unlocked: pStats.mvps >= 20 },

      // ─── ARCOS EN CERO ──────────────────────────────
      { id: 16, title: 'Candado Cerrado', desc: '1 arco en cero', icon: '🔒', unlocked: pStats.cleanSheets >= 1 },
      { id: 17, title: 'La Muralla', desc: '3 arcos en cero', icon: '🧱', unlocked: pStats.cleanSheets >= 3 },
      { id: 42, title: 'Impermeable', desc: '5 arcos en cero', icon: '🧤', unlocked: pStats.cleanSheets >= 5 },
      { id: 18, title: 'El Pulpo', desc: '10 arcos en cero', icon: '🐙', unlocked: pStats.cleanSheets >= 10 },
      { id: 43, title: 'Muro Invencible', desc: '20 arcos en cero', icon: '🏰', unlocked: pStats.cleanSheets >= 20 },

      // ─── PARTIDOS JUGADOS ────────────────────────────
      { id: 19, title: 'El Debutante', desc: 'Juega 1 partido', icon: '👕', unlocked: pStats.matchesAttended >= 1 },
      { id: 20, title: 'Titular Habitual', desc: 'Juega 5 partidos', icon: '🏃', unlocked: pStats.matchesAttended >= 5 },
      { id: 21, title: 'Veterano', desc: 'Juega 15 partidos', icon: '🎖️', unlocked: pStats.matchesAttended >= 15 },
      { id: 44, title: 'Veterano de Guerra', desc: 'Juega 20 partidos', icon: '⚔️', unlocked: pStats.matchesAttended >= 20 },
      { id: 22, title: 'Leyenda del Llano', desc: 'Juega 30 partidos', icon: '🏛️', unlocked: pStats.matchesAttended >= 30 },
      { id: 45, title: 'Maratón', desc: 'Juega 50 partidos', icon: '🏃‍♂️', unlocked: pStats.matchesAttended >= 50 },
      { id: 50, title: 'El Inmortal', desc: 'Juega 100 partidos', icon: '🏅', unlocked: pStats.matchesAttended >= 100 },

      // ─── ENTRENAMIENTOS ──────────────────────────────
      { id: 23, title: 'Primer Sudor', desc: '1 entrenamiento', icon: '💧', unlocked: pStats.trainingsAttended >= 1 },
      { id: 24, title: 'El Disciplinado', desc: '10 entrenamientos', icon: '🔋', unlocked: pStats.trainingsAttended >= 10 },
      { id: 25, title: 'El Profe', desc: '25 entrenamientos', icon: '📋', unlocked: pStats.trainingsAttended >= 25 },
      { id: 26, title: 'Máquina Perfecta', desc: '50 entrenamientos', icon: '🤖', unlocked: pStats.trainingsAttended >= 50 },
      { id: 46, title: 'Entrenamiento Élite', desc: '100 entrenamientos', icon: '💪', unlocked: pStats.trainingsAttended >= 100 },

      // ─── TARJETAS ────────────────────────────────────
      { id: 27, title: '1ra Advertencia', desc: 'Recibe 1 amarilla', icon: '🟨', unlocked: pStats.yellowCards >= 1 },
      { id: 28, title: 'El Carnicero', desc: 'Acumula 3 amarillas', icon: '🪓', unlocked: pStats.yellowCards >= 3 },
      { id: 29, title: 'A las regaderas', desc: 'Recibe 1 roja', icon: '🟥', unlocked: pStats.redCards >= 1 },
      { id: 30, title: 'Peligro Público', desc: 'Acumula 3 rojas', icon: '☣️', unlocked: pStats.redCards >= 3 },

      // ─── COMBINADOS ──────────────────────────────────
      { id: 31, title: 'Doble Amenaza', desc: '5 goles y 5 asist.', icon: '⚔️', unlocked: pStats.goals >= 5 && pStats.assists >= 5 },
      { id: 32, title: 'Franquicia', desc: '10G, 10A, 10 Partidos', icon: '💎', unlocked: pStats.goals >= 10 && pStats.assists >= 10 && pStats.matchesAttended >= 10 },
      { id: 47, title: 'Triple Amenaza', desc: '15G, 15A, 15 Partidos', icon: '🔱', unlocked: pStats.goals >= 15 && pStats.assists >= 15 && pStats.matchesAttended >= 15 },

      // ─── APORTACIONES VOLUNTARIAS ──────────────────
      { id: 33, title: 'Caridad', desc: 'Hizo 1 aportación', icon: '💝', unlocked: amountPaid >= 1 },
      { id: 34, title: 'Socio', desc: 'Aportó ≥ $200', icon: '💳', unlocked: amountPaid >= 200 },
      { id: 35, title: 'El Padrino', desc: 'Aportó ≥ $500', icon: '💰', unlocked: amountPaid >= 500 },
      { id: 48, title: 'Filántropo', desc: 'Aportó ≥ $1000', icon: '💎', unlocked: amountPaid >= 1000 },
    ];
  }, [selectedPlayer, clubPlayerStats, safeEvents]);

  // ─── RENDER ──────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>

      {/* ── DISTRIBUCIÓN DE LA PLANTILLA (2x2 EN MÓVILES) ── */}
      <SectionCard title="Distribución de la Plantilla" icon={<Users size={16} />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
          <StatBox icon={<Hand size={16} color={C.navy600} />} label="Porteros" value={positionCounts.Portero} style={{ padding: '0.75rem', fontSize: '0.75rem' }} />
          <StatBox icon={<Shield size={16} color={C.navy600} />} label="Defensas" value={positionCounts.Defensa} style={{ padding: '0.75rem', fontSize: '0.75rem' }} />
          <StatBox icon={<Target size={16} color={C.navy600} />} label="Medios" value={positionCounts.Medio} style={{ padding: '0.75rem', fontSize: '0.75rem' }} />
          <StatBox icon={<Goal size={16} color={C.navy600} />} label="Delanteros" value={positionCounts.Delantero} style={{ padding: '0.75rem', fontSize: '0.75rem' }} />
        </div>
      </SectionCard>

      {/* ── FORMULARIO DE EDICIÓN (PERMISOS DE ADMIN O PRENSA) ── */}
      {/* Si es Admin, ve el form completo. Si es CM (Prensa), solo lo ve si hay un jugador en edición */}
      {(canEditAll || (isPressOnly && editingPlayerId)) && (
        <SectionCard title={editingPlayerId ? (isPressOnly ? 'Actualizar Foto del Jugador' : 'Editar Jugador') : 'Fichar Jugador'} icon={<Users size={16} />}>
          <form onSubmit={handleSavePlayer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <FormInput required disabled={isPressOnly} value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Nombre completo" style={{ flex: 2 }} />
              <FormInput type="number" required disabled={isPressOnly} value={playerNumber} onChange={e => setPlayerNumber(e.target.value)} placeholder="Dorsal" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <FormSelect disabled={isPressOnly} value={playerPosition} onChange={e => setPlayerPosition(e.target.value)} style={{ flex: 1 }}>
                <option value="Portero">Portero</option><option value="Defensa">Defensa</option><option value="Medio">Medio</option><option value="Delantero">Delantero</option>
              </FormSelect>
              <FormInput disabled={isPressOnly} value={playerVariant} onChange={e => setPlayerVariant(e.target.value)} placeholder="Variante (Ej. Central)" style={{ flex: 1 }} />
            </div>

            {/* ─── CAMPO DE FECHA DE NACIMIENTO ─── */}
            <FormInput
              type="date"
              disabled={isPressOnly}
              value={playerBirthDate}
              onChange={e => setPlayerBirthDate(e.target.value)}
              placeholder="Fecha de nacimiento (opcional)"
            />

            {/* Este campo siempre está habilitado para ambos (Admin y Prensa) */}
            <FormInput type="url" value={playerImageUrl} onChange={e => setPlayerImageUrl(e.target.value)} placeholder="Link de foto (opcional)" />
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <PrimaryButton type="submit" style={{ flex: 1 }}>{editingPlayerId ? 'Guardar Cambios' : 'Agregar'}</PrimaryButton>
              {editingPlayerId && (
                <SecondaryButton type="button" onClick={handleCancelEdit} style={{ flex: 1 }}>Cancelar</SecondaryButton>
              )}
            </div>
          </form>
        </SectionCard>
      )}

      {/* ── PLANTILLA OFICIAL CON BOTÓN DE COMPARADOR INTEGRADO ── */}
      <SectionCard
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={16} /> Plantilla Oficial
            </span>
            {players.length > 1 && (
              <button
                onClick={() => setShowCompareModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.7rem',
                  backgroundColor: C.blueAccent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: RADIUS.md,
                  fontWeight: '600',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  boxShadow: SHADOWS.sm,
                  whiteSpace: 'nowrap'
                }}
              >
                <ArrowRightLeft size={14} /> Comparar
              </button>
            )}
          </div>
        }
      >
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color={C.gray400} style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)' }} />
            <FormInput
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o dorsal..."
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['Todos', 'Portero', 'Defensa', 'Medio', 'Delantero'].map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPositionFilter(pos)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: RADIUS.full,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  border: `1px solid ${positionFilter === pos ? C.navy900 : C.gray300}`,
                  backgroundColor: positionFilter === pos ? C.navy900 : C.white,
                  color: positionFilter === pos ? C.white : C.gray600,
                  transition: 'all 0.2s ease'
                }}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <p style={{ textAlign: 'center', color: C.gray400, fontStyle: 'italic', padding: '1.5rem 0' }}>No se encontraron jugadores con ese filtro.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredPlayers.map((player: any) => {
              const isBday = isBirthdayToday(player.birthDate);
              return (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.875rem 1rem',
                    border: `1px solid ${isBday ? C.amber : C.gray200}`,
                    borderRadius: RADIUS.md,
                    backgroundColor: isBday ? C.amberLight : C.white,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <img
                      src={player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=102a43&color=fff`}
                      alt={player.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=102a43&color=fff`; }}
                    />
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', color: C.navy900 }}>{player.name} {isBday && '🍰'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: C.navy500 }}>#{player.number} • {player.position} {player.variant ? `(${player.variant})` : ''}</p>
                    </div>
                  </div>

                  {/* Mostramos las acciones si es Admin o si es el CM de Prensa */}
                  {(canEditAll || isPressOnly) && (
                    <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEdit(player)} style={{ background: 'none', border: 'none', color: C.navy600, cursor: 'pointer' }}><Edit size={16} /></button>
                      {/* El CM de prensa NO puede eliminar al jugador */}
                      {canEditAll && (
                        <button onClick={() => handleDelete(player.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer' }}><Trash2 size={16} /></button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {showCompareModal && <CompareModal playersStats={clubPlayerStats} onClose={() => setShowCompareModal(false)} />}

      {/* ─── MODAL DEL JUGADOR (AHORA CON PORTAL) ─── */}
      {selectedPlayer && (() => {
        const pStats = clubPlayerStats.find((p: any) => p.id === selectedPlayer.id);
        if (!pStats) return null;
        const unlockedTrophiesCount = selectedPlayerAchievements.filter((a: any) => a.unlocked).length;

        const playerModal = (
          <div
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 41, 0.90)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}
            onClick={() => setSelectedPlayer(null)}
          >
            <div
              style={{ position: 'relative', maxWidth: '450px', width: '100%', backgroundColor: C.white, borderRadius: RADIUS.xl, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: SHADOWS.xl, maxHeight: '95vh', overflowY: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedPlayer(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: C.gray400, cursor: 'pointer' }}><X size={24} /></button>

              <img
                src={selectedPlayer.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPlayer.name)}&background=102a43&color=fff&size=200&bold=true`}
                alt={selectedPlayer.name}
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedPlayer.name)}&background=102a43&color=fff&size=200&bold=true`; }}
                style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${C.gray100}`, boxShadow: SHADOWS.md, marginBottom: '1.5rem', backgroundColor: C.navy900 }}
              />
              <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.625rem', fontWeight: '800', color: C.navy900, textAlign: 'center', letterSpacing: '-0.02em' }}>{selectedPlayer.name}</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', backgroundColor: C.navy50, padding: '0.5rem 1.25rem', borderRadius: RADIUS.full }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: C.navy900 }}>#{selectedPlayer.number}</span>
                <span style={{ width: '1px', height: '16px', backgroundColor: C.navy200 }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: C.navy600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedPlayer.position} {selectedPlayer.variant ? ` • ${selectedPlayer.variant}` : ''}
                </span>
                {selectedPlayer.birthDate && (
                  <>
                    <span style={{ width: '1px', height: '16px', backgroundColor: C.navy200 }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: C.navy600 }}>{calculateAge(selectedPlayer.birthDate)} años</span>
                  </>
                )}
              </div>

              <div style={{ width: '100%', marginTop: '2rem', borderTop: `2px dashed ${C.gray100}`, paddingTop: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem 0', textAlign: 'center', fontWeight: '600', color: C.gray500, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.6875rem' }}>Rendimiento de la Temporada</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {selectedPlayer.position === 'Portero' ? (
                    <>
                      <StatBox icon={<Hand size={20} color={C.navy600} />} label="Goles Recibidos" value={pStats.goalsConceded} />
                      <StatBox icon={<Shield size={20} color={C.navy600} />} label="Arcos en Cero" value={pStats.cleanSheets} />
                    </>
                  ) : (
                    <>
                      <StatBox icon={<Goal size={20} color={C.navy600} />} label="Goles Anotados" value={pStats.goals} />
                      <StatBox icon={<TrendingUp size={20} color={C.navy600} />} label="Asistencias" value={pStats.assists} />
                    </>
                  )}
                  <StatBox icon={<Target size={20} color={C.navy600} />} label="Entrenamientos" value={pStats.trainingsAttended} />
                  <StatBox icon={<Trophy size={20} color={C.navy600} />} label="Partidos Jugados" value={pStats.matchesAttended} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <StatBox icon={<Star size={16} color={C.amber} fill={C.amber} />} label="MVPs" value={pStats.mvps} valueColor={C.amber} />
                  <StatBox icon={<span style={{ fontSize: '16px' }}>🟨</span>} label="Amarillas" value={pStats.yellowCards} />
                  <StatBox icon={<span style={{ fontSize: '16px' }}>🟥</span>} label="Rojas" value={pStats.redCards} />
                </div>

                <div style={{ width: '100%', marginTop: '1.5rem', borderTop: `2px dashed ${C.gray100}`, paddingTop: '1rem' }}>
                  <button
                    onClick={() => setShowTrophies(!showTrophies)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.gray50, border: `1px solid ${C.gray200}`, padding: '0.75rem 1rem', borderRadius: RADIUS.md, cursor: 'pointer', fontWeight: '700', color: C.navy900 }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Medal size={18} color={C.amber} /> Vitrina de Trofeos ({unlockedTrophiesCount}/{selectedPlayerAchievements.length})</span>
                    {showTrophies ? <ChevronUp size={18} color={C.gray500} /> : <ChevronDown size={18} color={C.gray500} />}
                  </button>

                  {showTrophies && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '1rem', marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                      {selectedPlayerAchievements.map((ach: any) => (
                        <div key={ach.id} style={{ opacity: ach.unlocked ? 1 : 0.3, filter: ach.unlocked ? 'none' : 'grayscale(100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'all 0.3s ease' }} title={ach.desc}>
                          <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem', filter: ach.unlocked ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none' }}>
                            {ach.unlocked ? ach.icon : '🔒'}
                          </div>
                          <div style={{ fontSize: '0.55rem', fontWeight: '800', color: C.navy900, lineHeight: '1.1', textTransform: 'uppercase' }}>{ach.title}</div>
                          <div style={{ fontSize: '0.5rem', color: C.gray500, marginTop: '0.1rem', lineHeight: '1.1' }}>{ach.desc}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

        return createPortal(playerModal, document.body);
      })()}
    </div>
  );
}