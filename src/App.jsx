import { useState } from 'react'
import Kanban from './Kanban'
import FactoryKanban from './FactoryKanban'
import FormModal from './FormModal'
import EditModal from './EditModal'
import FactoryFormModal from './FactoryFormModal'
import FactoryEditModal from './FactoryEditModal'

export default function App() {
  const [view, setView] = useState('fabrica')
  const [modals, setModals] = useState({ newFab: false, editFab: false, newCli: false, editCli: false })
  const [selected, setSelected] = useState(null)

  const convertToCli = (data) => { setSelected(data); setModals({ ...modals, editFab: false, newCli: true }); }

  return (
    <div style={ui.body}>
      <header style={ui.header}>
        <div style={ui.brand}>
          <div style={ui.logoMark}></div>
          <div>
            <h1 style={ui.brandName}>NOVA TRATORES</h1>
            <span style={ui.brandStatus}>COMMAND CENTER • EXECUTIVO</span>
          </div>
        </div>

        <nav style={ui.nav}>
          <button onClick={() => setView('fabrica')} style={view === 'fabrica' ? ui.navBtnActive : ui.navBtn}>FÁBRICA</button>
          <button onClick={() => setView('clientes')} style={view === 'clientes' ? ui.navBtnActive : ui.navBtn}>CLIENTES</button>
        </nav>

        <button 
          onClick={() => view === 'fabrica' ? setModals({...modals, newFab: true}) : setModals({...modals, newCli: true})} 
          style={ui.btnMain}
        >
          {view === 'fabrica' ? '+ NOVO PEDIDO FÁBRICA' : '+ NOVA PROPOSTA COMERCIAL'}
        </button>
      </header>

      <main style={ui.content}>
        {view === 'fabrica' ? (
          <FactoryKanban onCardClick={(p) => { setSelected(p); setModals({...modals, editFab: true}); }} />
        ) : (
          <Kanban onCardClick={(p) => { setSelected(p); setModals({...modals, editCli: true}); }} />
        )}
      </main>

      {modals.newFab && <FactoryFormModal onClose={() => setModals({...modals, newFab: false})} />}
      {modals.editFab && <FactoryEditModal order={selected} onClose={() => setModals({...modals, editFab: false})} onConvert={convertToCli} />}
      {modals.newCli && <FormModal initialData={selected} onClose={() => setModals({...modals, newCli: false})} />}
      {modals.editCli && <EditModal proposal={selected} onClose={() => setModals({...modals, editCli: false})} />}
    </div>
  )
}

const ui = {
  body: { minHeight: '100vh', width: '100%', backgroundColor: '#0F172A', backgroundImage: 'radial-gradient(circle at 0% 0%, #1E293B 0%, #0F172A 100%)' },
  header: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', 
    backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(15px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
    position: 'sticky', top: 0, zIndex: 1000, width: '100%'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoMark: { width: '4px', height: '35px', backgroundColor: '#EF4444', borderRadius: '4px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' },
  brandName: { fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' },
  brandStatus: { fontSize: '9px', color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase' },
  nav: { display: 'flex', gap: '5px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' },
  navBtn: { padding: '10px 25px', border: 'none', background: 'none', color: '#64748B', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' },
  navBtnActive: { padding: '10px 25px', border: 'none', backgroundColor: '#EF4444', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)' },
  btnMain: { padding: '12px 25px', backgroundColor: '#fff', color: '#0F172A', border: 'none', fontWeight: '900', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  content: { padding: '40px', width: '100%' }
}