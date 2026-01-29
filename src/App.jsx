import { useState } from 'react'
import Kanban from './Kanban'
import FactoryKanban from './FactoryKanban'
import FormModal from './FormModal'
import EditModal from './EditModal'
import FactoryFormModal from './FactoryFormModal'
import FactoryEditModal from './FactoryEditModal'
import ClientModal from './ClientModal'
import EquipamentoModal from './EquipamentoModal'
import ClientEditModal from './ClientEditModal'
import EquipamentoEditModal from './EquipamentoEditModal'

export default function App() {
 const [view, setView] = useState('clientes')
  const [modals, setModals] = useState({ 
    newFab: false, editFab: false, newCli: false, editCli: false, 
    client: false, equip: false, searchEditClient: false, searchEditEquip: false 
  })
  const [selected, setSelected] = useState(null)

  const convertToCli = (data) => { 
    setSelected(data); 
    setModals({ ...modals, editFab: false, newCli: true }); 
  }

  return (
    <div style={ui.body}>
      <header style={ui.header}>
        <div style={ui.brand}>
          <div style={ui.logoMark}></div>
          <div><h1 style={ui.brandName}>NOVA TRATORES</h1><span style={ui.brandStatus}>COMMAND CENTER</span></div>
        </div>

        <div style={ui.navContainer}>
          <div style={{...ui.navSlider, left: view === 'fabrica' ? '4px' : '50%'}}></div>
          <button onClick={() => setView('fabrica')} style={view === 'fabrica' ? ui.navBtnActive : ui.navBtn}>FÁBRICA</button>
          <button onClick={() => setView('clientes')} style={view === 'clientes' ? ui.navBtnActive : ui.navBtn}>CLIENTES</button>
        </div>

        <div style={ui.actions}>
          <button onClick={() => setModals({...modals, client: true})} style={ui.btnSec}>+ CLIENTE</button>
          <button onClick={() => setModals({...modals, equip: true})} style={ui.btnSec}>+ MÁQUINA</button>
          <button onClick={() => setModals({...modals, searchEditClient: true})} style={ui.btnEdit}>EDITAR CLIENTE</button>
          <button onClick={() => setModals({...modals, searchEditEquip: true})} style={ui.btnEdit}>EDITAR MÁQUINA</button>
          <button 
            onClick={() => view === 'fabrica' ? setModals({...modals, newFab: true}) : setModals({...modals, newCli: true})} 
            style={ui.btnMain}
          >
            {view === 'fabrica' ? 'NOVO PEDIDO' : 'NOVA PROPOSTA'}
          </button>
        </div>
      </header>

      <main style={ui.content}>
        <div key={view} className="view-transition">
          {view === 'fabrica' ? (
            <FactoryKanban onCardClick={(p) => { setSelected(p); setModals({...modals, editFab: true}); }} />
          ) : (
            <Kanban onCardClick={(p) => { setSelected(p); setModals({...modals, editCli: true}); }} />
          )}
        </div>
      </main>

      {modals.newFab && <FactoryFormModal onClose={() => setModals({...modals, newFab: false})} />}
      {modals.editFab && <FactoryEditModal order={selected} onClose={() => setModals({...modals, editFab: false})} onConvert={convertToCli} />}
      {modals.newCli && <FormModal initialData={selected} onClose={() => setModals({...modals, newCli: false})} />}
      {modals.editCli && <EditModal proposal={selected} onClose={() => setModals({...modals, editCli: false})} />}
      {modals.client && <ClientModal onClose={() => setModals({...modals, client: false})} />}
      {modals.equip && <EquipamentoModal onClose={() => setModals({...modals, equip: false})} />}
      {modals.searchEditClient && <ClientEditModal onClose={() => setModals({...modals, searchEditClient: false})} />}
      {modals.searchEditEquip && <EquipamentoEditModal onClose={() => setModals({...modals, searchEditEquip: false})} />}
    </div>
  )
}

const ui = {
  body: { minHeight: '100vh', width: '100%', backgroundColor: '#F8FAFC' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1000 },
  brand: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoMark: { width: '4px', height: '35px', backgroundColor: '#EF4444', borderRadius: '4px' },
  brandName: { fontSize: '19px', fontWeight: '900', color: '#1E293B', margin: 0 },
  brandStatus: { fontSize: '9px', color: '#94A3B8', fontWeight: 'bold' },
  navContainer: { position: 'relative', display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px', width: '260px' },
  navSlider: { position: 'absolute', top: '4px', height: 'calc(100% - 8px)', width: 'calc(50% - 4px)', backgroundColor: '#EF4444', borderRadius: '8px', transition: '0.3s', zIndex: 0 },
  navBtn: { flex: 1, zIndex: 1, background: 'none', border: 'none', color: '#64748B', fontWeight: '700', fontSize: '11px', cursor: 'pointer' },
  navBtnActive: { flex: 1, zIndex: 1, background: 'none', border: 'none', color: '#fff', fontWeight: '700', fontSize: '11px', cursor: 'pointer' },
  actions: { display: 'flex', gap: '10px' },
  btnMain: { padding: '12px 20px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '11px' },
  btnSec: { padding: '12px 18px', backgroundColor: '#fff', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' },
  btnEdit: { padding: '12px 18px', backgroundColor: '#1E293B', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '11px', cursor: 'pointer' },
  content: { padding: '30px 40px' }
}