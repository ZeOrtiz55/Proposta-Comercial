import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import jsPDF from 'jspdf'
import QRCode from 'qrcode' 

export default function EditModal({ proposal, onClose }) {
  const [formData, setFormData] = useState(proposal || {})
  const [imagePreview, setImagePreview] = useState(proposal?.Imagem_Equipamento || '')
  const [assinaturaDiretor, setAssinaturaDiretor] = useState(null)

  // DETECÇÃO REFORÇADA DE TRATOR
  const isTrator = !!(formData.motor_trator || formData.cambio_trator || formData.trasmissao_tras_trator);

  useEffect(() => {
    if (proposal) {
      setFormData({ ...proposal })
      setImagePreview(proposal.Imagem_Equipamento)
      fetchConfig()
    }
  }, [proposal])

  const fetchConfig = async () => {
    const { data } = await supabase.from('Configuracoes').select('assinatura_url').single()
    if (data) setAssinaturaDiretor(data.assinatura_url)
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

    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - margin - 15, 18, 15, 15)
    doc.setFontSize(5); doc.text("CONTATO", pageWidth - margin - 15, 34)

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

    // GRADE II: IMAGEM (Ajustada se for trator)
    y += 25; 
    const imgBoxHeight = isTrator ? 60 : 95;
    doc.rect(margin, y, innerWidth, imgBoxHeight)
    if (formData.Imagem_Equipamento) {
      const dims = await getImageDimensions(formData.Imagem_Equipamento)
      const ratio = dims.width / dims.height; 
      let imgW = 170; let imgH = imgW / ratio;
      const maxImgH = imgBoxHeight - 8;
      if (imgH > maxImgH) { imgH = maxImgH; imgW = imgH * ratio } 
      doc.addImage(formData.Imagem_Equipamento, 'JPEG', (pageWidth - imgW) / 2, y + 4, imgW, imgH)
    }

    // GRADE III: TÉCNICO
    y += imgBoxHeight; 
    const techBoxHeight = isTrator ? 80 : 45;
    doc.rect(margin, y, innerWidth, techBoxHeight)
    doc.setFontSize(8.5); doc.setFont("helvetica", "bold")
    doc.text(`MARCA: ${formData.Marca || ''}`, margin + 5, y + 7)
    doc.text(`MODELO: ${formData.Modelo || ''}`, margin + 5, y + 13)
    doc.text(`ANO: ${formData.Ano || ''}`, margin + 5, y + 19)
    doc.text(`NCM: ${formData['Niname/NCM'] || ''}`, pageWidth / 2 + 10, y + 7)
    doc.text(`QTD: ${formData.Qtd_Eqp || '1'}`, pageWidth / 2 + 10, y + 13)
    
    doc.text("CONFIGURAÇÃO TÉCNICA:", margin + 5, y + 27)
    
    if (isTrator) {
      doc.setFontSize(7.5);
      const startY = y + 33;
      const col2 = pageWidth / 2 + 5;
      const lineHeight = 5;

      const renderField = (label, value, posX, posY) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, posX, posY);
        const labelWidth = doc.getTextWidth(`${label}: `);
        doc.setFont("helvetica", "normal");
        doc.text(`${value || '---'}`, posX + labelWidth, posY);
      };

      renderField("MOTOR", formData.motor_trator, margin + 5, startY);
      renderField("BOMBA INJETORA", formData.bomb_inje_trator, margin + 5, startY + lineHeight);
      renderField("BOMBA HIDRÁULICA", formData.bomb_hidra_trator, margin + 5, startY + (lineHeight * 2));
      renderField("EMBREAGEM", formData.embreagem_trator, margin + 5, startY + (lineHeight * 3));
      renderField("CAPACIDADE COMB.", formData.capacit_comb_trator, margin + 5, startY + (lineHeight * 4));
      renderField("DIANTEIRA MÍN/MÁX", formData.diant_min_max_trator, margin + 5, startY + (lineHeight * 5));

      renderField("CÂMBIO", formData.cambio_trator, col2, startY);
      renderField("REVERSOR", formData.reversor_trator, col2, startY + lineHeight);
      renderField("TRANS. DIANTEIRA", formData.transmissao_diant_trator, col2, startY + (lineHeight * 2));
      renderField("TRANS. TRASEIRA", formData.trasmissao_tras_trator, col2, startY + (lineHeight * 3));
      renderField("ÓLEO MOTOR", formData.oleo_motor_trator, col2, startY + (lineHeight * 4));
      renderField("ÓLEO TRANS.", formData.oleo_trasmissao_trator, col2, startY + (lineHeight * 5));
      renderField("TRASEIRA MÍN/MÁX", formData.tras_min_max_trator, col2, startY + (lineHeight * 6));

    } else {
      doc.setFont("helvetica", "normal")
      const infoTecnica = formData.Configuracao || formData.Descricao || '';
      const splitConfig = doc.splitTextToSize(infoTecnica, innerWidth - 10)
      doc.text(splitConfig, margin + 5, y + 32)
    }

    // GRADE IV: FINANCEIRO
    y += techBoxHeight; 
    doc.setFillColor(250, 250, 210); doc.rect(margin, y, innerWidth, 8, 'F')
    doc.rect(margin, y, innerWidth, 38)
    doc.line(margin, y + 8, margin + innerWidth, y + 8)
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.text("CASO SEJA FINANCIADO TAXA FLAT POR CONTA DO CLIENTE", pageWidth / 2, y + 5.5, { align: "center" })
    doc.setFontSize(9); doc.setFont("helvetica", "normal")
    doc.text(`VALOR TOTAL: R$ ${formData.Valor_Total || '0,00'}`, margin + 5, y + 18)
    doc.text(`PRAZO ENTREGA: ${formData.Prazo_Entrega || '0'} DIAS`, pageWidth / 2 + 10, y + 18)
    doc.text(`CONDIÇÕES: ${formData.Condicoes || ''}`, pageWidth / 2 + 10, y + 25)
    
    if (formData.validade && formData.validade !== 'Sem validade') {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(180, 83, 9);
      doc.text(`ESTA PROPOSTA É VÁLIDA POR ${formData.validade} DIAS.`, margin + 5, y + 31)
    }

    // --- ASSINATURAS ALINHADAS ---
    y = 260; 
    const lineW = 75; 
    const midPointL = margin + (lineW / 2);
    
    // Cliente (Esquerda)
    doc.setDrawColor(0); doc.line(margin, y, margin + lineW, y); 
    doc.setFontSize(7); doc.setTextColor(0); doc.setFont("helvetica", "bold");
    doc.text(`${formData.Cliente || ''}`.toUpperCase(), midPointL, y + 5, { align: "center" })
    doc.setFont("helvetica", "normal");
    doc.text(`${formData['Cpf/Cpnj'] || ''}`, midPointL, y + 9, { align: "center" })
    doc.text(`${formData.End_Entrega || ''}`, midPointL, y + 13, { align: "center" })
    doc.text(`${formData.Bairro || ''}`, midPointL, y + 17, { align: "center" })

    // Diretor (Direita - Imagem e Risco)
    const directorLineX = pageWidth - margin - lineW;
    doc.line(directorLineX, y, pageWidth - margin, y);
    if (assinaturaDiretor) { 
      // X: directorLineX - 5 (movido para direita)
      // Y: y - 10 (alinha 1cm abaixo do topo com a linha de assinatura)
      doc.addImage(assinaturaDiretor, 'PNG', directorLineX - 5, y - 5, 85, 25) 
    }

    doc.save(`Proposta_${formData.Cliente || 'NovaTratores'}.pdf`)
  }

  const handleUpdate = async () => {
    const { error } = await supabase.from('Formulario').update(formData).eq('id', proposal.id)
    if (!error) { alert("ATUALIZADO COM SUCESSO!"); window.location.reload(); }
    else { alert("Erro: " + error.message); }
  }

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
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
          <div style={s.vList}>
            <div style={s.sectionTitle}>I. DADOS DO CLIENTE</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.labelBold}>NOME</label><input value={formData.Cliente || ''} onChange={e => setFormData({ ...formData, Cliente: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.labelBold}>CPF / CNPJ</label><input value={formData['Cpf/Cpnj'] || ''} onChange={e => setFormData({ ...formData, 'Cpf/Cpnj': e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>I.E. / MUN.</label><input value={formData['inscricao_esta/mun'] || ''} onChange={e => setFormData({ ...formData, 'inscricao_esta/mun': e.target.value })} style={s.input} /></div>
              </div>
              <div style={s.row}>
                <div style={s.cell}><label style={s.labelBold}>CIDADE</label><input value={formData.Cidade || ''} onChange={e => setFormData({ ...formData, Cidade: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.labelBold}>BAIRRO</label><input value={formData.Bairro || ''} onChange={e => setFormData({ ...formData, Bairro: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>CEP</label><input value={formData.cep || ''} onChange={e => setFormData({ ...formData, cep: e.target.value })} style={s.input} /></div>
              </div>
              <div style={{...s.row, borderBottom: 'none'}}>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>ENDEREÇO COMPLETO</label><input value={formData.End_Entrega || ''} onChange={e => setFormData({ ...formData, End_Entrega: e.target.value })} style={s.input} /></div>
              </div>
            </div>

            <div style={s.sectionTitle}>II. DADOS DO {isTrator ? 'TRATOR' : 'IMPLEMENTO'}</div>
            <center>{imagePreview && <img src={imagePreview} style={s.imgPreviewMini} alt="Preview" />}</center>
            
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.labelBold}>MARCA</label><input value={formData.Marca || ''} onChange={e => setFormData({ ...formData, Marca: e.target.value })} style={s.input} /></div>
                <div style={s.cell}><label style={s.labelBold}>MODELO</label><input value={formData.Modelo || ''} onChange={e => setFormData({ ...formData, Modelo: e.target.value })} style={s.input} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>ANO</label><input value={formData.Ano || ''} onChange={e => setFormData({ ...formData, Ano: e.target.value })} style={s.input} /></div>
              </div>

              {isTrator ? (
                <div style={s.gridTractor}>
                  <div style={s.col}>
                    <div style={s.cellTech}><label style={s.labelBold}>MOTOR</label><input value={formData.motor_trator || ''} onChange={e => setFormData({...formData, motor_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>BOMBA INJE.</label><input value={formData.bomb_inje_trator || ''} onChange={e => setFormData({...formData, bomb_inje_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>BOMBA HIDRA.</label><input value={formData.bomb_hidra_trator || ''} onChange={e => setFormData({...formData, bomb_hidra_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>EMBREAGEM</label><input value={formData.embreagem_trator || ''} onChange={e => setFormData({...formData, embreagem_trator: e.target.value})} style={s.input} /></div>
                  </div>
                  <div style={s.col}>
                    <div style={s.cellTech}><label style={s.labelBold}>CÂMBIO</label><input value={formData.cambio_trator || ''} onChange={e => setFormData({...formData, cambio_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>REVERSOR</label><input value={formData.reversor_trator || ''} onChange={e => setFormData({...formData, reversor_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>TRANS. DIANT.</label><input value={formData.transmissao_diant_trator || ''} onChange={e => setFormData({...formData, transmissao_diant_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>TRANS. TRAS.</label><input value={formData.trasmissao_tras_trator || ''} onChange={e => setFormData({...formData, trasmissao_tras_trator: e.target.value})} style={s.input} /></div>
                  </div>
                  <div style={{...s.col, borderRight: 'none'}}>
                    <div style={s.cellTech}><label style={s.labelBold}>CAP. COMB.</label><input value={formData.capacit_comb_trator || ''} onChange={e => setFormData({...formData, capacit_comb_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>ÓLEO MOTOR</label><input value={formData.oleo_motor_trator || ''} onChange={e => setFormData({...formData, oleo_motor_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>ÓLEO TRANS.</label><input value={formData.oleo_trasmissao_trator || ''} onChange={e => setFormData({...formData, oleo_trasmissao_trator: e.target.value})} style={s.input} /></div>
                    <div style={s.cellTech}><label style={s.labelBold}>FINAME/NCM</label><input value={formData['Niname/NCM'] || ''} onChange={e => setFormData({...formData, 'Niname/NCM': e.target.value})} style={s.input} /></div>
                  </div>
                  <div style={s.rowFull}>
                    <div style={s.cell}><label style={s.labelBold}>DIANTEIRA MÍN/MÁX</label><input value={formData.diant_min_max_trator || ''} onChange={e => setFormData({...formData, diant_min_max_trator: e.target.value})} style={s.input} /></div>
                    <div style={{...s.cell, borderRight: 'none'}}><label style={s.labelBold}>TRASEIRA MÍN/MÁX</label><input value={formData.tras_min_max_trator || ''} onChange={e => setFormData({...formData, tras_min_max_trator: e.target.value})} style={s.input} /></div>
                  </div>
                </div>
              ) : (
                <div style={{...s.row, borderBottom: 'none'}}>
                  <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>DESCRIÇÃO TÉCNICA</label><textarea value={formData.Configuracao || formData.Descricao || ''} onChange={e => setFormData({ ...formData, Configuracao: e.target.value })} style={s.textarea} /></div>
                </div>
              )}
            </div>

            <div style={s.sectionTitle}>III. FINANCEIRO</div>
            <div style={s.gridContainer}>
              <div style={s.row}>
                <div style={s.cell}><label style={s.labelBold}>VALOR TOTAL</label><input value={formData.Valor_Total || ''} onChange={e => setFormData({ ...formData, Valor_Total: e.target.value })} style={{ ...s.input, color: 'red' }} /></div>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>VALIDADE (DIAS)</label><input value={formData.validade || ''} onChange={e => setFormData({ ...formData, validade: e.target.value })} style={{...s.input, color: '#B45309'}} /></div>
              </div>
              <div style={{...s.row, borderBottom: 'none'}}>
                <div style={{ ...s.cell, borderRight: 'none' }}><label style={s.labelBold}>CONDIÇÕES DE PAGAMENTO</label><input value={formData.Condicoes || ''} onChange={e => setFormData({ ...formData, Condicoes: e.target.value })} style={s.input} /></div>
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
  gridTractor: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#fff', borderBottom: '1px solid #eee' },
  col: { borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', borderBottom: '1px solid #eee' },
  rowFull: { display: 'flex', width: '100%', borderTop: '1px solid #eee' },
  cell: { flex: 1, padding: '10px 15px', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '2px' },
  cellTech: { padding: '8px 12px', borderBottom: '1px solid #f8f8f8', display: 'flex', flexDirection: 'column', gap: '1px' },
  labelBold: { fontSize: '8.5px', fontWeight: '900', color: '#1E293B', textTransform: 'uppercase' }, 
  input: { border: 'none', outline: 'none', fontSize: '13px', fontWeight: '700', color: '#000', background: 'none', width: '100%' },
  textarea: { border: 'none', outline: 'none', fontSize: '13px', width: '100%', minHeight: '70px', background: 'none', resize: 'none', fontWeight: '600' },
  imgPreviewMini: { width: '100px', height: '80px', objectFit: 'contain', border: '2px solid #000', borderRadius: '8px', marginBottom: '10px' }, 
  footer: { padding: '20px 40px', backgroundColor: '#fff', borderTop: '3px solid #000' },
  btnMain: { width: '100%', padding: '16px', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' },
  btnPrint: { padding: '10px 20px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { border: 'none', background: 'none', color: '#000', fontWeight: '900', cursor: 'pointer' }
}