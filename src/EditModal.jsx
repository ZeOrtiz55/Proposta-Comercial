import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import jsPDF from 'jspdf'
import QRCode from 'qrcode' 

export default function EditModal({ proposal, onClose }) {
  const [formData, setFormData] = useState(proposal || {})
  const [imagePreview, setImagePreview] = useState(proposal?.Imagem_Equipamento || '')
  const [assinaturaDiretor, setAssinaturaDiretor] = useState(null)
  const [factoryData, setFactoryData] = useState(null)

  useEffect(() => {
    if (proposal) {
      setFormData({ ...proposal })
      setImagePreview(proposal.Imagem_Equipamento)
      fetchConfig()
      if (proposal.id_fabrica_ref) {
        fetchFactoryInfo(proposal.id_fabrica_ref)
      } else {
        setFactoryData(null)
      }
    }
  }, [proposal])

  const fetchConfig = async () => {
    const { data } = await supabase.from('Configuracoes').select('assinatura_url').single()
    if (data) setAssinaturaDiretor(data.assinatura_url)
  }

  const fetchFactoryInfo = async (idRef) => {
    const { data } = await supabase.from('Proposta_Fabrica').select('*').eq('id', idRef).single()
    if (data) setFactoryData(data)
  }

  const getImageDimensions = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = () => resolve({ width: 100, height: 50 })
      img.src = url
    })
  }

  const handlePrint = async () => {
    const doc = new jsPDF()
    const margin = 15
    const pageWidth = doc.internal.pageSize.getWidth()
    const innerWidth = pageWidth - (margin * 2)
    let y = 0

    const qrText = `https://wa.me/5514998189779?text=Olá, sobre a proposta nº${formData.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrText);

    // CABEÇALHO
    doc.setFillColor(239, 68, 68); doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255); doc.setFontSize(14); doc.setFont("helvetica", "bold")
    doc.text("NOVA TRATORES MÁQUINAS AGRÍCOLAS LTDA.", margin, 12)
    doc.setFontSize(8); doc.text("CONCESSIONÁRIA AUTORIZADA", margin, 17)

    y = 28; doc.setTextColor(0); doc.setFontSize(11)
    doc.text(`PROPOSTA COMERCIAL | Nº ${formData.id || ''}`, margin, y)
    doc.setFontSize(8); doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')}`, margin, y + 4)

    // QR CODE TOPO DIREITO
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - margin - 15, 18, 15, 15)
    doc.setFontSize(5); doc.text("CONTATO", pageWidth - margin - 15, 34)

    // BLOCOS COLADOS
    doc.setDrawColor(0); doc.setLineWidth(0.4)

    // GRADE I: CLIENTE
    y = 38; 
    doc.rect(margin, y, innerWidth, 25)
    doc.setFontSize(8.5); doc.setFont("helvetica", "normal")
    doc.text(`CLIENTE: ${formData.Cliente || ''}`, margin + 5, y + 7)
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj'] || ''}`, margin + 5, y + 13)
    doc.text(`I.E./MUN.: ${formData['inscricao_esta/mun'] || ''}`, margin + 5, y + 19)
    doc.text(`CIDADE: ${formData.Cidade || ''}`, pageWidth / 2 + 10, y + 7)
    doc.text(`BAIRRO: ${formData.Bairro || ''}`, pageWidth / 2 + 10, y + 13)
    doc.text(`ENDEREÇO: ${formData.End_Entrega || ''}`, pageWidth / 2 + 10, y + 19)

    // GRADE II: IMAGEM (95mm)
    y += 25; 
    doc.rect(margin, y, innerWidth, 95)
    if (formData.Imagem_Equipamento) {
      const dims = await getImageDimensions(formData.Imagem_Equipamento)
      const ratio = dims.width / dims.height; 
      let imgW = 170; let imgH = imgW / ratio;
      if (imgH > 87) { imgH = 87; imgW = imgH * ratio } 
      doc.addImage(formData.Imagem_Equipamento, 'JPEG', (pageWidth - imgW) / 2, y + 4, imgW, imgH)
    }

    // GRADE III: TÉCNICO
    y += 95; 
    doc.rect(margin, y, innerWidth, 45)
    doc.setFontSize(8.5); doc.text(`MARCA: ${formData.Marca || ''}`, margin + 5, y + 7)
    doc.text(`MODELO: ${formData.Modelo || ''}`, margin + 5, y + 13)
    doc.text(`ANO: ${formData.Ano || ''}`, margin + 5, y + 19)
    doc.text(`NCM: ${formData['Niname/NCM'] || ''}`, pageWidth / 2 + 10, y + 7)
    doc.text(`QTD: ${formData.Qtd_Eqp || '1'}`, pageWidth / 2 + 10, y + 13)
    doc.setFont("helvetica", "bold"); doc.text("CONFIGURAÇÃO TÉCNICA:", margin + 5, y + 27)
    doc.setFont("helvetica", "normal")
    const configTxt = formData.Configuracao || formData.Descricao || ''
    const splitConfig = doc.splitTextToSize(configTxt, innerWidth - 10)
    doc.text(splitConfig, margin + 5, y + 32)

    // GRADE IV: FINANCEIRO
    y += 45; 
    doc.setFillColor(250, 250, 210); doc.rect(margin, y, innerWidth, 8, 'F')
    doc.rect(margin, y, innerWidth, 38)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("CASO SEJA FINANCIADO TAXA FLAT POR CONTA DO CLIENTE", pageWidth / 2, y + 5.5, { align: "center" })
    doc.setFontSize(9); doc.setFont("helvetica", "normal")
    doc.text(`VALOR TOTAL: R$ ${formData.Valor_Total || '0,00'}`, margin + 5, y + 15)
    doc.setTextColor(16, 185, 129); doc.text(`VALOR À VISTA: R$ ${formData.Valor_A_Vista || '0,00'}`, margin + 5, y + 22)
    doc.setTextColor(0); doc.text(`PRAZO ENTREGA: ${formData.Prazo_Entrega || '0'} DIAS`, pageWidth / 2 + 10, y + 15)
    doc.text(`CONDIÇÕES: ${formData.Condicoes || ''}`, pageWidth / 2 + 10, y + 22)
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(180, 83, 9);
    doc.text(`ESTA PROPOSTA É VÁLIDA POR ${formData.validade || '---'} DIAS.`, margin + 5, y + 31)

    // --- ASSINATURAS REPOSICIONADAS ---
    y = 260; // Altura da linha
    const lineW = 75; 
    const midPointL = margin + (lineW / 2);
    const midPointR = pageWidth - margin - (lineW / 2);
    
    // Assinatura Cliente
    doc.setDrawColor(0); doc.line(margin, y, margin + lineW, y); 
    doc.setFontSize(6.5); doc.setTextColor(0);
    doc.text(`${formData.Cliente || ''}`.toUpperCase(), midPointL, y + 4, { align: "center" })
    doc.text(`CPF/CNPJ: ${formData['Cpf/Cpnj'] || ''}`, midPointL, y + 7.5, { align: "center" })
    doc.text(`${formData.End_Entrega || ''}, ${formData.Bairro || ''}`, midPointL, y + 11, { align: "center" })
    doc.text(`${formData.Cidade || ''} - CEP: ${formData.cep || ''}`, midPointL, y + 14.5, { align: "center" })

    // Assinatura Diretor (DESCIDA E AUMENTADA)
    doc.line(pageWidth - margin - lineW, y, pageWidth - margin, y)
    if (assinaturaDiretor) { 
      // y - 5: O topo da imagem começa apenas 5mm acima da linha, cruzando ela pelo topo.
      // Largura 115mm: Deixa a assinatura bem grande.
      doc.addImage(assinaturaDiretor, 'PNG', pageWidth - margin - 110, y - 5, 115, 35) 
    }

    doc.save(`Proposta_${formData.Cliente || 'NovaTratores'}.pdf`)
  }

  const handleUpdate = async () => {
    const { error } = await supabase.from('Formulario').update(formData).eq('id', proposal.id)
    if (!error) { alert("ATUALIZADO!"); window.location.reload(); }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        {/* Modal content remains the same as previous stable version */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '4px', height: '25px', backgroundColor: '#EF4444' }}></div>
            <h2 style={{ fontWeight: '900', color: '#000', margin: 0 }}>EDIÇÃO PROPOSTA #{formData.id}</h2>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={handlePrint} style={s.btnPrint}>IMPRIMIR PDF</button>
            <button onClick={onClose} style={s.closeBtn}>FECHAR [X]</button>
          </div>
        </div>
        <div style={s.scroll}>
          {/* Form fields including IE and CEP fields */}
          <div style={s.vList}>
            <div style={s.sectionTitle}>DADOS DO CLIENTE</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>NOME</label><input value={formData.Cliente || ''} onChange={e => setFormData({ ...formData, Cliente: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.label}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj'] || ''} onChange={e => setFormData({ ...formData, 'Cpf/Cpnj': e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>I.E. / MUN.</label><input value={formData['inscricao_esta/mun'] || ''} onChange={e => setFormData({ ...formData, 'inscricao_esta/mun': e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>CIDADE</label><input value={formData.Cidade || ''} onChange={e => setFormData({ ...formData, Cidade: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.label}>BAIRRO</label><input value={formData.Bairro || ''} onChange={e => setFormData({ ...formData, Bairro: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>CEP</label><input value={formData.cep || ''} onChange={e => setFormData({ ...formData, cep: e.target.value })} style={s.input} /></div>
              </div>
              <div style={{...s.row, borderBottom: 'none'}}>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>ENDEREÇO</label><input value={formData.End_Entrega || ''} onChange={e => setFormData({ ...formData, End_Entrega: e.target.value })} style={s.input} /></div>
              </div>
            </div>
            {/* Rest of the form remains unchanged... */}
            <div style={s.sectionTitle}>EQUIPAMENTO</div>
            <center>{imagePreview && <img src={imagePreview} style={s.imgPreview} alt="Preview" />}</center>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>MARCA</label><input value={formData.Marca || ''} onChange={e => setFormData({ ...formData, Marca: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.label}>MODELO</label><input value={formData.Modelo || ''} onChange={e => setFormData({ ...formData, Modelo: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>ANO</label><input value={formData.Ano || ''} onChange={e => setFormData({ ...formData, Ano: e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>DESCRIÇÃO TÉCNICA</label><textarea value={formData.Configuracao || formData.Descricao || ''} onChange={e => setFormData({ ...formData, Configuracao: e.target.value })} style={s.textarea} /></div>
              </div>
            </div>
            <div style={s.sectionTitle}>FINANCEIRO</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.label}>VALOR TOTAL</label><input value={formData.Valor_Total || ''} onChange={e => setFormData({ ...formData, Valor_Total: e.target.value })} style={{ ...s.input, color: 'red' }} /></div>
                <div style={s.cell}><label style={s.label}>À VISTA</label><input value={formData.Valor_A_Vista || ''} onChange={e => setFormData({ ...formData, Valor_A_Vista: e.target.value })} style={{ ...s.input, color: 'green' }} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.label}>VALIDADE (DIAS)</label><input value={formData.validade || ''} onChange={e => setFormData({ ...formData, validade: e.target.value })} style={{...s.input, color: '#B45309'}} /></div>
              </div>
            </div>
          </div>
        </div>
        <div style={s.footer}>
          <button onClick={handleUpdate} style={s.btnMain}>SALVAR ALTERAÇÕES</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modal: { backgroundColor: '#F5F5DC', width: '95%', maxWidth: '1100px', height: '95vh', borderRadius: '20px', display: 'flex', flexDirection: 'column', border: '3px solid #000', overflow: 'hidden' },
  header: { padding: '20px 40px', backgroundColor: '#fff', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { padding: '30px 40px', overflowY: 'auto', flex: 1 },
  vList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionTitle: { fontSize: '11px', fontWeight: '900', color: '#EF4444', textTransform: 'uppercase' },
  gridContainer: { border: '2px solid #000', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' },
  row: { display: 'flex', borderBottom: '1px solid #eee' },
  cell: { flex: 1, padding: '10px 15px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '2px' },
  label: { fontSize: '8.5px', fontWeight: '800', color: '#94a3b8' },
  input: { border: 'none', outline: 'none', fontSize: '14px', fontWeight: '700', color: '#000', background: 'none', width: '100%' },
  textarea: { border: 'none', outline: 'none', fontSize: '13px', width: '100%', minHeight: '70px', background: 'none', resize: 'none', fontWeight: '600' },
  imgPreview: { width: '280px', border: '3px solid #000', borderRadius: '10px', marginBottom: '10px' },
  footer: { padding: '20px 40px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' },
  btnPrint: { padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { border: 'none', background: 'none', color: '#000', fontWeight: '900', cursor: 'pointer' }
}