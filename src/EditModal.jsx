import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import jsPDF from 'jspdf'

export default function EditModal({ proposal, onClose }) {
  const [formData, setFormData] = useState(proposal || {})
  const [historiaFabrica, setHistoriaFabrica] = useState(null)
  const [assinaturaDiretor, setAssinaturaDiretor] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (proposal) {
      setFormData({ ...proposal })
      const fetchHistory = async () => {
        const { data: sig } = await supabase.from('Configuracoes').select('assinatura_url').single()
        if (sig) setAssinaturaDiretor(sig.assinatura_url)
        if (proposal.id_fabrica_ref) {
          const { data: fab } = await supabase.from('Proposta_Fabrica').select('*').eq('id', proposal.id_fabrica_ref).single()
          setHistoriaFabrica(fab)
        }
      }
      fetchHistory()
    }
  }, [proposal])

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase.from('Formulario').update(formData).eq('id', proposal.id)
    if (!error) { alert("DADOS ATUALIZADOS!"); window.location.reload(); }
    setLoading(false)
  }

  const handlePrint = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const innerWidth = pageWidth - (margin * 2);
    let y = 20;

    doc.setFontSize(10.5); doc.setFont("helvetica", "normal");
    doc.setFillColor(255, 0, 0); doc.rect(0, 0, pageWidth, 16, 'F');
    doc.setTextColor(255); doc.setFont("helvetica", "bold");
    doc.text("NOVA TRATORES MÁQUINAS AGRÍCOLAS LTDA.", margin, 11);
    y = 25; doc.setTextColor(0); doc.text(`PROPOSTA COMERCIAL | Nº ${formData.id}`, margin, y);

    // Cliente
    y += 6; doc.setDrawColor(200); doc.setFillColor(248); doc.rect(margin, y, innerWidth, 22, 'F'); doc.rect(margin, y, innerWidth, 22);
    doc.setFontSize(8); doc.text("DADOS DO CLIENTE", margin + 3, y + 5);
    doc.setFontSize(10.5); doc.text(`CLIENTE: ${formData.Cliente}`, margin + 3, y + 11);
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj']}`, margin + 3, y + 17);
    doc.text(`CIDADE: ${formData.Cidade}`, pageWidth/2 + 5, y + 11);
    doc.text(`BAIRRO: ${formData.Bairro}`, pageWidth/2 + 5, y + 17);

    // Equipamento
    y += 30; doc.setFillColor(50); doc.rect(margin, y, innerWidth, 7, 'F');
    doc.setTextColor(255); doc.setFontSize(8); doc.text("ESPECIFICAÇÕES", margin + 3, y + 5);
    y += 7; doc.setTextColor(0); doc.setFontSize(10.5); doc.rect(margin, y, innerWidth, 28);
    doc.line(pageWidth/2, y, pageWidth/2, y + 28);
    doc.text(`MARCA: ${formData.Marca}`, margin + 3, y + 8);
    doc.text(`MODELO: ${formData.Modelo}`, margin + 3, y + 16);
    doc.text(`ANO: ${formData.Ano}`, margin + 3, y + 24);
    doc.text(`QTD: ${formData.Qtd_Eqp}`, pageWidth/2 + 3, y + 8);
    doc.text(`FINAME: ${formData['Niname/NCM']}`, pageWidth/2 + 3, y + 16);

    // Frase Amarela
    y += 65;
    const frase = "CASO SEJA FINANCIADO TAXA FLAT POR CONTA DO CLIENTE";
    doc.setFont("helvetica", "bold");
    const tw = doc.getTextWidth(frase);
    doc.setFillColor(255, 255, 0); doc.rect((pageWidth-tw)/2 - 3, y-5, tw+6, 7, 'F');
    doc.text(frase, pageWidth/2, y, { align: "center" });

    // Financeiro
    y += 8; doc.rect(margin, y, innerWidth, 25);
    doc.text(`VALOR TOTAL: R$ ${formData.Valor_Total}`, margin+3, y+10);
    doc.text(`VALOR À VISTA: R$ ${formData.Valor_A_Vista}`, margin+3, y+18);
    doc.text(`PRAZO: ${formData.Prazo_Entrega} DIAS`, pageWidth/2+3, y+10);

    // Assinaturas
    const sigY = 275;
    if (assinaturaDiretor) doc.addImage(assinaturaDiretor, 'PNG', margin + (innerWidth/4) - 35, sigY - 25, 70, 30);
    doc.line(pageWidth/2+10, sigY, pageWidth-margin, sigY);
    doc.setFontSize(9); doc.text("ASSINATURA DO CLIENTE", pageWidth/2 + (innerWidth/4) + 10, sigY + 5, {align: "center"});
    
    doc.save(`Proposta_${formData.Cliente}.pdf`);
  };

  if (!proposal) return null;

  return (
    <div style={m.overlay}>
      <div style={m.modal}>
        
        <div style={m.main}>
          <div style={m.header}>
            <div>
              <h2 style={{fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: 0}}>GESTÃO DA PROPOSTA</h2>
              <p style={{fontSize: '11px', color: '#94A3B8', margin: 0}}>ID REGISTRO: #{formData.id}</p>
            </div>
            <button onClick={onClose} style={m.closeBtn}>FECHAR PAINEL</button>
          </div>
          
          <div style={m.scroll}>
            <div style={m.vList}>
              
              <section style={m.sectionBox}>
                <div style={m.sectionHeader}><div style={m.indicator}></div> DADOS DO CLIENTE</div>
                <div style={m.grid}>
                  <div style={m.cell}><label style={m.label}>NOME / RAZÃO SOCIAL</label>
                  <input value={formData.Cliente} onChange={e => setFormData({...formData, Cliente: e.target.value})} style={m.input} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>CPF / CNPJ</label>
                  <input value={formData['Cpf/Cpnj']} style={m.input} readOnly /></div>
                </div>
                <div style={{...m.grid, borderTop: '1px solid #E2E8F0'}}>
                  <div style={m.cell}><label style={m.label}>CIDADE</label><input value={formData.Cidade} style={m.input} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>BAIRRO</label><input value={formData.Bairro} style={m.input} /></div>
                </div>
              </section>

              <section style={m.sectionBox}>
                <div style={m.sectionHeader}><div style={m.indicator}></div> ESPECIFICAÇÕES DA MÁQUINA</div>
                <div style={m.grid}>
                  <div style={m.cell}><label style={m.label}>MARCA</label><input value={formData.Marca} style={m.input} /></div>
                  <div style={m.cell}><label style={m.label}>MODELO</label><input value={formData.Modelo} style={m.input} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>ANO</label><input value={formData.Ano} style={m.input} /></div>
                </div>
                <div style={{...m.grid, borderTop: '1px solid #E2E8F0'}}>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>DESCRIÇÃO</label>
                  <textarea value={formData.Descricao} style={m.textarea} /></div>
                </div>
              </section>

              <section style={m.sectionBox}>
                <div style={m.sectionHeader}><div style={m.indicator}></div> FINANCEIRO</div>
                <div style={m.grid}>
                  <div style={m.cell}><label style={m.label}>VALOR TOTAL (R$)</label>
                  <input type="number" value={formData.Valor_Total} style={{...m.input, color: '#EF4444', fontWeight: '800'}} /></div>
                  <div style={{...m.cell, borderRight: 'none'}}><label style={m.label}>VALOR À VISTA (R$)</label>
                  <input type="number" value={formData.Valor_A_Vista} style={{...m.input, color: '#10B981', fontWeight: '800'}} /></div>
                </div>
              </section>

            </div>
          </div>

          <div style={m.footer}>
            <button onClick={handlePrint} style={m.btnPrint}>GERAR PDF COMERCIAL</button>
            <button onClick={handleUpdate} style={m.btnSave}>{loading ? 'A GUARDAR...' : 'SALVAR ALTERAÇÕES'}</button>
          </div>
        </div>

        {/* SIDEBAR HISTÓRICO */}
        <div style={m.sidebar}>
          <h3 style={m.sideTitle}>HISTÓRICO FÁBRICA</h3>
          {historiaFabrica ? (
            <div style={m.sideList}>
              <div style={m.sideItem}><label>REF. ORIGINAL</label><p>#{historiaFabrica.id}</p></div>
              <div style={m.sideItem}><label>VENDEDOR</label><p>{historiaFabrica.vendedor_fab}</p></div>
              <div style={m.sideItem}><label>CUSTO FÁBRICA</label><p>R$ {historiaFabrica.valor_final}</p></div>
              <div style={m.sideItem}><label>ENTREGA</label><p>{historiaFabrica.tipo_entrega}</p></div>
              <div style={m.sideBadge}>✓ VINCULADO</div>
            </div>
          ) : (
            <p style={{fontSize: '11px', color: '#64748B'}}>Sem histórico vinculado.</p>
          )}
        </div>

      </div>
    </div>
  )
}

