// =====================================================
// EXP Digital CRM — Webhook Google Forms → CRM
// Como usar:
//   1. Na planilha, clique em Extensões > Apps Script
//   2. Cole este código e salve
//   3. Em Triggers (ícone de relógio), adicione:
//      - Função: onFormSubmit
//      - Evento: Do Google Sheets > On form submit
//   4. Autorize o script quando solicitado
// =====================================================

const CRM_URL = "https://SEU_DOMINIO.com/api/webhook/google-forms";
const SECRET  = "GOOGLE_FORMS_WEBHOOK_SECRET_AQUI"; // mesmo valor do .env.local

function onFormSubmit(e) {
  const row = e.values; // array com os valores na ordem das colunas

  const payload = {
    secret:               SECRET,
    timestamp:            row[0],
    nome:                 row[1],
    whatsapp:             row[2],
    instagram:            row[3],
    email:                row[4],
    ja_vende_plataforma:  row[5],
    nicho:                row[6],
    tipo_venda:           row[7],
    faturamento:          row[8],
    cria_videos:          row[9],
    dificuldade_tiktok:   row[10],
    dor_tiktok:           row[11],
    nichos_que_vende:     row[12],
    nivel_tecnico:        row[13],
    executa_missoes:      row[14],
    tempo_execucao:       row[15],
    interesse_297:        row[16],
    interesse_4500:       row[17],
    mural_futuro:         row[18],
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(CRM_URL, options);
    Logger.log("CRM response: " + response.getContentText());
  } catch (err) {
    Logger.log("Erro ao enviar para o CRM: " + err.message);
  }
}
