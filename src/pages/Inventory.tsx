import React, { useState } from 'react';
import { Package, AlertTriangle, PlusCircle, Minus, Plus, Trash2 } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../hooks/useClubData';
import { C, RADIUS, SectionCard, KPICard, FormInput, FormSelect, PrimaryButton } from '../components/ui';

export default function Inventory({ inventory, perms }: any) {
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemCondition, setItemCondition] = useState('Bueno');

  const totalArticulos = inventory.reduce((sum:number, item:any) => sum + (item.quantity || 0), 0);
  const articulosMalos = inventory.filter((i:any) => i.condition === 'Malo').length;

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || itemQty < 1) return;
    await addDoc(collection(db, 'inventory'), { name: itemName, quantity: itemQty, condition: itemCondition, timestamp: new Date().toISOString() });
    setItemName(''); setItemQty(1); setItemCondition('Bueno');
  };

  const handleUpdateQty = async (id: string, currentQty: number, change: number) => {
    if (currentQty + change < 0) return;
    await updateDoc(doc(db, 'inventory', id), { quantity: currentQty + change });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s ease' }}>
      
      {/* ── KPI CARDS COMPACTAS ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.25rem'
      }}>
        <KPICard 
          label="Total Artículos" 
          value={`${totalArticulos} pzs`} 
          sublabel="Inventario" 
          accent="navy" 
          icon={<Package size={20} color={C.navy900} />}
          style={{ padding: '0.75rem 1rem' }}
        />
        <KPICard 
          label="En mal estado" 
          value={`${articulosMalos}`} 
          sublabel="Requieren atención" 
          accent={articulosMalos > 0 ? 'red' : 'green'} 
          icon={<AlertTriangle size={20} color={articulosMalos > 0 ? C.red : C.green} />}
          style={{ padding: '0.75rem 1rem' }}
        />
      </div>

      {perms.canEditInventory && (
        <SectionCard 
          title="Registrar Material" 
          icon={<PlusCircle size={16} />}
          style={{ padding: '0.75rem 1rem' }}
        >
          <form onSubmit={handleAddInventory} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <FormInput 
              required 
              value={itemName} 
              onChange={e => setItemName(e.target.value)} 
              placeholder="Artículo" 
              style={{ flex: 2, minWidth: '120px' }} 
            />
            <FormInput 
              type="number" 
              required 
              value={itemQty} 
              onChange={e => setItemQty(parseInt(e.target.value) || 0)} 
              style={{ flex: 1, minWidth: '60px' }} 
            />
            <FormSelect 
              value={itemCondition} 
              onChange={e => setItemCondition(e.target.value)} 
              style={{ flex: 1, minWidth: '80px' }}
            >
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </FormSelect>
            <PrimaryButton type="submit" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Añadir</PrimaryButton>
          </form>
        </SectionCard>
      )}

      <SectionCard 
        title="Equipo del Club" 
        icon={<Package size={16} />}
        style={{ padding: '0.75rem 1rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {inventory.map((item:any) => {
            const dotColor = item.condition === 'Bueno' ? C.green : item.condition === 'Regular' ? C.amber : C.red;
            return (
              <div 
                key={item.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.6rem 0.8rem', 
                  border: `1px solid ${C.gray200}`, 
                  borderRadius: RADIUS.md,
                  backgroundColor: C.white
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: '600', color: C.navy900, fontSize: '0.85rem' }}>{item.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor }} />
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: C.gray500 }}>{item.condition}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {perms.canEditInventory ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: C.gray100, padding: '0.2rem', borderRadius: RADIUS.md }}>
                      <button 
                        onClick={() => handleUpdateQty(item.id, item.quantity, -1)} 
                        style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.sm, cursor: 'pointer', padding: '0.15rem 0.3rem', color: C.gray600, fontSize: '0.8rem' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center', fontSize: '0.85rem' }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQty(item.id, item.quantity, 1)} 
                        style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: RADIUS.sm, cursor: 'pointer', padding: '0.15rem 0.3rem', color: C.gray600, fontSize: '0.8rem' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: C.navy900 }}>{item.quantity} pzs</span>
                  )}
                  {perms.canEditInventory && (
                    <button 
                      onClick={async () => { if(window.confirm('¿Borrar este material?')) await deleteDoc(doc(db,'inventory',item.id)) }} 
                      style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', opacity: 0.5, padding: '0.2rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}