const m = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: '#F1F5F9', width: '98%', maxWidth: '1200px', height: '92vh', borderRadius: '24px', display: 'flex', overflow: 'hidden', animation: 'modalFadeIn 0.4s ease-out' },
  main: { flex: 1, display: 'flex', flexDirection: 'column' },
  sidebar: { width: '300px', backgroundColor: '#1E293B', padding: '40px 25px', color: '#fff' },
  header: { padding: '25px 40px', backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '30px 40px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '30px' },
  sectionBox: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' },
  sectionHeader: { padding: '15px 20px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '11px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px' },
  indicator: { width: '4px', height: '12px', backgroundColor: '#EF4444', borderRadius: '2px' },
  grid: { display: 'flex', width: '100%' },
  cell: { flex: 1, padding: '20px', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '10px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  input: { border: 'none', outline: 'none', fontSize: '15px', fontWeight: '600', color: '#1E293B', width: '100%', background: 'none' },
  textarea: { border: 'none', outline: 'none', fontSize: '14px', color: '#64748B', width: '100%', minHeight: '80px', resize: 'none' },
  footer: { padding: '25px 40px', backgroundColor: '#fff', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '15px' },
  btnSave: { flex: 1.5, padding: '18px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  btnPrint: { flex: 1, padding: '18px', backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  sideTitle: { fontSize: '12px', fontWeight: '900', color: '#94A3B8', letterSpacing: '2px', marginBottom: '30px' },
  sideList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sideItem: { borderBottom: '1px solid #334155', paddingBottom: '15px' },
  sideBadge: { backgroundColor: '#10B981', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '10px', fontWeight: '900', textAlign: 'center' },
  closeBtn: { border: 'none', background: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }
}