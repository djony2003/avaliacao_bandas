const STORAGE_KEY = "banda5_diagnostico_v3";
const QUESTION_BANK_KEY = "banda5_question_bank_v1";
const CLOUD_DRAFT_KEY = "banda5_cloud_question_draft_v1";
const AUDIO_CLEANUP_KEY = "banda5_audio_cleanup_v1";
const AUDIO_DB_NAME = "banda5_audio_db";
const ADMIN_HASH_KEY = "banda5_admin_password_hash_v1";
const DEFAULT_ADMIN_HASH = "547899d34968ca08c8b45fcea4e3d3f69c688b7619524ddda3ac469e220a0220";
const RECOVERY_HASH = "0d984b543fc1980c10f85dddda814c819bb38e0d7c167f9d6ed83c5c57226f1d";

const selfScale = [
  { value: 0, label: "Ainda não" }, { value: 1, label: "Com muita ajuda" },
  { value: 2, label: "Com alguma ajuda" }, { value: 3, label: "Sozinho" },
  { value: 4, label: "Com segurança" }
];

const frequencyOptions = [
  { value: 0, label: "Nunca" }, { value: 1, label: "Às vezes" },
  { value: 2, label: "Frequentemente" }, { value: 3, label: "Sempre" }
];

const q = (id, text, category, options, correct) => ({ id, type: "quiz", text, category, options: [...options, "Não sei"], correct });
const s = (id, text, category) => ({ id, type: "scale", text, category, scale: selfScale });

let sections = [
  {
    id: "identificacao", kicker: "Perfil do participante", title: "Sobre você", questions: [
      { id: "nome", type: "text", text: "Qual é o seu nome?", required: true, placeholder: "Digite seu nome" },
      { id: "email", type: "email", text: "Qual é o seu e-mail?", help: "Usaremos este dado apenas para identificar seu diagnóstico no painel do avaliador.", required: true, placeholder: "nome@exemplo.com" },
      { id: "idade", type: "number", text: "Qual é a sua idade?", required: true, placeholder: "Ex.: 18" },
      { id: "instrumento", type: "single", text: "Qual função será avaliada hoje?", required: true,
        options: ["Bateria", "Baixo", "Violão", "Guitarra", "Teclado", "Vocal"] },
      { id: "tempo_musica", type: "single", text: "Há quanto tempo você pratica essa função?", required: true,
        options: ["Menos de 6 meses", "6 meses a 1 ano", "1 a 2 anos", "2 a 5 anos", "Mais de 5 anos"] },
      { id: "aulas", type: "single", text: "Como tem sido sua formação nessa função?", required: true,
        options: ["Autodidata", "Aulas ocasionais", "Já fiz curso/aulas", "Estudo com professor atualmente", "Formação musical regular"] },
      { id: "segunda_funcao", type: "text", text: "Você também toca ou canta em outra função?", required: false, placeholder: "Opcional — ex.: violão e segunda voz" }
    ]
  },
  {
    id: "comum", kicker: "Prática em conjunto", title: "Tocando em equipe", questions: [
      { id: "com_pulso", type: "frequency", text: "Mantenho o pulso do início ao fim, inclusive em trechos simples.", options: frequencyOptions, category: "ritmo" },
      { id: "com_estrutura", type: "frequency", text: "Reconheço e acompanho introdução, verso, refrão, ponte e final.", options: frequencyOptions, category: "conjunto" },
      { id: "com_dinamica", type: "frequency", text: "Ajusto intensidade e volume quando o arranjo muda.", options: frequencyOptions, category: "conjunto" },
      { id: "com_escuta", type: "frequency", text: "Consigo ouvir os demais sem perder minha própria execução.", options: frequencyOptions, category: "conjunto" },
      { id: "com_sinais", type: "frequency", text: "Respondo aos sinais do líder para entradas, cortes, repetições e finais.", options: frequencyOptions, category: "conjunto" },
      { id: "com_erro", type: "frequency", text: "Se eu ou outra pessoa erra, reencontro rapidamente a música.", options: frequencyOptions, category: "conjunto" },
      { id: "com_preparo", type: "frequency", text: "Chego ao ensaio sabendo forma, tom e referências da música.", options: frequencyOptions, category: "preparo" }
    ]
  },
  {
    id: "gerais", kicker: "Conhecimento musical", title: "Questões Gerais", questions: [
      q("obj_semitom", "Qual par está separado por um semitom natural?", "teoria", ["C–D", "E–F", "F–G", "A–B"], 1),
      q("obj_compasso", "Em 4/4, quantas pulsações de semínima completam um compasso?", "ritmo", ["2", "3", "4", "8"], 2),
      q("obj_dinamica", "Em um arranjo, dinâmica é principalmente:", "conjunto", ["A velocidade fixa", "A variação de intensidade", "O número de acordes", "A afinação padrão"], 1)
    ]
  },
  {
    id: "harmonia", kicker: "Acordes e funções", title: "Harmonia", questions: [
      q("obj_tonica", "Na tonalidade de G maior, qual é a tônica?", "harmonia", ["C", "D", "G", "Em"], 2),
      q("obj_campo", "Qual sequência pertence inteiramente ao campo harmônico de C maior?", "harmonia", ["C–Dm–Em–F", "C–D–E–F", "Cm–Dm–Eb–F", "C–Dm–E–Fm"], 0),
      q("obj_graus", "Em C maior, a progressão G–Am–F–C corresponde a quais graus?", "harmonia", ["I–IV–V–I", "V–vi–IV–I", "IV–V–iii–I", "V–IV–ii–I"], 1),
      q("obj_transpor", "Ao transpor C–G–Am–F para o tom de D, qual sequência resulta?", "harmonia", ["D–A–Bm–G", "D–G–Bm–A", "D–A–B–G", "E–B–C#m–A"], 0),
      q("obj_tríade", "Como se constrói uma tríade maior a partir da tônica?", "harmonia", ["Tônica, 3ª maior e 5ª justa", "Tônica, 3ª menor e 5ª justa", "Tônica, 4ª justa e 7ª maior", "Tônica, 5ª justa e oitava"], 0),
      q("obj_menor", "Qual alteração transforma uma tríade maior em menor?", "harmonia", ["Baixar a tônica", "Baixar a terça meio tom", "Subir a quinta meio tom", "Acrescentar a sétima"], 1)
    ]
  },
  {
    id: "escalas", kicker: "Distâncias e formação", title: "Escalas e Intervalos", questions: [
      q("esc_formula", "Qual é a sequência de tons (T) e semitons (S) da escala maior?", "teoria", ["T–T–S–T–T–T–S", "T–S–T–T–S–T–T", "T–T–T–S–T–S–T", "S–T–T–S–T–T–T"], 0),
      q("int_terca", "De C até E encontramos qual intervalo?", "teoria", ["2ª maior", "3ª maior", "4ª justa", "5ª justa"], 1),
      q("int_quinta", "Quantos semitons formam uma quinta justa?", "teoria", ["5", "6", "7", "8"], 2),
      q("esc_g", "Qual nota recebe sustenido na escala de G maior?", "teoria", ["C", "D", "F", "G"], 2)
    ]
  },
  {
    id: "audio", kicker: "Exercícios de ouvido", title: "Percepção Musical", questions: [
      { id: "aud_tonica", type: "audioQuiz", text: "Ouça a escala e identifique a nota de repouso (tônica).", help: "Você pode ouvir quantas vezes precisar.", category: "percepcao", audio: { kind: "melody", notes: [261.63,293.66,329.63,349.23,392,440,493.88,523.25,392,329.63,261.63] }, options: ["C", "D", "F", "G", "Não sei"], correct: 0 },
      { id: "aud_maior_menor", type: "audioQuiz", text: "O acorde que você ouve é maior ou menor?", category: "percepcao", audio: { kind: "chord", notes: [220,261.63,329.63] }, options: ["Maior", "Menor", "Diminuto", "Aumentado", "Não sei"], correct: 1 },
      { id: "aud_intervalo", type: "audioQuiz", text: "Qual intervalo melódico você ouve?", category: "percepcao", audio: { kind: "melody", notes: [261.63,392] }, options: ["2ª maior", "3ª maior", "4ª justa", "5ª justa", "Não sei"], correct: 3 },
      { id: "aud_progressao", type: "audioQuiz", text: "Qual progressão em C maior foi tocada?", help: "Ouça a sensação de saída, movimento e retorno.", category: "harmonia", audio: { kind: "progression", chords: [[261.63,329.63,392],[196,246.94,293.66],[220,261.63,329.63],[174.61,220,261.63],[261.63,329.63,392]] }, options: ["I–V–vi–IV–I", "I–IV–V–vi–I", "vi–IV–I–V–vi", "I–ii–V–I–I", "Não sei"], correct: 0 }
    ]
  },
  {
    id: "vozes", kicker: "Cordas e teclas", title: "Divisão de Vozes", dynamicInstrument: true,
    questionsByInstrument: {
      "Baixo": [
        q("voz_baixo_intervalo", "Em um acorde de C maior, qual nota do baixo cria a primeira inversão?", "harmonia", ["C", "E", "G", "B"], 1),
        q("voz_baixo_conducao", "Para ligar C a Am com menor movimento, qual nota comum pode ser sustentada?", "harmonia", ["C", "D", "F", "G"], 0)
      ],
      "Violão": [
        q("voz_vio_acorde", "Quais intervalos formam o acorde maior em qualquer região do braço?", "harmonia", ["1–3–5", "1–b3–5", "1–4–5", "1–5–b7"], 0),
        q("voz_vio_essenciais", "Ao dividir vozes com teclado, quais notas definem melhor a qualidade maior ou menor do acorde?", "harmonia", ["Apenas a tônica", "Terça e sétima", "Quinta e oitava", "Apenas a quinta"], 1),
        q("voz_vio_regiao", "Para não competir com um teclado na região média, uma boa escolha é:", "conjunto", ["Dobrar todas as notas", "Usar outra região e voicing mais enxuto", "Tocar sempre mais forte", "Evitar a terça em todo acorde"], 1)
      ],
      "Guitarra": [
        q("voz_gui_acorde", "Quais intervalos formam uma tríade menor?", "harmonia", ["1–3–5", "1–b3–5", "1–4–5", "1–b3–b5"], 1),
        q("voz_gui_guide", "Em acordes com sétima, quais vozes normalmente revelam melhor a função harmônica?", "harmonia", ["Tônica e quinta", "Terça e sétima", "Quinta e oitava", "Somente a tônica"], 1),
        q("voz_gui_arranjo", "Se teclado e violão já preenchem o acorde, a guitarra pode contribuir melhor com:", "conjunto", ["O mesmo voicing completo", "Tríades em outra região ou linhas complementares", "Mais graves", "Volume máximo"], 1)
      ],
      "Teclado": [
        q("voz_tec_acorde", "Quais notas formam Dm7?", "harmonia", ["D–F–A–C", "D–F#–A–C", "D–F–Ab–C", "D–G–A–C"], 0),
        q("voz_tec_aberto", "Em um voicing aberto, as notas do acorde são:", "harmonia", ["Tocadas apenas pela mão esquerda", "Distribuídas com maior espaço entre as vozes", "Sempre empilhadas por terças próximas", "Limitadas a tônica e quinta"], 1),
        q("voz_tec_conducao", "Na condução de vozes, o objetivo principal é:", "harmonia", ["Mover todas as notas por saltos", "Manter notas comuns e mover as demais pelo caminho mais curto", "Usar sempre a posição fundamental", "Dobrar a tônica em todas as vozes"], 1)
      ]
    }
  },
  { id: "especifico", kicker: "Técnica da função", title: "Avaliação específica", dynamicInstrument: true,
    questionsByInstrument: {
      "Bateria": [
        s("bat_click", "Mantenho o groove alinhado ao metrônomo sem correr ou atrasar.", "tecnica_especifica"),
        s("bat_coord", "Executo grooves com independência entre bumbo, caixa e condução.", "tecnica_especifica"),
        s("bat_bumbo", "Alinho o bumbo com a intenção rítmica do baixo.", "conjunto"),
        s("bat_virada", "Faço viradas e volto ao tempo 1 com precisão.", "ritmo"),
        s("bat_dinamica", "Controlo volume, timbre e intensidade em cada parte da música.", "tecnica_especifica"),
        s("bat_estilos", "Adapto o groove a estilos e subdivisões diferentes.", "ritmo"),
        q("bat_subdiv", "Em 4/4, quantas colcheias há em um compasso completo?", "ritmo", ["4", "6", "8", "16"], 2),
        q("bat_fill", "Uma virada musicalmente segura deve priorizar:", "tecnica_especifica", ["Quantidade de notas", "Volume máximo", "Tempo, fraseado e retorno ao groove", "Usar todos os tambores"], 2)
      ],
      "Baixo": [
        s("baixo_braco", "Localizo notas e tônicas em diferentes regiões do braço.", "tecnica_especifica"),
        s("baixo_tempo", "Toco com precisão junto ao bumbo e ao metrônomo.", "ritmo"),
        s("baixo_muting", "Controlo ruídos e duração das notas com abafamento.", "tecnica_especifica"),
        s("baixo_passagem", "Crio passagens que conectam acordes sem perder o groove.", "harmonia"),
        s("baixo_dinamica", "Ajusto ataque e intensidade ao arranjo.", "conjunto"),
        s("baixo_ouvido", "Descubro tônicas e movimentos do baixo pela gravação.", "percepcao"),
        q("baixo_quinta", "Se a tônica é G, qual é sua quinta justa?", "harmonia", ["B", "C", "D", "E"], 2),
        q("baixo_funcao", "Na progressão C–Am–F–G, quais tônicas formam a linha básica?", "tecnica_especifica", ["C–A–F–G", "C–E–F–B", "C–G–A–F", "A–C–G–F"], 0)
      ],
      "Violão": [
        s("vio_troca", "Troco acordes abertos e com pestana sem interromper o pulso.", "tecnica_especifica"),
        s("vio_levada", "Mantenho levadas consistentes com subdivisão clara.", "ritmo"),
        s("vio_voicing", "Escolho inversões/voicings que não ocupam espaço demais.", "tecnica_especifica"),
        s("vio_transp", "Transponho cifras e uso capotraste conscientemente.", "harmonia"),
        s("vio_dinam", "Vario ataque e densidade entre verso e refrão.", "conjunto"),
        s("vio_ouvido", "Reconheço mudanças de acorde pela gravação.", "percepcao"),
        q("vio_capo", "Com formas de G e capotraste na 2ª casa, o acorde soa como:", "harmonia", ["A", "F", "G#", "B"], 0),
        q("vio_notas", "Quais notas formam o acorde de D maior?", "tecnica_especifica", ["D–F–A", "D–F#–A", "D–G–A", "D–F#–B"], 1)
      ],
      "Guitarra": [
        s("gui_tempo", "Executo riffs e bases com precisão rítmica e metrônomo.", "ritmo"),
        s("gui_braco", "Localizo notas, intervalos e tônicas pelo braço.", "tecnica_especifica"),
        s("gui_artic", "Controlo bends, slides, vibrato, ligados e abafamentos.", "tecnica_especifica"),
        s("gui_voicing", "Escolho voicings que complementam teclado e violão.", "conjunto"),
        s("gui_timbre", "Ajusto ganho, efeitos e volume sem encobrir a banda.", "conjunto"),
        s("gui_impro", "Construo frases usando escala e notas do acorde.", "harmonia"),
        q("gui_penta", "Quais notas formam a pentatônica menor de A?", "harmonia", ["A–B–C–E–F", "A–C–D–E–G", "A–C#–D–E–G#", "A–B–D–E–F#"], 1),
        q("gui_power", "Um power chord de G é formado principalmente por:", "tecnica_especifica", ["G–B", "G–C", "G–D", "G–F"], 2)
      ],
      "Teclado": [
        s("tec_escalas", "Executo escalas maiores com dedilhado e pulsação consistentes.", "tecnica_especifica"),
        s("tec_inversoes", "Uso inversões para conduzir vozes com pouco movimento.", "harmonia"),
        s("tec_maos", "Coordeno as mãos sem comprometer o tempo.", "tecnica_especifica"),
        s("tec_camadas", "Escolho timbres, regiões e camadas adequados ao arranjo.", "conjunto"),
        s("tec_transp", "Toco em outros tons sem depender do botão transpose.", "harmonia"),
        s("tec_ouvido", "Reproduzo melodias e progressões pela gravação.", "percepcao"),
        q("tec_tríade", "Quais notas formam a tríade de E maior?", "harmonia", ["E–G–B", "E–G#–B", "E–A–B", "E–G#–C"], 1),
        q("tec_inv", "A primeira inversão de C maior é:", "tecnica_especifica", ["C–E–G", "E–G–C", "G–C–E", "C–F–G"], 1)
      ],
      "Vocal": [
        { id: "voc_papel", type: "single", text: "Qual papel vocal você exerce com mais frequência?", required: true, options: ["Voz principal", "Segunda voz / backing vocal", "As duas funções"] },
        s("voc_afin", "Sustento a afinação em notas longas e mudanças melódicas.", "tecnica_especifica"),
        s("voc_resp", "Administro respiração e apoio sem tensão excessiva.", "tecnica_especifica"),
        s("voc_ritmo", "Faço entradas, cortes e síncopes com precisão rítmica.", "ritmo"),
        s("voc_ext", "Conheço minha extensão e comunico um tom confortável.", "tecnica_especifica"),
        s("voc_harm", "Sustento minha linha quando outra voz canta notas diferentes.", "harmonia"),
        s("voc_dinam", "Ajusto articulação, intensidade e emissão ao arranjo.", "conjunto"),
        s("voc_mic", "Uso distância e direção do microfone para controlar o som.", "tecnica_especifica"),
        q("voc_intervalo", "Uma segunda voz em terça acima de C canta qual nota (em C maior)?", "harmonia", ["D", "E", "F", "G"], 1),
        q("voc_tom", "Se uma música força notas agudas e gera tensão, a primeira ação é:", "tecnica_especifica", ["Cantar mais forte", "Pedir avaliação do tom e ajustar", "Prender a respiração", "Evitar aquecimento"], 1)
      ]
    }
  },
  {
    id: "pessoal", kicker: "Plano de desenvolvimento", title: "Próximos passos", questions: [
      { id: "repertorio", type: "text", text: "Qual música do repertório melhor representa sua execução atual?", required: true, placeholder: "Nome da música" },
      { id: "dificuldade", type: "textarea", text: "Em qual situação concreta você sente mais dificuldade?", required: true, placeholder: "Ex.: manter a segunda voz no refrão, voltar da virada no tempo..." },
      { id: "meta_90", type: "textarea", text: "O que você gostaria de conseguir fazer com segurança nos próximos 90 dias?", required: true, placeholder: "Defina uma meta observável" },
      { id: "estudo", type: "single", text: "Quanto tempo real você consegue reservar para estudar por semana?", required: true, options: ["Até 30 min", "30–60 min", "1–2 horas", "2–4 horas", "Mais de 4 horas"] },
      { id: "observacao", type: "textarea", text: "Há algo que o avaliador precisa saber?", required: false, placeholder: "Opcional" }
    ]
  }
];

const DEFAULT_SECTIONS = JSON.parse(JSON.stringify(sections));
loadQuestionBank();

let answers = {}, visibleQuestions = [], currentIndex = 0, audioContext, editorAuthorized = false, cloudSubmissions = [], submittedProtocol = null, currentSubmissionId = null, verifiedScores = null, verifiedReviewItems = null, cloudBankDirty = false, pendingAudioDeletes = [], stagedAudioUploads = [], publishedSections = null, adminPublishedSections = null, cloudBaseRevision = null, cloudBaseUpdatedAt = null, cloudAssessmentPublished = false;
localStorage.removeItem(STORAGE_KEY);
const $ = id => document.getElementById(id);
const welcomeScreen = $("welcomeScreen"), quizScreen = $("quizScreen"), resultScreen = $("resultScreen"), editorScreen = $("editorScreen");
const questionContainer = $("questionContainer"), sectionTitle = $("sectionTitle"), sectionKicker = $("sectionKicker");
const progressText = $("progressText"), progressBar = $("progressBar"), sectionProgress = $("sectionProgress"), backBtn = $("backBtn"), nextBtn = $("nextBtn");

$("startBtn").addEventListener("click", startQuiz); backBtn.addEventListener("click", goBack); nextBtn.addEventListener("click", goNext);
$("quizForm").addEventListener("submit", event => event.preventDefault());
$("restartBtn").addEventListener("click", restartQuiz); $("downloadJsonBtn").addEventListener("click", downloadJSON); $("downloadCsvBtn").addEventListener("click", downloadCSV);
$("printPdfBtn").addEventListener("click", generatePDFReport);
$("openEditorBtn").addEventListener("click", requestEditorAccess); $("closeEditorBtn").addEventListener("click", closeEditor);
$("editorSection").addEventListener("change", renderEditor); $("editorInstrument").addEventListener("change", renderEditor);
$("addQuestionBtn").addEventListener("click", addEditorQuestion); $("exportBankBtn").addEventListener("click", exportQuestionBank);
$("importBankInput").addEventListener("change", importQuestionBank); $("resetBankBtn").addEventListener("click", resetQuestionBank); $("changePasswordBtn").addEventListener("click", changeAdminPassword);
$("saveCloudBtn").addEventListener("click", saveQuestionBankToCloud); $("showQuestionsBtn").addEventListener("click", showQuestionsPanel); $("showResponsesBtn").addEventListener("click", showResponsesPanel);
$("refreshResponsesBtn").addEventListener("click", loadCloudResponses); $("responsesSearch").addEventListener("input", renderCloudResponses); $("exportResponsesBtn").addEventListener("click", exportCloudResponses);
$("cloudLogoutBtn").addEventListener("click", cloudAdminLogout); $("submitResultBtn").addEventListener("click", submitDiagnosisToCloud);
function protectEditorReturn(event) {
  const isReturn = event.key === "Enter" || event.code === "Enter" || event.code === "NumpadEnter";
  if (!isReturn || editorScreen.classList.contains("hidden") || !editorScreen.contains(event.target) || event.target.closest("#adminDialog") || !event.target.matches("input, textarea, select")) return;
  event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
  if (event.type === "keydown" && event.target.matches("textarea")) {
    const field = event.target, start = field.selectionStart, end = field.selectionEnd;
    field.setRangeText("\n", start, end, "end"); field.dispatchEvent(new Event("input", { bubbles:true }));
  }
  requestAnimationFrame(() => event.target.focus());
}
document.addEventListener("keydown", protectEditorReturn, true);
document.addEventListener("keypress", protectEditorReturn, true);
initializeCloudApp();

async function initializeCloudApp() {
  const status = $("cloudStatus"), submitButton = $("submitResultBtn"), startButton = $("startBtn"), editorButton = $("openEditorBtn");
  status.classList.remove("is-local", "is-online", "is-error");
  if (!window.BandDB?.configured) {
    if (window.BANDA5_PRODUCTION_BUILD) {
      status.textContent = "Configuração pendente"; status.classList.add("is-error");
      startButton.disabled = true; editorButton.disabled = true;
      return;
    }
    status.textContent = "Modo local"; status.classList.add("is-local");
    return;
  }
  BandDB.onAuthStateChange((event) => { if (event === "PASSWORD_RECOVERY") setTimeout(completeCloudPasswordRecovery, 100); });
  startButton.disabled = true;
  status.textContent = "Conectando...";
  try {
    const remote = await BandDB.loadQuestionBank();
    cloudBaseRevision = remote.revision; cloudBaseUpdatedAt = remote.updatedAt;
    if (remote.sections?.length) { validateQuestionBank(remote.sections, { requireAnswerKey:false }); sections = remote.sections; publishedSections = JSON.parse(JSON.stringify(sections)); cloudBankDirty = false; cloudAssessmentPublished = true; }
    else { cloudBankDirty = true; cloudAssessmentPublished = false; }
    status.textContent = cloudAssessmentPublished ? "Banco online" : "Aguardando publicação"; status.classList.add("is-online"); submitButton.classList.remove("hidden");
  } catch (error) { console.error("Falha ao carregar banco remoto", error); status.textContent = "Banco indisponível"; status.classList.add("is-error"); }
  finally { startButton.disabled = window.BandDB?.configured && !cloudAssessmentPublished; }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value), digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
function showAdminDialog({ title, message = "", label = "Senha", type = "password", primary = "Continuar", secondary = "", error = "", input = true }) {
  const dialog = $("adminDialog"), form = $("adminDialogForm"), field = $("adminDialogInput"), secondaryBtn = $("adminDialogSecondary");
  $("adminDialogTitle").textContent = title; $("adminDialogMessage").textContent = message; $("adminDialogLabel").textContent = label;
  $("adminDialogPrimary").textContent = primary; secondaryBtn.textContent = secondary; secondaryBtn.classList.toggle("hidden", !secondary);
  $("adminDialogFieldWrap").classList.toggle("hidden", !input); field.type = type; field.value = ""; field.autocomplete = type === "password" ? "current-password" : "off";
  $("adminDialogError").textContent = error; $("adminDialogError").classList.toggle("hidden", !error); dialog.classList.remove("hidden");
  setTimeout(() => input ? field.focus() : $("adminDialogPrimary").focus(), 50);
  return new Promise(resolve => {
    const finish = (action, value = "") => { dialog.classList.add("hidden"); form.onsubmit = null; $("adminDialogCancel").onclick = null; secondaryBtn.onclick = null; resolve({ action, value }); };
    form.onsubmit = event => { event.preventDefault(); finish("primary", field.value); };
    $("adminDialogCancel").onclick = () => finish("cancel"); secondaryBtn.onclick = () => finish("secondary", field.value);
  });
}
async function requestEditorAccess() {
  if (window.BandDB?.configured) return requestCloudAdminAccess();
  if (editorAuthorized) return openEditor();
  const access = await showAdminDialog({ title:"Acesso ao editor", message:"Esta área é exclusiva do administrador do diagnóstico.", label:"Senha do administrador", primary:"Entrar", secondary:"Esqueci a senha" });
  if (access.action === "cancel") return; if (access.action === "secondary") return recoverAdminPassword(); const password = access.value;
  const expectedHash = localStorage.getItem(ADMIN_HASH_KEY) || DEFAULT_ADMIN_HASH;
  if (await sha256(password) === expectedHash) { editorAuthorized = true; return openEditor(); }
  const retry = await showAdminDialog({ title:"Senha incorreta", message:"A senha informada não confere. Tente novamente ou use o código de recuperação.", label:"Senha do administrador", primary:"Tentar novamente", secondary:"Usar recuperação", error:"Não foi possível liberar o acesso." });
  if (retry.action === "secondary") return recoverAdminPassword();
  if (retry.action === "primary" && await sha256(retry.value) === expectedHash) { editorAuthorized = true; return openEditor(); }
  if (retry.action === "primary") return requestEditorAccess();
}
async function requestCloudAdminAccess() {
  try {
    if (editorAuthorized && await BandDB.isAdmin()) return openCloudEditor();
    const session = await BandDB.getSession();
    if (session && await BandDB.isAdmin()) { editorAuthorized = true; return openCloudEditor(); }
  } catch (error) {
    await showAdminDialog({ title:"Banco indisponível", message:error.message || "Não foi possível verificar a conta administrativa.", primary:"Fechar", input:false, error:"Confira sua conexão e tente novamente." }); return;
  }
  const emailDialog = await showAdminDialog({ title:"Login administrativo", message:"Entre com a conta cadastrada como administradora no banco online.", label:"E-mail", type:"email", primary:"Continuar", secondary:"Esqueci a senha" });
  if (emailDialog.action === "secondary") return requestCloudPasswordReset(emailDialog.value);
  if (emailDialog.action !== "primary") return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDialog.value.trim())) {
    await showAdminDialog({ title:"E-mail inválido", message:"Informe o e-mail completo da sua conta administrativa.", primary:"Voltar", input:false, error:"Exemplo: nome@dominio.com" });
    return requestCloudAdminAccess();
  }
  const passwordDialog = await showAdminDialog({ title:"Senha da conta", message:`Conta: ${emailDialog.value}`, label:"Senha", primary:"Entrar" });
  if (passwordDialog.action !== "primary") return;
  try { await BandDB.signIn(emailDialog.value.trim(), passwordDialog.value); editorAuthorized = true; await openCloudEditor(); if (!editorScreen.classList.contains("hidden")) editorNotice("Painel conectado ao banco online."); }
  catch (error) { const retry = await showAdminDialog({ title:"Acesso negado", message:error.message || "Não foi possível entrar.", primary:"Tentar novamente", input:false, error:"Confira o e-mail, a senha e a permissão de administrador." }); if (retry.action === "primary") return requestCloudAdminAccess(); }
}

async function requestCloudPasswordReset(initialEmail = "") {
  let email = initialEmail.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const emailDialog = await showAdminDialog({ title:"Recuperar senha", message:"Informe o e-mail da conta administrativa. Você receberá um link para criar uma nova senha.", label:"E-mail", type:"email", primary:"Enviar link" });
    if (emailDialog.action !== "primary") return;
    email = emailDialog.value.trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return requestCloudPasswordReset();
  try {
    await BandDB.sendPasswordReset(email);
    await showAdminDialog({ title:"Confira seu e-mail", message:"Se essa conta estiver cadastrada, o banco enviará um link seguro para redefinir a senha.", primary:"Entendi", input:false });
  } catch (error) { await showAdminDialog({ title:"Não foi possível enviar", message:error.message || "Tente novamente em alguns minutos.", primary:"Fechar", input:false, error:"O pedido de recuperação não foi concluído." }); }
}

async function completeCloudPasswordRecovery() {
  const next = await requestNewPassword("Criar nova senha da conta");
  if (!next) return;
  try { await BandDB.updatePassword(next); await showAdminDialog({ title:"Senha redefinida", message:"Sua nova senha foi salva. Você já pode abrir o painel administrativo.", primary:"Concluir", input:false }); }
  catch (error) { await showAdminDialog({ title:"Não foi possível salvar", message:error.message || "Peça um novo link de recuperação e tente novamente.", primary:"Fechar", input:false, error:"A senha não foi alterada." }); }
}
async function recoverAdminPassword() {
  const recovery = await showAdminDialog({ title:"Recuperar acesso", message:"Informe o código de recuperação guardado pelo administrador.", label:"Código de recuperação", type:"text", primary:"Validar código" });
  if (recovery.action !== "primary") return; if (await sha256(recovery.value.trim().toUpperCase()) !== RECOVERY_HASH) { await showAdminDialog({ title:"Código inválido", message:"O código informado não corresponde ao código de recuperação.", primary:"Voltar", input:false, error:"Verifique o código e tente novamente." }); return requestEditorAccess(); }
  const next = await requestNewPassword("Criar nova senha"); if (!next) return;
  localStorage.setItem(ADMIN_HASH_KEY, await sha256(next)); editorAuthorized = true; await showAdminDialog({ title:"Senha redefinida", message:"Sua nova senha foi salva. O editor já está liberado.", primary:"Abrir editor", input:false }); openEditor();
}
async function requestNewPassword(title) {
  const first = await showAdminDialog({ title, message:"Use pelo menos 6 caracteres.", label:"Nova senha", primary:"Continuar" }); if (first.action !== "primary") return null;
  if (first.value.length < 6) { await showAdminDialog({ title:"Senha muito curta", message:"A senha precisa ter pelo menos 6 caracteres.", primary:"Voltar", input:false, error:"Escolha uma senha mais longa." }); return requestNewPassword(title); }
  const confirmation = await showAdminDialog({ title:"Confirmar nova senha", message:"Digite novamente para confirmar.", label:"Repita a nova senha", primary:"Salvar senha" }); if (confirmation.action !== "primary") return null;
  if (confirmation.value !== first.value) { await showAdminDialog({ title:"Senhas diferentes", message:"Os dois campos não correspondem.", primary:"Tentar novamente", input:false, error:"Digite a mesma senha nas duas etapas." }); return requestNewPassword(title); } return first.value;
}
async function changeAdminPassword() {
  if (window.BandDB?.configured) {
    const next = await requestNewPassword("Alterar senha da conta"); if (!next) return;
    try { await BandDB.updatePassword(next); await showAdminDialog({ title:"Senha alterada", message:"A nova senha da sua conta administrativa foi salva.", primary:"Concluir", input:false }); }
    catch (error) { await showAdminDialog({ title:"Não foi possível alterar", message:error.message || "Entre novamente e tente de novo.", primary:"Fechar", input:false, error:"A alteração não foi realizada." }); }
    return;
  }
  const currentDialog = await showAdminDialog({ title:"Alterar senha", message:"Confirme sua senha atual antes de criar uma nova.", label:"Senha atual", primary:"Confirmar" }); if (currentDialog.action !== "primary") return; const current = currentDialog.value;
  const expectedHash = localStorage.getItem(ADMIN_HASH_KEY) || DEFAULT_ADMIN_HASH;
  if (await sha256(current) !== expectedHash) return showAdminDialog({ title:"Senha incorreta", message:"A senha atual não confere.", primary:"Fechar", input:false, error:"A alteração não foi realizada." });
  const next = await requestNewPassword("Criar nova senha"); if (!next) return; localStorage.setItem(ADMIN_HASH_KEY, await sha256(next)); await showAdminDialog({ title:"Senha alterada", message:"A nova senha foi salva com sucesso.", primary:"Concluir", input:false });
}

function validateQuestionBank(bank, { requireAnswerKey = true } = {}) {
  if (!Array.isArray(bank) || !bank.length || bank.length > 50) throw new Error("O banco precisa ter entre 1 e 50 seções.");
  const validTypes = new Set(["text","email","number","textarea","single","quiz","audioQuiz","frequency","scale"]), ids = new Set(), commonQuestionsById = new Map(); let total = 0;
  bank.forEach(section => {
    if (!section || typeof section.id !== "string" || !section.id.trim() || typeof section.title !== "string" || !section.title.trim()) throw new Error("Há uma seção sem identificação ou título.");
    const lists = section.dynamicInstrument ? Object.values(section.questionsByInstrument || {}) : [section.questions];
    if (!lists.length || lists.some(list => !Array.isArray(list))) throw new Error(`A seção ${section.title} possui uma lista de perguntas inválida.`);
    lists.flat().forEach(item => {
      total++;
      if (!item || typeof item.id !== "string" || !item.id.trim() || ids.has(item.id)) throw new Error("Há perguntas sem identificação ou com identificações repetidas.");
      ids.add(item.id); if (!section.dynamicInstrument) commonQuestionsById.set(item.id, item);
      if (typeof item.text !== "string" || !item.text.trim() || item.text.length > 1000 || !validTypes.has(item.type)) throw new Error(`A pergunta ${item.id} possui texto ou formato inválido.`);
      if (["single","quiz","audioQuiz","frequency"].includes(item.type) && (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 20)) throw new Error(`A pergunta ${item.id} precisa ter entre 2 e 20 opções.`);
      if (requireAnswerKey && ["quiz","audioQuiz"].includes(item.type) && (!Number.isInteger(item.correct) || item.correct < 0 || item.correct >= item.options.length || item.options[item.correct] === "Não sei")) throw new Error(`Defina uma resposta correta válida para a pergunta ${item.id}.`);
      if (item.type === "scale" && (!Array.isArray(item.scale) || !item.scale.length)) throw new Error(`A escala da pergunta ${item.id} é inválida.`);
    });
  });
  if (!total || total > 600) throw new Error("O banco precisa ter entre 1 e 600 perguntas.");
  const requiredSystemFields = { nome:"text", email:"email", instrumento:"single" };
  Object.entries(requiredSystemFields).forEach(([id, type]) => {
    const field = commonQuestionsById.get(id);
    if (!field || field.type !== type || field.required === false) throw new Error(`O campo obrigatório ${id} precisa permanecer no formato ${type}.`);
  });
  const instruments = commonQuestionsById.get("instrumento")?.options || [], requiredInstruments = ["Bateria","Baixo","Violão","Guitarra","Teclado","Vocal"];
  if (instruments.length !== requiredInstruments.length || !requiredInstruments.every(name => instruments.includes(name))) throw new Error("O campo instrumento precisa manter exatamente as seis funções musicais.");
  return true;
}
function sanitizeQuestionBankForStudent(bank) {
  return JSON.parse(JSON.stringify(bank, (key, value) => ["correct", "explanation"].includes(key) ? undefined : value));
}
function loadQuestionBank() {
  if (window.BANDA5_PRODUCTION_BUILD) { localStorage.removeItem(QUESTION_BANK_KEY); return; }
  try { const saved = JSON.parse(localStorage.getItem(QUESTION_BANK_KEY)); if (Array.isArray(saved)) { validateQuestionBank(saved); sections = saved; } } catch (error) { console.warn("Banco de perguntas inválido", error); }
}
function persistQuestionBank() {
  if (window.BandDB?.configured) {
    cloudBankDirty = true;
    localStorage.setItem(CLOUD_DRAFT_KEY, JSON.stringify({ sections, baseRevision:cloudBaseRevision, baseUpdatedAt:cloudBaseUpdatedAt, pendingAudioDeletes, stagedAudioUploads, savedAt:new Date().toISOString() }));
    const button = $("saveCloudBtn");
    if (button) { button.textContent = "Salvar e publicar •"; button.classList.add("has-changes"); }
  } else localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(sections));
}
function editorNotice(message, error = false) { const box = $("editorNotice"); box.textContent = message; box.className = `editor-notice${error ? " error" : ""}`; setTimeout(() => box.classList.add("hidden"), 3500); }
function openEditor() {
  welcomeScreen.classList.add("hidden"); quizScreen.classList.add("hidden"); resultScreen.classList.add("hidden"); editorScreen.classList.remove("hidden");
  $("editorSection").innerHTML = sections.map((section, index) => `<option value="${index}">${escapeHTML(section.title)}</option>`).join("");
  $("editorInstrument").innerHTML = ["Bateria","Baixo","Violão","Guitarra","Teclado","Vocal"].map(name => `<option>${name}</option>`).join("");
  const cloudMode = Boolean(window.BandDB?.configured);
  document.querySelectorAll(".admin-view-tab").forEach(element => element.classList.toggle("hidden", !cloudMode));
  $("saveCloudBtn").classList.toggle("hidden", !cloudMode);
  $("cloudLogoutBtn").classList.toggle("hidden", !cloudMode);
  $("changePasswordBtn").classList.remove("hidden");
  updateCloudSaveButton(); showQuestionsPanel(); scrollToTop();
}
async function openCloudEditor() {
  if (cloudBankDirty && !editorScreen.classList.contains("hidden")) return openEditor();
  const remote = await BandDB.loadAdminQuestionBank();
  cloudBaseRevision = remote.revision; cloudBaseUpdatedAt = remote.updatedAt;
  if (remote.sections?.length) {
    validateQuestionBank(remote.sections);
    adminPublishedSections = JSON.parse(JSON.stringify(remote.sections));
    publishedSections = sanitizeQuestionBankForStudent(remote.sections);
  } else {
    adminPublishedSections = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
    publishedSections = null;
  }
  sections = JSON.parse(JSON.stringify(adminPublishedSections)); pendingAudioDeletes = []; stagedAudioUploads = []; cloudBankDirty = !remote.sections?.length;
  await retryOrphanAudioCleanup();
  let draft = null;
  try { draft = JSON.parse(localStorage.getItem(CLOUD_DRAFT_KEY)); } catch (_) { localStorage.removeItem(CLOUD_DRAFT_KEY); }
  if (draft?.sections?.length) {
    const changedOnline = Boolean(cloudBaseRevision && draft.baseRevision !== cloudBaseRevision);
    const choice = await showAdminDialog({ title:"Rascunho encontrado", message:changedOnline ? "Este rascunho foi criado sobre uma versão anterior. Você pode usar a versão online ou abrir o rascunho para revisar; uma substituição exigirá confirmação adicional." : "Há alterações não publicadas salvas neste computador.", primary:changedOnline ? "Usar versão online" : "Recuperar rascunho", secondary:changedOnline ? "Revisar rascunho" : "Descartar rascunho", input:false });
    if (choice.action === "cancel") {
      try { await BandDB.signOut(); }
      catch (error) { await showAdminDialog({ title:"Sessão ainda aberta", message:"Não foi possível encerrar o acesso administrativo. Verifique sua internet e tente novamente.", primary:"Entendi", input:false, error:"O logout não foi concluído." }); }
      editorAuthorized = false; return;
    }
    const recoverDraft = changedOnline ? choice.action === "secondary" : choice.action === "primary";
    if (recoverDraft) {
      validateQuestionBank(draft.sections); sections = draft.sections; pendingAudioDeletes = Array.isArray(draft.pendingAudioDeletes) ? draft.pendingAudioDeletes : []; stagedAudioUploads = Array.isArray(draft.stagedAudioUploads) ? draft.stagedAudioUploads : []; cloudBankDirty = true;
      if (changedOnline) { cloudBaseRevision = draft.baseRevision || null; cloudBaseUpdatedAt = draft.baseUpdatedAt || null; }
    } else { await discardCloudDraft(draft); sections = JSON.parse(JSON.stringify(adminPublishedSections)); pendingAudioDeletes = []; stagedAudioUploads = []; cloudBankDirty = !remote.sections?.length; }
  }
  openEditor();
}

async function discardCloudDraft(draft) {
  const unusedUploads = Array.isArray(draft?.stagedAudioUploads) ? draft.stagedAudioUploads : [];
  localStorage.removeItem(CLOUD_DRAFT_KEY);
  if (unusedUploads.length) await cleanupUnusedAudio(unusedUploads);
}

async function cleanupUnusedAudio(paths) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (!uniquePaths.length || !window.BandDB?.configured) return [];
  let previousQueue = [];
  try { previousQueue = JSON.parse(localStorage.getItem(AUDIO_CLEANUP_KEY)) || []; }
  catch (_) { localStorage.removeItem(AUDIO_CLEANUP_KEY); }
  const results = await Promise.allSettled(uniquePaths.map(path => BandDB.deleteAudio(path)));
  const failed = uniquePaths.filter((_, index) => results[index].status === "rejected");
  const attempted = new Set(uniquePaths);
  const remaining = Array.isArray(previousQueue) ? previousQueue.filter(path => !attempted.has(path)) : [];
  const queued = [...new Set([...remaining, ...failed])];
  if (queued.length) localStorage.setItem(AUDIO_CLEANUP_KEY, JSON.stringify(queued));
  else localStorage.removeItem(AUDIO_CLEANUP_KEY);
  return failed;
}

async function retryOrphanAudioCleanup() {
  let queued = [];
  try { queued = JSON.parse(localStorage.getItem(AUDIO_CLEANUP_KEY)) || []; } catch (_) { localStorage.removeItem(AUDIO_CLEANUP_KEY); }
  if (Array.isArray(queued) && queued.length) await cleanupUnusedAudio(queued);
}
async function closeEditor() {
  if (window.BandDB?.configured) {
    try { await BandDB.signOut(); }
    catch (error) {
      console.warn("Não foi possível encerrar a sessão remota", error);
      await showAdminDialog({ title:"Não foi possível bloquear o painel", message:"A sessão administrativa continua aberta. Verifique sua internet e tente novamente antes de deixar este computador.", primary:"Voltar ao painel", input:false, error:"O logout não foi concluído." });
      return false;
    }
    sections = JSON.parse(JSON.stringify(publishedSections || DEFAULT_SECTIONS));
  }
  editorAuthorized = false; editorScreen.classList.add("hidden"); welcomeScreen.classList.remove("hidden"); scrollToTop();
  return true;
}

function updateCloudSaveButton() {
  const button = $("saveCloudBtn");
  if (!button) return;
  button.textContent = cloudBankDirty ? "Salvar e publicar •" : "Perguntas publicadas";
  button.classList.toggle("has-changes", cloudBankDirty);
}

function setQuestionControlsVisible(visible) {
  document.querySelectorAll(".question-admin-control").forEach(element => {
    if (element.id === "editorInstrumentWrap") return;
    const cloudOnlyHidden = element.id === "saveCloudBtn" && !window.BandDB?.configured;
    element.classList.toggle("hidden", !visible || cloudOnlyHidden);
  });
  if (visible) getEditorContext();
  else $("editorInstrumentWrap").classList.add("hidden");
}

function showQuestionsPanel() {
  $("editorList").classList.remove("hidden"); $("responsesPanel").classList.add("hidden");
  setQuestionControlsVisible(true);
  $("editorPanelTitle").textContent = "Editor de perguntas";
  $("editorPanelDescription").innerHTML = "Edite o banco do teste e carregue gravações reais para os exercícios de percepção. A tecla <strong>Return</strong> pode ser usada normalmente durante a edição.";
  $("showQuestionsBtn").classList.add("is-active"); $("showResponsesBtn").classList.remove("is-active");
  renderEditor();
}

async function showResponsesPanel() {
  if (!window.BandDB?.configured) return editorNotice("Configure o banco online para receber respostas.", true);
  $("editorList").classList.add("hidden"); $("responsesPanel").classList.remove("hidden");
  setQuestionControlsVisible(false);
  $("editorPanelTitle").textContent = "Painel de respostas";
  $("editorPanelDescription").textContent = "Acompanhe os diagnósticos enviados, filtre participantes e marque os resultados já revisados.";
  $("showQuestionsBtn").classList.remove("is-active"); $("showResponsesBtn").classList.add("is-active");
  await loadCloudResponses();
}

async function saveQuestionBankToCloud() {
  if (!window.BandDB?.configured) return;
  try { validateQuestionBank(sections); } catch (error) { return editorNotice(error.message, true); }
  persistQuestionBank();
  const localAudios = getEveryQuestion().filter(item => item.audio?.kind === "uploaded");
  if (localAudios.length) return editorNotice(`${localAudios.length} áudio(s) ainda estão apenas neste computador. Recarregue esses arquivos antes de publicar.`, true);
  const button = $("saveCloudBtn"), previous = button.textContent;
  button.disabled = true; button.textContent = "Publicando...";
  try {
    const saved = await BandDB.saveQuestionBank(sections, cloudBaseRevision);
    await finishQuestionBankPublication(saved);
  } catch (error) {
    console.error("Falha ao publicar perguntas", error);
    if (String(error?.message || "").includes("CONFLITO_DE_VERSAO")) {
      const resolution = await showAdminDialog({ title:"O banco online mudou", message:"Para evitar apagar alterações feitas em outro navegador, a publicação foi bloqueada. Exporte seu rascunho antes de substituir se quiser guardar uma cópia.", primary:"Substituir versão online", secondary:"Continuar editando", input:false, error:"Confirme somente se este rascunho deve ser a nova versão oficial." });
      if (resolution.action === "primary") {
        try {
          const latest = await BandDB.loadAdminQuestionBank();
          const latestPaths = collectAudioReferences(latest.sections).remote, draftPaths = collectAudioReferences(sections).remote;
          pendingAudioDeletes = [...new Set([...pendingAudioDeletes, ...[...latestPaths].filter(path => !draftPaths.has(path))])];
          const saved = await BandDB.saveQuestionBank(sections, latest.revision);
          await finishQuestionBankPublication(saved);
        } catch (retryError) { console.error("Falha ao substituir versão online", retryError); button.textContent = previous; editorNotice(retryError.message || "Não foi possível substituir a versão online.", true); }
      } else { button.textContent = previous; editorNotice("Rascunho mantido sem alterar a versão online."); }
    } else { button.textContent = previous; editorNotice(error.message || "Não foi possível publicar as perguntas.", true); }
  }
  finally { button.disabled = false; }
}

async function finishQuestionBankPublication(saved) {
  cloudBaseRevision = saved.revision; cloudBaseUpdatedAt = saved.updatedAt; adminPublishedSections = JSON.parse(JSON.stringify(sections)); publishedSections = sanitizeQuestionBankForStudent(sections); cloudBankDirty = false; cloudAssessmentPublished = true; localStorage.removeItem(CLOUD_DRAFT_KEY); updateCloudSaveButton(); $("startBtn").disabled = false;
  const retainedAudioCount = new Set(pendingAudioDeletes).size; pendingAudioDeletes = []; stagedAudioUploads = [];
  $("cloudStatus").textContent = "Banco online"; $("cloudStatus").className = "pill cloud-pill is-online";
  editorNotice(retainedAudioCount ? "Perguntas publicadas. Os áudios anteriores foram preservados para avaliações já iniciadas." : "Perguntas e áudios publicados para os alunos.");
}

async function cloudAdminLogout() {
  if (await closeEditor()) $("cloudStatus").textContent = "Banco online";
}

function getEveryQuestion() {
  return sections.flatMap(section => section.dynamicInstrument ? Object.values(section.questionsByInstrument || {}).flat() : (section.questions || []));
}
function getQuestionsFromBank(bank) {
  return (bank || []).flatMap(section => section.dynamicInstrument ? Object.values(section.questionsByInstrument || {}).flat() : (section.questions || []));
}
function collectAudioReferences(bank) {
  return getQuestionsFromBank(bank).reduce((references, item) => {
    if (item.audio?.storagePath) references.remote.add(item.audio.storagePath);
    if (item.audio?.audioId) references.local.add(item.audio.audioId);
    return references;
  }, { remote:new Set(), local:new Set() });
}
async function trackRemovedBankAudio(previousBank, nextBank) {
  const previous = collectAudioReferences(previousBank), next = collectAudioReferences(nextBank);
  const removedRemote = [...previous.remote].filter(path => !next.remote.has(path));
  if (window.BandDB?.configured) {
    const staged = new Set(stagedAudioUploads);
    const removedStaged = removedRemote.filter(path => staged.has(path));
    stagedAudioUploads = stagedAudioUploads.filter(path => !removedStaged.includes(path));
    if (removedStaged.length) await cleanupUnusedAudio(removedStaged);
    pendingAudioDeletes = [...new Set([...pendingAudioDeletes, ...removedRemote.filter(path => !staged.has(path))])];
  }
  const removedLocal = [...previous.local].filter(id => !next.local.has(id));
  if (!window.BandDB?.configured && removedLocal.length) await Promise.all(removedLocal.map(deleteAudioFile));
}
function getEditorContext() {
  const section = sections[Number($("editorSection").value) || 0];
  $("editorInstrumentWrap").classList.toggle("hidden", !section.dynamicInstrument);
  const instrument = $("editorInstrument").value || "Violão";
  if (section.dynamicInstrument) { section.questionsByInstrument ||= {}; section.questionsByInstrument[instrument] ||= []; }
  return { section, instrument, list: section.dynamicInstrument ? section.questionsByInstrument[instrument] : section.questions };
}
function renderEditor() {
  const { list } = getEditorContext(); const host = $("editorList"); host.innerHTML = "";
  if (!list.length) host.innerHTML = '<div class="panel editor-empty">Nenhuma pergunta nesta seção para o instrumento selecionado.</div>';
  list.forEach((item, index) => {
    const objective = ["quiz","audioQuiz"].includes(item.type), systemField = ["nome","email","instrumento"].includes(item.id); const card = document.createElement("article"); card.className = "panel editor-card";
    const editableTypes = [{value:"text",label:"Resposta curta"},{value:"email",label:"E-mail"},{value:"number",label:"Número"},{value:"textarea",label:"Resposta longa"},{value:"single",label:"Seleção fixa do sistema",disabled:true},{value:"quiz",label:"Múltipla escolha"},{value:"audioQuiz",label:"Áudio + múltipla escolha"},{value:"frequency",label:"Escala de frequência"},{value:"scale",label:"Autoavaliação 0 a 4"}];
    card.innerHTML = `<div class="editor-card-top"><span class="editor-index">${String(index + 1).padStart(2,"0")}</span><label class="editor-type-select">Formato<select class="field" ${systemField ? "disabled title=\"Campo necessário para identificar o participante\"" : ""}>${editableTypes.map(type => `<option value="${type.value}" ${item.type === type.value ? "selected" : ""} ${type.disabled ? "disabled" : ""}>${type.label}</option>`).join("")}</select></label><div class="editor-order"><button type="button" class="btn btn-ghost editor-move-up" ${index === 0 ? "disabled" : ""} aria-label="Mover pergunta para cima">↑ Subir</button><button type="button" class="btn btn-ghost editor-move-down" ${index === list.length - 1 ? "disabled" : ""} aria-label="Mover pergunta para baixo">↓ Descer</button></div><button type="button" class="btn btn-danger editor-delete" ${systemField ? "disabled title=\"Campo obrigatório do sistema\"" : ""}>${systemField ? "Obrigatória" : "Excluir"}</button></div>
      <label>Enunciado<textarea class="textarea editor-question">${escapeHTML(item.text || "")}</textarea></label>
      ${objective ? `<div class="editor-options"><strong>Alternativas e resposta correta</strong>${(item.options || []).map((option, optionIndex) => `<div class="editor-option"><input type="radio" name="correct_${item.id}" value="${optionIndex}" ${item.correct === optionIndex ? "checked" : ""} ${option === "Não sei" ? "disabled" : ""} title="Marque a resposta correta"><input class="field editor-option-text" data-option="${optionIndex}" value="${escapeHTML(option)}"><button class="editor-remove-option" data-option="${optionIndex}" type="button" ${option === "Não sei" ? "disabled" : ""}>×</button></div>`).join("")}<button class="btn btn-secondary editor-add-option" type="button">+ Alternativa</button></div>` : '<p class="editor-fixed-note">Este formato não possui gabarito de alternativas.</p>'}
      <div class="editor-audio"><div class="editor-audio-copy"><strong>Áudio real do instrumento</strong><small>${item.audio?.uploadedName ? `Arquivo atual: ${escapeHTML(item.audio.uploadedName)}` : "Opcional — MP3, WAV, M4A, OGG ou outro formato aceito pelo navegador."}</small>${item.audio?.uploadedName ? `<span class="audio-storage-badge">${item.audio.kind === "uploadedRemote" ? "Publicado online" : "Salvo neste computador"}</span>` : ""}</div><div class="editor-audio-actions"><label class="btn btn-secondary file-button">${item.audio?.uploadedName ? "Substituir áudio" : "Carregar áudio"}<input class="editor-audio-file" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"></label>${["uploaded","uploadedRemote"].includes(item.audio?.kind) ? '<button class="btn btn-ghost editor-remove-audio" type="button">Remover áudio</button>' : ""}</div></div>`;
    card.querySelector(".editor-question").addEventListener("input", event => { item.text = event.target.value; persistQuestionBank(); });
    card.querySelector(".editor-type-select select").addEventListener("change", event => { changeQuestionType(item, event.target.value); persistQuestionBank(); renderEditor(); editorNotice("Formato da pergunta alterado."); });
    card.querySelector(".editor-move-up").addEventListener("click", () => moveEditorQuestion(list, index, -1));
    card.querySelector(".editor-move-down").addEventListener("click", () => moveEditorQuestion(list, index, 1));
    card.querySelector(".editor-delete").addEventListener("click", async () => { if (!confirm("Excluir esta pergunta?")) return; await removeQuestionAudio(item, false); list.splice(index, 1); persistQuestionBank(); renderEditor(); });
    if (objective) {
      card.querySelectorAll('input[type="radio"]').forEach(input => input.addEventListener("change", event => { item.correct = Number(event.target.value); persistQuestionBank(); }));
      card.querySelectorAll(".editor-option-text").forEach(input => input.addEventListener("input", event => { item.options[Number(event.target.dataset.option)] = event.target.value; persistQuestionBank(); }));
      card.querySelectorAll(".editor-remove-option").forEach(button => button.addEventListener("click", () => { const optionIndex = Number(button.dataset.option); item.options.splice(optionIndex, 1); if (item.correct > optionIndex) item.correct--; else if (item.correct === optionIndex) item.correct = 0; persistQuestionBank(); renderEditor(); }));
      card.querySelector(".editor-add-option").addEventListener("click", () => { const unknown = item.options.lastIndexOf("Não sei"); item.options.splice(unknown < 0 ? item.options.length : unknown, 0, "Nova alternativa"); persistQuestionBank(); renderEditor(); });
    }
    card.querySelector(".editor-audio-file").addEventListener("change", event => uploadEditorAudio(event.target.files[0], item));
    card.querySelector(".editor-remove-audio")?.addEventListener("click", async () => { if (!confirm("Remover o áudio desta pergunta?")) return; await removeQuestionAudio(item); });
    host.appendChild(card);
  });
}
function moveEditorQuestion(list, index, direction) {
  const target = index + direction; if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]]; persistQuestionBank(); renderEditor();
  const movedCard = $("editorList").querySelectorAll(".editor-card")[target];
  movedCard?.classList.add("editor-card-new"); movedCard?.scrollIntoView({ behavior:"smooth", block:"center" });
}
function changeQuestionType(item, type) {
  item.type = type;
  if (["quiz","audioQuiz"].includes(type)) { item.options = Array.isArray(item.options) && typeof item.options[0] === "string" ? item.options : ["Alternativa correta","Outra alternativa","Não sei"]; if (!item.options.includes("Não sei")) item.options.push("Não sei"); item.correct = Number.isInteger(item.correct) ? item.correct : 0; item.category ||= "teoria"; }
  if (type === "frequency") { item.options = frequencyOptions; item.category ||= "conjunto"; delete item.correct; }
  if (type === "scale") { item.scale = selfScale; item.category ||= "tecnica_especifica"; delete item.correct; }
  if (["text","email","number","textarea"].includes(type)) { item.required = true; item.placeholder = type === "email" ? "nome@exemplo.com" : type === "number" ? "Digite um número" : "Digite sua resposta"; delete item.correct; }
}
function addEditorQuestion() {
  const { list } = getEditorContext();
  list.unshift({ id:`custom_${createSubmissionId()}`, type:"text", text:"Nova pergunta", required:true, placeholder:"Digite sua resposta" });
  persistQuestionBank(); renderEditor(); editorNotice("Nova pergunta criada. Escolha o formato e edite o enunciado.");
  const newCard = $("editorList").querySelector(".editor-card"); newCard?.classList.add("editor-card-new");
  newCard?.scrollIntoView({ behavior:"smooth", block:"center" }); setTimeout(() => newCard?.querySelector(".editor-question")?.focus(), 350);
}
async function uploadEditorAudio(file, item) {
  if (!file) return;
  if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|aac)$/i.test(file.name)) return editorNotice("Selecione um arquivo de áudio válido.", true);
  if (file.size > 20 * 1024 * 1024) return editorNotice("O arquivo deve ter no máximo 20 MB.", true);
  const previousAudio = item.audio;
  try {
    editorNotice("Carregando áudio...");
    if (window.BandDB?.configured) {
      const uploaded = await BandDB.uploadAudio(file, item.id);
      item.audio = uploaded;
      stagedAudioUploads.push(uploaded.storagePath);
      if (previousAudio?.storagePath) {
        if (stagedAudioUploads.includes(previousAudio.storagePath)) { stagedAudioUploads = stagedAudioUploads.filter(path => path !== previousAudio.storagePath); await cleanupUnusedAudio([previousAudio.storagePath]); }
        else pendingAudioDeletes.push(previousAudio.storagePath);
      }
      if (previousAudio?.audioId) await deleteAudioFile(previousAudio.audioId);
    } else {
      const audioId = previousAudio?.audioId || `audio_${item.id}_${Date.now()}`;
      await saveAudioFile(audioId, file);
      item.audio = { kind:"uploaded", audioId, uploadedName:file.name, mimeType:file.type };
    }
    if (["quiz","audioQuiz"].includes(item.type)) item.type = "audioQuiz";
    persistQuestionBank(); renderEditor(); editorNotice(`Áudio ${file.name} carregado com sucesso.`);
  } catch (error) { console.error("Falha ao carregar áudio", error); item.audio = previousAudio; editorNotice(error.message || "Não foi possível carregar o áudio.", true); }
}

async function removeQuestionAudio(item, rerender = true) {
  const audio = item.audio;
  if (!audio) return;
  try {
    if (audio.storagePath && window.BandDB?.configured) {
      if (stagedAudioUploads.includes(audio.storagePath)) { stagedAudioUploads = stagedAudioUploads.filter(path => path !== audio.storagePath); await cleanupUnusedAudio([audio.storagePath]); }
      else pendingAudioDeletes.push(audio.storagePath);
    }
    if (audio.audioId) await deleteAudioFile(audio.audioId);
    if (item.type === "audioQuiz") item.type = "quiz";
    delete item.audio; persistQuestionBank();
    if (rerender) { renderEditor(); editorNotice("Áudio removido."); }
  } catch (error) { console.error("Falha ao remover áudio", error); editorNotice(error.message || "Não foi possível remover o áudio.", true); }
}
function exportQuestionBank() { downloadBlob(JSON.stringify({ version:1, sections }, null, 2), "banda5_banco_perguntas.json", "application/json;charset=utf-8"); editorNotice("Banco exportado. Os arquivos de áudio permanecem neste navegador."); }
async function importQuestionBank(event) { const file = event.target.files[0]; if (!file) return; try { const data = JSON.parse(await file.text()); const imported = Array.isArray(data) ? data : data.sections; validateQuestionBank(imported); await trackRemovedBankAudio(sections, imported); sections = imported; persistQuestionBank(); openEditor(); editorNotice("Banco de perguntas importado. Revise e publique quando estiver pronto."); } catch (error) { editorNotice(error.message || "Arquivo de banco inválido.", true); } event.target.value = ""; }
async function resetQuestionBank() { if (!confirm("Restaurar todas as perguntas originais? Os áudios carregados deixarão de ser vinculados.")) return; const original = JSON.parse(JSON.stringify(DEFAULT_SECTIONS)); await trackRemovedBankAudio(sections, original); sections = original; persistQuestionBank(); openEditor(); editorNotice("Banco original restaurado."); }
function openAudioDB() { return new Promise((resolve, reject) => { const request = indexedDB.open(AUDIO_DB_NAME, 1); request.onupgradeneeded = () => request.result.createObjectStore("audio"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
async function saveAudioFile(id, blob) { const db = await openAudioDB(); return new Promise((resolve, reject) => { const tx = db.transaction("audio", "readwrite"); tx.objectStore("audio").put(blob, id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); }
async function getAudioFile(id) { const db = await openAudioDB(); return new Promise((resolve, reject) => { const request = db.transaction("audio").objectStore("audio").get(id); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
async function deleteAudioFile(id) { if (!id) return; const db = await openAudioDB(); return new Promise(resolve => { const tx = db.transaction("audio", "readwrite"); tx.objectStore("audio").delete(id); tx.oncomplete = resolve; }); }

async function loadCloudResponses() {
  if (!window.BandDB?.configured) return;
  const button = $("refreshResponsesBtn");
  button.disabled = true; button.textContent = "Atualizando...";
  $("responsesList").innerHTML = '<div class="panel responses-state">Buscando respostas no banco...</div>';
  try { cloudSubmissions = await BandDB.listSubmissions(); renderCloudResponses(); }
  catch (error) { console.error("Falha ao carregar respostas", error); $("responsesSummary").textContent = "Não foi possível carregar os resultados."; $("responsesList").innerHTML = `<div class="panel responses-state error">${escapeHTML(error.message || "Verifique sua conexão e tente novamente.")}</div>`; }
  finally { button.disabled = false; button.textContent = "Atualizar"; }
}

function normalizeSearch(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function statusLabel(status) {
  return ({ new:"Novo", reviewed:"Revisado", archived:"Arquivado" })[status] || "Novo";
}

function formatSubmissionDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não informada" : date.toLocaleString("pt-BR", { dateStyle:"short", timeStyle:"short" });
}

function findQuestionById(id) {
  return getEveryQuestion().find(question => question.id === id);
}

function formatStoredAnswer(id, value) {
  const question = findQuestionById(id);
  if (!question) return String(value ?? "");
  if (["quiz", "audioQuiz"].includes(question.type)) return question.options?.[Number(value)] ?? String(value ?? "");
  if (question.type === "frequency") return question.options?.find(option => Number(option.value) === Number(value))?.label ?? String(value ?? "");
  if (question.type === "scale") return question.scale?.find(option => Number(option.value) === Number(value))?.label ?? String(value ?? "");
  return String(value ?? "");
}

function renderCloudResponses() {
  const host = $("responsesList"), query = normalizeSearch($("responsesSearch").value);
  const filtered = cloudSubmissions.filter(item => normalizeSearch([item.participant_name, item.participant_email, item.instrument, item.status].join(" ")).includes(query));
  const pending = cloudSubmissions.filter(item => item.status === "new").length;
  const reviewed = cloudSubmissions.filter(item => item.status === "reviewed").length;
  $("responsesSummary").textContent = `${cloudSubmissions.length} envio(s) • ${pending} novo(s) • ${reviewed} revisado(s)`;
  $("exportResponsesBtn").disabled = !cloudSubmissions.length;
  if (!filtered.length) { host.innerHTML = `<div class="panel responses-state">${cloudSubmissions.length ? "Nenhum resultado corresponde à busca." : "Nenhuma resposta foi recebida ainda."}</div>`; return; }
  host.innerHTML = "";
  filtered.forEach(submission => {
    const scores = submission.scores || {}, plan = submission.plan || {}, storedAnswers = submission.answers || {}, reviewItems = Array.isArray(submission.review_items) ? submission.review_items : [];
    const snapshot = Array.isArray(submission.answer_snapshot) ? submission.answer_snapshot : [];
    const answerRows = snapshot.length ? snapshot.map(item => `<div class="response-answer"><small>${escapeHTML(item.question || item.id)}</small><div>${escapeHTML(item.answer)}</div></div>`).join("") : Object.entries(storedAnswers).map(([id, value]) => {
      const question = findQuestionById(id);
      return `<div class="response-answer"><small>${escapeHTML(question?.text || id)}</small><div>${escapeHTML(formatStoredAnswer(id, value))}</div></div>`;
    }).join("");
    const card = document.createElement("article"); card.className = `panel response-card status-${submission.status || "new"}`;
    const reviewRows = reviewItems.length ? `<div class="response-review-list"><h4>Pontos para revisar</h4>${reviewItems.map(item => `<div class="response-review-item"><small>${escapeHTML(item.area || "Conteúdo")}</small><strong>${escapeHTML(item.question || "Questão")}</strong><p>Marcou: ${escapeHTML(item.selected || "Não respondida")}<br>Esperada: ${escapeHTML(item.correct || "—")}</p><span>${escapeHTML(item.guidance || "Revisar este conteúdo em uma atividade prática.")}</span></div>`).join("")}</div>` : '<div class="response-review-empty">Nenhuma questão objetiva incorreta.</div>';
    card.innerHTML = `<div class="response-card-head"><div><div class="response-title-row"><h3>${escapeHTML(submission.participant_name || "Participante")}</h3><span class="response-status">${statusLabel(submission.status)}</span></div><p>${escapeHTML(submission.participant_email || "Sem e-mail")} • ${escapeHTML(submission.instrument || "Função não informada")} • ${formatSubmissionDate(submission.created_at)}</p></div><div class="response-score"><strong>${Number(scores.geral ?? 0)}%</strong><span>Índice geral</span></div></div>
      <div class="response-metrics"><span><strong>${Number(scores.demonstrado ?? 0)}%</strong> demonstrado</span><span><strong>${Number(scores.autoavaliacao ?? 0)}%</strong> execução percebida</span><span><strong>${reviewItems.length}</strong> para revisar</span></div>
      <details class="response-details"><summary>Ver respostas e plano individual</summary><div class="response-plan"><div><small>Repertório</small><p>${escapeHTML(plan.repertorio || "Não informado")}</p></div><div><small>Dificuldade</small><p>${escapeHTML(plan.dificuldade || "Não informada")}</p></div><div><small>Meta de 90 dias</small><p>${escapeHTML(plan.meta_90_dias || "Não informada")}</p></div><div><small>Estudo semanal</small><p>${escapeHTML(plan.estudo_semanal || "Não informado")}</p></div></div>${reviewRows}<div class="response-answers">${answerRows}</div></details>
      <div class="response-card-actions"><label>Status<select class="field response-status-select"><option value="new" ${submission.status === "new" ? "selected" : ""}>Novo</option><option value="reviewed" ${submission.status === "reviewed" ? "selected" : ""}>Revisado</option><option value="archived" ${submission.status === "archived" ? "selected" : ""}>Arquivado</option></select></label><button type="button" class="btn btn-danger response-delete">Excluir resultado</button></div>`;
    card.querySelector(".response-status-select").addEventListener("change", async event => {
      const select = event.target, previous = submission.status; select.disabled = true;
      try { await BandDB.updateSubmissionStatus(submission.id, select.value); submission.status = select.value; renderCloudResponses(); }
      catch (error) { select.value = previous; select.disabled = false; editorNotice(error.message || "Não foi possível alterar o status.", true); }
    });
    card.querySelector(".response-delete").addEventListener("click", async event => {
      if (!confirm(`Excluir definitivamente o resultado de ${submission.participant_name || "este participante"}?`)) return;
      event.currentTarget.disabled = true;
      try { await BandDB.deleteSubmission(submission.id); cloudSubmissions = cloudSubmissions.filter(item => item.id !== submission.id); renderCloudResponses(); editorNotice("Resultado excluído."); }
      catch (error) { event.currentTarget.disabled = false; editorNotice(error.message || "Não foi possível excluir o resultado.", true); }
    });
    host.appendChild(card);
  });
}

function exportCloudResponses() {
  if (!cloudSubmissions.length) return editorNotice("Ainda não há respostas para exportar.", true);
  const scoreKeys = ["geral","demonstrado","autoavaliacao","teoria","harmonia","ritmo","percepcao","conjunto","tecnica_especifica","preparo"];
  const header = ["Data","Nome","E-mail","Função","Status",...scoreKeys.map(key => labels[key]),"Repertório","Dificuldade","Meta 90 dias","Estudo semanal"];
  const rows = cloudSubmissions.map(item => [formatSubmissionDate(item.created_at), item.participant_name, item.participant_email || "", item.instrument || "", statusLabel(item.status), ...scoreKeys.map(key => item.scores?.[key] == null ? "" : `${item.scores[key]}%`), item.plan?.repertorio || "", item.plan?.dificuldade || "", item.plan?.meta_90_dias || "", item.plan?.estudo_semanal || ""]);
  const csv = "\uFEFF" + [header, ...rows].map(row => row.map(csvCell).join(";")).join("\n");
  downloadBlob(csv, `banda5_respostas_${new Date().toISOString().slice(0,10)}.csv`, "text/csv;charset=utf-8");
}

function getAllVisibleQuestions() {
  const instrument = answers.instrumento || "Violão";
  return sections.flatMap(section => {
    const list = section.dynamicInstrument ? (section.questionsByInstrument[instrument] || []) : section.questions;
    return list.map(item => ({ ...item, sectionId: section.id, sectionTitle: section.dynamicInstrument ? `${section.title} — ${instrument}` : section.title, kicker: section.kicker }));
  });
}

function startQuiz() {
  answers = {}; currentIndex = 0; submittedProtocol = null; currentSubmissionId = createSubmissionId(); verifiedScores = null; verifiedReviewItems = null; localStorage.removeItem(STORAGE_KEY); visibleQuestions = getAllVisibleQuestions();
  $("submissionStatus").classList.add("hidden"); $("submissionStatus").textContent = "";
  $("submitResultBtn").disabled = false; $("submitResultBtn").textContent = "Enviar respostas ao avaliador";
  welcomeScreen.classList.add("hidden"); resultScreen.classList.add("hidden"); quizScreen.classList.remove("hidden"); renderQuestion();
}

function getSectionSummary() {
  return visibleQuestions.reduce((summary, item, index) => {
    let section = summary.find(entry => entry.id === item.sectionId);
    if (!section) {
      section = { id: item.sectionId, title: item.sectionTitle, total: 0, firstIndex: index };
      summary.push(section);
    }
    section.total++;
    return summary;
  }, []);
}

function renderSectionProgress(item) {
  const summary = getSectionSummary();
  const activeSectionIndex = summary.findIndex(section => section.id === item.sectionId);
  sectionProgress.innerHTML = summary.map((section, index) => {
    const state = index < activeSectionIndex ? "completed" : index === activeSectionIndex ? "active" : "";
    const answered = visibleQuestions.filter(question => question.sectionId === section.id && answers[question.id] !== undefined && answers[question.id] !== "").length;
    return `<div class="section-step ${state}"><span class="section-dot">${index < activeSectionIndex ? "✓" : index + 1}</span><span><strong>${escapeHTML(section.title)}</strong><small>${answered} de ${section.total} questões</small></span></div>`;
  }).join("");
  sectionProgress.querySelector(".section-step.active")?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function renderQuestion() {
  visibleQuestions = getAllVisibleQuestions(); const item = visibleQuestions[currentIndex]; if (!item) return showResults();
  sectionTitle.textContent = item.sectionTitle; sectionKicker.textContent = item.kicker;
  const sectionQuestions = visibleQuestions.filter(question => question.sectionId === item.sectionId);
  const sectionQuestionIndex = sectionQuestions.findIndex(question => question.id === item.id);
  const pct = Math.round(((currentIndex + 1) / visibleQuestions.length) * 100);
  progressText.textContent = `${item.sectionTitle} • ${sectionQuestionIndex + 1} de ${sectionQuestions.length}`;
  progressBar.style.width = `${pct}%`;
  renderSectionProgress(item);
  questionContainer.innerHTML = ""; const card = document.createElement("div"); card.className = "question-card";
  card.innerHTML = `<div class="question-number">Pergunta ${sectionQuestionIndex + 1} de ${sectionQuestions.length} nesta seção</div><div class="question-text">${escapeHTML(item.text)}</div>`;
  if (item.help) card.insertAdjacentHTML("beforeend", `<div class="question-help">${escapeHTML(item.help)}</div>`);
  if (item.audio) card.appendChild(renderAudio(item));
  if (item.type === "scale") { if (!item.help) card.insertAdjacentHTML("beforeend", '<div class="question-help">Avalie o que você consegue demonstrar hoje.</div>'); card.appendChild(renderScale(item)); }
  else if (item.type === "frequency") card.appendChild(renderOptions(item, item.options.map(o => o.label), item.options.map(o => o.value)));
  else if (["single", "quiz", "audioQuiz"].includes(item.type)) { card.appendChild(renderOptions(item, item.options, item.options.map((_, i) => i), item.type === "single")); }
  else if (["text", "email", "number"].includes(item.type)) { const input = document.createElement("input"); input.className = "field"; input.type = item.type; input.placeholder = item.placeholder || ""; input.value = answers[item.id] ?? ""; input.addEventListener("input", e => { answers[item.id] = e.target.value; saveState(); }); card.appendChild(input); setTimeout(() => input.focus(), 50); }
  else if (item.type === "textarea") { const input = document.createElement("textarea"); input.className = "textarea"; input.placeholder = item.placeholder || ""; input.value = answers[item.id] ?? ""; input.addEventListener("input", e => { answers[item.id] = e.target.value; saveState(); }); card.appendChild(input); }
  questionContainer.appendChild(card); backBtn.disabled = currentIndex === 0; nextBtn.textContent = currentIndex === visibleQuestions.length - 1 ? (window.BandDB?.configured ? "Enviar e ver diagnóstico" : "Ver diagnóstico") : "Continuar";
}

function renderAudio(item) {
  const box = document.createElement("div"); box.className = "audio-box";
  const icon = document.createElement("div"); icon.className = "audio-icon"; icon.textContent = "♫";
  const copy = document.createElement("div"); copy.className = "audio-copy";
  const title = document.createElement("strong"); title.textContent = "Exercício de áudio";
  const note = document.createElement("span"); note.textContent = "Use fones de ouvido, se possível."; copy.append(title, note);
  const button = document.createElement("button"); button.type = "button"; button.className = "btn btn-audio"; button.textContent = "▶ Ouvir exercício";
  button.addEventListener("click", async () => { button.disabled = true; button.textContent = "♫ Tocando..."; box.classList.remove("has-error"); box.classList.add("is-playing"); note.textContent = "Áudio em reprodução..."; try { await playExercise(item.audio); button.textContent = "↻ Ouvir novamente"; note.textContent = "Você pode repetir o exercício quantas vezes precisar."; } catch (error) { console.error("Falha ao reproduzir áudio", error); button.textContent = "▶ Tentar novamente"; note.textContent = "Não foi possível tocar. Verifique o volume e tente novamente."; box.classList.add("has-error"); } finally { button.disabled = false; box.classList.remove("is-playing"); } });
  box.append(icon, copy, button); return box;
}

async function playExercise(spec) {
  if (spec.kind === "uploaded") {
    const blob = await getAudioFile(spec.audioId); if (!blob) throw new Error("Arquivo de áudio não encontrado");
    const url = URL.createObjectURL(blob), player = new Audio(url);
    return new Promise((resolve, reject) => { player.onended = () => { URL.revokeObjectURL(url); resolve(); }; player.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Formato de áudio não suportado")); }; player.play().catch(reject); });
  }
  if (spec.kind === "uploadedRemote") {
    if (!spec.url) throw new Error("Endereço do áudio não encontrado");
    const player = new Audio(spec.url);
    player.preload = "auto";
    return new Promise((resolve, reject) => { player.onended = resolve; player.onerror = () => reject(new Error("Não foi possível carregar o áudio online")); player.play().catch(reject); });
  }
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); await audioContext.resume(); const start = audioContext.currentTime + .08;
  const tone = (freq, at, duration) => { const osc = audioContext.createOscillator(), gain = audioContext.createGain(); osc.type = "triangle"; osc.frequency.value = freq; gain.gain.setValueAtTime(0.0001, at); gain.gain.exponentialRampToValueAtTime(.11, at + .025); gain.gain.setValueAtTime(.09, at + duration - .08); gain.gain.exponentialRampToValueAtTime(.0001, at + duration); osc.connect(gain).connect(audioContext.destination); osc.start(at); osc.stop(at + duration + .02); };
  if (spec.kind === "chord") spec.notes.forEach(n => tone(n, start, 1.5));
  if (spec.kind === "melody") spec.notes.forEach((n, i) => tone(n, start + i * .42, .38));
  if (spec.kind === "progression") spec.chords.forEach((chord, i) => chord.forEach(n => tone(n, start + i * .75, .68)));
  const length = spec.kind === "progression" ? spec.chords.length * .75 : spec.kind === "melody" ? spec.notes.length * .42 : 1.5;
  return new Promise(resolve => setTimeout(resolve, length * 1000 + 200));
}

function renderScale(item) { const row = document.createElement("div"); row.className = "scale-row"; item.scale.forEach(opt => { const wrap = document.createElement("div"); wrap.className = "scale-choice"; const input = document.createElement("input"); input.type = "radio"; input.name = item.id; input.id = `${item.id}_${opt.value}`; input.value = opt.value; input.checked = Number(answers[item.id]) === opt.value; input.addEventListener("change", () => { answers[item.id] = opt.value; saveState(); }); const label = document.createElement("label"); label.htmlFor = input.id; label.innerHTML = `<div><strong>${opt.value}</strong><span>${opt.label}</span></div>`; wrap.append(input, label); row.appendChild(wrap); }); return row; }

function renderOptions(item, labels, values, storeLabel = false) { const box = document.createElement("div"); box.className = "options"; labels.forEach((label, i) => { const option = document.createElement("label"); option.className = "option"; const input = document.createElement("input"); input.type = "radio"; input.name = item.id; const value = storeLabel ? label : values[i]; input.value = String(value); input.checked = String(answers[item.id]) === String(value); if (input.checked) option.classList.add("selected"); input.addEventListener("change", () => { answers[item.id] = value; box.querySelectorAll(".option").forEach(el => el.classList.remove("selected")); option.classList.add("selected"); if (item.id === "instrumento") { Object.keys(answers).filter(k => /^(bat|baixo|vio|gui|tec|voc)_/.test(k)).forEach(k => delete answers[k]); visibleQuestions = getAllVisibleQuestions(); } saveState(); }); const span = document.createElement("span"); span.textContent = label; option.append(input, span); box.appendChild(option); }); return box; }

function isAnswered(item) { if (item.required === false) return true; const value = answers[item.id]; if (value === undefined || value === null || String(value).trim() === "") return false; if (item.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()); return true; }
async function goNext() { const item = visibleQuestions[currentIndex]; if (!isAnswered(item)) { document.querySelector(".error-message")?.remove(); questionContainer.insertAdjacentHTML("beforeend", '<div class="error-message">Responda esta pergunta antes de continuar.</div>'); return; } if (currentIndex < visibleQuestions.length - 1) { currentIndex++; saveState(); renderQuestion(); scrollToTop(); } else if (window.BandDB?.configured) await finishCloudDiagnosis(); else showResults(); }
function goBack() { if (currentIndex > 0) { currentIndex--; saveState(); renderQuestion(); scrollToTop(); } }
function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }

function calculateScores() {
  if (verifiedScores) return { ...verifiedScores };
  const buckets = { teoria: [], harmonia: [], ritmo: [], percepcao: [], conjunto: [], preparo: [], tecnica_especifica: [] };
  let objectiveTotal = 0, objectiveCorrect = 0, selfTotal = 0, selfPoints = 0;
  getAllVisibleQuestions().forEach(item => { if (!item.category || answers[item.id] === undefined) return; let score;
    if (item.type === "scale") { score = Number(answers[item.id]) / 4 * 100; selfTotal++; selfPoints += score; }
    else if (item.type === "frequency") { score = Number(answers[item.id]) / 3 * 100; selfTotal++; selfPoints += score; }
    else if (["quiz", "audioQuiz"].includes(item.type)) { score = Number(answers[item.id]) === item.correct ? 100 : 0; objectiveTotal++; objectiveCorrect += score; }
    if (score !== undefined) buckets[item.category].push(score);
  });
  const result = {}; Object.entries(buckets).forEach(([key, values]) => result[key] = values.length ? Math.round(values.reduce((a,b) => a+b,0) / values.length) : null);
  result.demonstrado = objectiveTotal ? Math.round(objectiveCorrect / objectiveTotal) : 0; result.autoavaliacao = selfTotal ? Math.round(selfPoints / selfTotal) : 0;
  result.geral = Math.round(result.demonstrado * .65 + result.autoavaliacao * .35); return result;
}

function getLevel(score) { if (score < 40) return ["Fundamentos", "Priorize pulso, linguagem musical básica e fundamentos técnicos da sua função."]; if (score < 60) return ["Em desenvolvimento", "Você já tem uma base; transforme conhecimento em execução estável e repetível."]; if (score < 80) return ["Consistente", "A base está funcional. Avance em percepção, repertório, refinamento técnico e decisões de arranjo."]; return ["Autônomo", "Você demonstra boa autonomia. Aprofunde musicalidade, versatilidade, liderança e capacidade de orientar outros."]; }
const labels = { geral:"Índice geral", demonstrado:"Conhecimento demonstrado", autoavaliacao:"Execução percebida", teoria:"Teoria", harmonia:"Harmonia", ritmo:"Ritmo", percepcao:"Percepção", conjunto:"Tocar em conjunto", preparo:"Preparo", tecnica_especifica:"Técnica da função" };

const guidanceByCategory = {
  teoria: "Revisar notas, intervalos, escalas e acidentes com exercícios curtos de identificação.",
  harmonia: "Praticar construção de acordes, graus, campo harmônico e transposição usando músicas do repertório.",
  ritmo: "Estudar com metrônomo, contar subdivisões em voz alta e aplicar o exercício lentamente no instrumento.",
  percepcao: "Treinar escuta comparativa de tônicas, intervalos, acordes e progressões em sessões curtas e frequentes.",
  conjunto: "Observar forma, dinâmica, entradas e sinais durante o ensaio, ouvindo conscientemente os demais músicos.",
  tecnica_especifica: "Isolar este fundamento no instrumento ou na voz, praticar lentamente e validar com o líder ou professor."
};

function getMistakes() {
  if (verifiedReviewItems) return verifiedReviewItems.map(item => ({ ...item }));
  return getAllVisibleQuestions()
    .filter(item => ["quiz", "audioQuiz"].includes(item.type) && answers[item.id] !== undefined && Number(answers[item.id]) !== item.correct)
    .map(item => ({
      id: item.id,
      question: item.text,
      category: item.category,
      area: labels[item.category] || item.category,
      selected: item.options[Number(answers[item.id])] ?? "Não respondida",
      correct: item.options[item.correct],
      audio: item.type === "audioQuiz",
      guidance: guidanceByCategory[item.category] || "Revisar este conteúdo e demonstrá-lo novamente em uma atividade prática."
    }));
}

function showResults() { quizScreen.classList.add("hidden"); welcomeScreen.classList.add("hidden"); resultScreen.classList.remove("hidden"); const scores = calculateScores(), level = getLevel(scores.geral);
  $("resultName").textContent = `${answers.nome || "Integrante"}, este é o seu diagnóstico de ${answers.instrumento || "música"}`;
  $("resultIntro").textContent = "O índice combina 65% de respostas objetivas e 35% de autoavaliação. Ele orienta o desenvolvimento; uma observação prática do líder deve complementar o resultado.";
  $("scoreCards").innerHTML = ""; ["geral","demonstrado","autoavaliacao","ritmo","harmonia","percepcao","conjunto","tecnica_especifica","teoria","preparo"].forEach(key => { if (scores[key] == null) return; const card = document.createElement("div"); card.className = "score-card"; card.innerHTML = `<div class="score-label">${labels[key]}</div><div class="score-value">${scores[key]}%</div><div class="score-bar"><span style="width:${scores[key]}%"></span></div>`; $("scoreCards").appendChild(card); });
  $("levelBadge").textContent = level[0]; $("levelDescription").textContent = level[1];
  $("developmentList").innerHTML = ""; Object.entries(scores).filter(([k,v]) => !["geral","demonstrado","autoavaliacao"].includes(k) && v != null).sort((a,b) => a[1]-b[1]).slice(0,3).forEach(([key,value], i) => { const el = document.createElement("div"); el.className = "development-item"; el.innerHTML = `<strong>${i+1}. ${labels[key]}</strong><br><span>${value}% — transforme esta área em uma meta prática para os próximos 90 dias.</span>`; $("developmentList").appendChild(el); });
  const mistakes = getMistakes(); $("mistakesList").innerHTML = "";
  if (!mistakes.length) $("mistakesList").innerHTML = '<div class="empty-success">Nenhuma questão objetiva incorreta. Mantenha a prática e confirme esse resultado em uma execução musical.</div>';
  mistakes.forEach((mistake, i) => { const el = document.createElement("div"); el.className = "mistake-item"; el.innerHTML = `<div class="mistake-top"><span class="mistake-area">${escapeHTML(mistake.area)}</span><span>${mistake.audio ? "Exercício de áudio" : `Questão ${i+1}`}</span></div><div class="mistake-question">${escapeHTML(mistake.question)}</div><div class="mistake-answer">Marcou: <strong>${escapeHTML(mistake.selected)}</strong><br>Resposta esperada: <strong>${escapeHTML(mistake.correct)}</strong></div><div class="mistake-guidance"><strong>Como ajudar:</strong> ${escapeHTML(mistake.guidance)}</div>`; $("mistakesList").appendChild(el); });
  $("personalAnswers").innerHTML = ""; [["E-mail", answers.email],["Função avaliada", answers.instrumento],["Papel vocal", answers.voc_papel],["Referência de repertório",answers.repertorio],["Dificuldade observada",answers.dificuldade],["Meta de 90 dias",answers.meta_90],["Tempo semanal",answers.estudo],["Observação",answers.observacao]].forEach(([label,value]) => { if (!value) return; const el = document.createElement("div"); el.className = "personal-answer"; el.innerHTML = `<small>${label}</small><div>${escapeHTML(String(value))}</div>`; $("personalAnswers").appendChild(el); });
  $("submitResultBtn").classList.toggle("hidden", !window.BandDB?.configured);
  saveState(true); scrollToTop(); }

function escapeHTML(str) { return String(str ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
function saveState(completed=false) { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, currentIndex, completed, savedAt:new Date().toISOString() })); }
function restartQuiz() { if (!confirm("Deseja apagar as respostas e iniciar um novo diagnóstico?")) return; localStorage.removeItem(STORAGE_KEY); answers = {}; currentIndex = 0; submittedProtocol = null; currentSubmissionId = null; verifiedScores = null; verifiedReviewItems = null; $("submissionStatus").classList.add("hidden"); resultScreen.classList.add("hidden"); welcomeScreen.classList.remove("hidden"); scrollToTop(); }
function buildSubmissionPayload() { const normalizedAnswers = { ...answers, nome:String(answers.nome || "").trim(), email:String(answers.email || "").trim(), instrumento:String(answers.instrumento || "").trim() }; return { versao:"3.0", question_bank_revision:cloudBaseRevision, client_submission_id:currentSubmissionId || (currentSubmissionId = createSubmissionId()), participante:{ nome:normalizedAnswers.nome, email:normalizedAnswers.email, idade:answers.idade||"", funcao:normalizedAnswers.instrumento, papel_vocal:answers.voc_papel||"", tempo:answers.tempo_musica||"", formacao:answers.aulas||"" }, plano:{ repertorio:answers.repertorio||"", dificuldade:answers.dificuldade||"", meta_90_dias:answers.meta_90||"", estudo_semanal:answers.estudo||"", observacao:answers.observacao||"" }, respostas:normalizedAnswers }; }
function buildExportPayload() { return { ...buildSubmissionPayload(), pontuacoes:calculateScores(), respostas_para_revisar:getMistakes(), gerado_em:new Date().toISOString() }; }
function safeFilename(name) { return (name||"integrante").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"_").replace(/^_+|_+$/g,"").toLowerCase(); }
function downloadBlob(content, filename, type) { const blob = new Blob([content],{type}), url=URL.createObjectURL(blob), a=document.createElement("a"); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
function csvCell(value) { let safe = String(value ?? ""); if (/^[=+\-@]/.test(safe)) safe = `'${safe}`; return `"${safe.replaceAll('"','""')}"`; }
function downloadJSON() { downloadBlob(JSON.stringify(buildExportPayload(),null,2),`banda5_${safeFilename(answers.nome)}.json`,"application/json;charset=utf-8"); }
function downloadCSV() { const p=buildExportPayload(), rows=[["Campo","Valor"],["Nome",p.participante.nome],["E-mail",p.participante.email],["Função",p.participante.funcao],["Papel vocal",p.participante.papel_vocal],...["geral","demonstrado","autoavaliacao","teoria","harmonia","ritmo","percepcao","conjunto","tecnica_especifica","preparo"].map(k=>[labels[k],p.pontuacoes[k] == null ? "" : `${p.pontuacoes[k]}%`]),["Dificuldade",p.plano.dificuldade],["Meta 90 dias",p.plano.meta_90_dias],["Estudo semanal",p.plano.estudo_semanal]]; const csv="\uFEFF"+rows.map(row=>row.map(csvCell).join(";")).join("\n"); downloadBlob(csv,`banda5_${safeFilename(answers.nome)}.csv`,"text/csv;charset=utf-8"); }

async function submitDiagnosisToCloud() {
  if (!window.BandDB?.configured || submittedProtocol) return;
  const button = $("submitResultBtn"), status = $("submissionStatus");
  button.disabled = true; button.textContent = "Enviando..."; status.className = "submission-status"; status.textContent = "Enviando suas respostas com segurança...";
  try {
    const result = await performCloudSubmission(); showResults(); showSubmissionSuccess(result);
  } catch (error) {
    console.error("Falha ao enviar diagnóstico", error); button.disabled = false; button.textContent = "Tentar enviar novamente"; status.className = "submission-status error"; status.textContent = cloudSubmissionErrorMessage(error);
  }
}

async function performCloudSubmission() {
  const result = await BandDB.submitDiagnosis(buildSubmissionPayload());
  if (!result?.scores) throw new Error("O banco não devolveu a pontuação validada.");
  submittedProtocol = result.id; verifiedScores = result.scores; verifiedReviewItems = Array.isArray(result.review_items) ? result.review_items : [];
  return result;
}

function showSubmissionSuccess(result) {
  const button = $("submitResultBtn"), status = $("submissionStatus");
  button.classList.remove("hidden"); button.disabled = true; button.textContent = "Respostas enviadas"; status.className = "submission-status success";
  status.innerHTML = `Pronto! O avaliador recebeu seu diagnóstico. Protocolo: <strong>${escapeHTML(String(result.id).slice(0, 8).toUpperCase())}</strong>`;
}

function cloudSubmissionErrorMessage(error) {
  return String(error?.message || "").includes("AVALIACAO_ATUALIZADA") ? "A avaliação foi atualizada enquanto você respondia. Reinicie o diagnóstico para usar a versão mais recente." : "Não foi possível enviar agora. Verifique sua internet e tente novamente.";
}

async function finishCloudDiagnosis() {
  nextBtn.disabled = true; backBtn.disabled = true; nextBtn.textContent = "Validando respostas..."; document.querySelector(".error-message")?.remove();
  try { const result = await performCloudSubmission(); showResults(); showSubmissionSuccess(result); }
  catch (error) {
    console.error("Falha ao concluir diagnóstico", error); nextBtn.disabled = false; backBtn.disabled = false; nextBtn.textContent = "Tentar enviar novamente";
    questionContainer.insertAdjacentHTML("beforeend", `<div class="error-message">${escapeHTML(cloudSubmissionErrorMessage(error))}</div>`);
  }
}

function createSubmissionId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16)); bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  return [...bytes].map((byte, index) => `${[4,6,8,10].includes(index) ? "-" : ""}${byte.toString(16).padStart(2,"0")}`).join("");
}

function generateLegacyPDFReport() {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) { alert("O navegador bloqueou a abertura do relatório. Permita pop-ups e tente novamente."); return; }
  const p = buildExportPayload(), scores = p.pontuacoes, level = getLevel(scores.geral);
  const dimensions = ["ritmo","harmonia","percepcao","conjunto","tecnica_especifica","teoria","preparo"]
    .filter(key => scores[key] != null);
  const priorities = dimensions.slice().sort((a,b) => scores[a]-scores[b]).slice(0,3);
  const bars = dimensions.map(key => `<div class="bar-row"><div class="bar-head"><span>${labels[key]}</span><strong>${scores[key]}%</strong></div><div class="track"><i style="width:${scores[key]}%"></i></div></div>`).join("");
  const priorityCards = priorities.map((key,i) => `<div class="priority"><b>0${i+1}</b><div><small>PRIORIDADE</small><h3>${labels[key]}</h3><p>${scores[key]}% - desenvolver com exercício dirigido, repertório e acompanhamento do líder.</p></div></div>`).join("");
  const roleDetail = p.participante.papel_vocal ? `<div><small>PAPEL VOCAL</small><strong>${escapeHTML(p.participante.papel_vocal)}</strong></div>` : "";
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório musical - ${escapeHTML(p.participante.nome)}</title><style>
    @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#e9edf3;color:#162033;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:210mm;min-height:297mm;margin:8mm auto;background:#fff;padding:18mm 17mm 16mm;position:relative;box-shadow:0 8px 35px #20304a25;page-break-after:always}.page:last-child{page-break-after:auto}.brand{display:flex;align-items:center;gap:10px}.logo{width:40px;height:40px;border-radius:12px;background:#78b7ad;color:#10282b;display:grid;place-items:center;font-weight:900;font-size:17px}.brand div strong{display:block;font-size:14px}.brand div span{font-size:9px;color:#69768b;letter-spacing:1.4px}.hero{margin:28mm 0 14mm}.eyebrow{font-size:10px;color:#4f817a;letter-spacing:2px;font-weight:800}.hero h1{font-size:36px;line-height:1.05;letter-spacing:-1.3px;margin:9px 0 10px;max-width:145mm}.hero p{font-size:14px;color:#657187;line-height:1.55;max-width:145mm}.identity{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12mm 0}.identity div,.metric,.panel{border:1px solid #dfe5ed;border-radius:13px;padding:12px;background:#f8fafc}.identity small,.metric small,.priority small,.kicker{display:block;color:#7b8799;font-size:8px;letter-spacing:1.3px;font-weight:800;margin-bottom:5px}.identity strong{font-size:12px}.summary{display:grid;grid-template-columns:52mm 1fr;gap:13mm;align-items:center}.ring{width:50mm;height:50mm;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#78b7ad ${scores.geral}%,#e7ebf1 0);position:relative}.ring:before{content:"";position:absolute;inset:8px;background:#fff;border-radius:50%}.ring div{position:relative;text-align:center}.ring strong{display:block;font-size:30px}.ring span{font-size:9px;color:#718096}.level{background:#1f4246;color:white;border-radius:15px;padding:17px}.level small{color:#b8d8d2;font-size:9px;letter-spacing:1.4px}.level h2{font-size:23px;margin:7px 0}.level p{color:#c8d1df;font-size:11px;line-height:1.5;margin:0}.metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:11mm}.metric strong{font-size:24px}.metric p{font-size:9px;color:#748095;margin:4px 0 0}.footer{position:absolute;left:17mm;right:17mm;bottom:9mm;display:flex;justify-content:space-between;border-top:1px solid #e3e7ee;padding-top:5px;color:#8a94a5;font-size:8px}.section-title{font-size:27px;margin:6px 0 4px;letter-spacing:-.6px}.lead{color:#69768a;font-size:11px;line-height:1.5;margin:0 0 9mm}.chart{padding:5mm;border:1px solid #e0e5ec;border-radius:15px}.bar-row{margin-bottom:13px}.bar-row:last-child{margin:0}.bar-head{display:flex;justify-content:space-between;font-size:10px;margin-bottom:5px}.track{height:8px;background:#edf0f4;border-radius:20px;overflow:hidden}.track i{display:block;height:100%;background:linear-gradient(90deg,#6fa8a1,#b8d8d2);border-radius:20px}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:8mm}.comparison .metric{background:#1f4246;color:#fff}.comparison .metric:nth-child(2){background:#fff;color:#162033}.comparison p{color:#aeb9c9}.comparison .metric:nth-child(2) p{color:#748095}.priorities{display:grid;gap:8px;margin-top:8mm}.priority{display:grid;grid-template-columns:15mm 1fr;gap:8px;padding:11px;border:1px solid #e0e5ec;border-radius:13px}.priority>b{font-size:25px;color:#6fa8a1}.priority h3{font-size:13px;margin:1px 0 4px}.priority p{font-size:9px;color:#69768a;margin:0;line-height:1.4}.plan{margin-top:10mm;background:#edf7f5;border-left:4px solid #78b7ad;border-radius:0 13px 13px 0;padding:13px}.plan h3{font-size:11px;margin:0 0 5px;color:#4f817a}.plan p{font-size:11px;line-height:1.5;margin:0;white-space:pre-wrap}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}.detail{border:1px solid #e0e5ec;border-radius:12px;padding:11px}.detail h3{font-size:9px;color:#7b8799;letter-spacing:1px;margin:0 0 6px}.detail p{font-size:10px;line-height:1.45;margin:0}.note{font-size:9px;color:#7b8799;line-height:1.45;margin-top:10mm;padding-top:6mm;border-top:1px solid #e0e5ec}@media print{body{background:#fff}.page{margin:0;box-shadow:none}}
  </style></head><body>
    <section class="page"><div class="brand"><div class="logo">B5</div><div><strong>BANDA 5</strong><span>DESENVOLVIMENTO MUSICAL</span></div></div><div class="hero"><span class="eyebrow">DIAGNÓSTICO INDIVIDUAL</span><h1>Relatório de desenvolvimento musical</h1><p>Um retrato das competências atuais para orientar estudos, ensaios e acompanhamento individual.</p></div><div class="identity"><div><small>PARTICIPANTE</small><strong>${escapeHTML(p.participante.nome||"Integrante")}</strong></div><div><small>FUNÇÃO AVALIADA</small><strong>${escapeHTML(p.participante.funcao||"-")}</strong></div>${roleDetail || `<div><small>EXPERIÊNCIA</small><strong>${escapeHTML(p.participante.tempo||"-")}</strong></div>`}</div><div class="summary"><div class="ring"><div><strong>${scores.geral}%</strong><span>ÍNDICE GERAL</span></div></div><div class="level"><small>FAIXA DE DESENVOLVIMENTO</small><h2>${level[0]}</h2><p>${level[1]}</p></div></div><div class="metrics"><div class="metric"><small>CONHECIMENTO DEMONSTRADO</small><strong>${scores.demonstrado}%</strong><p>Questões objetivas e exercícios de percepção.</p></div><div class="metric"><small>EXECUÇÃO PERCEBIDA</small><strong>${scores.autoavaliacao}%</strong><p>Autoavaliação técnica e atuação em conjunto.</p></div></div><div class="footer"><span>Banda 5 - Diagnóstico Musical</span><span>1 / 2</span></div></section>
    <section class="page"><span class="kicker">MAPA DE COMPETÊNCIAS</span><h2 class="section-title">Onde concentrar o desenvolvimento</h2><p class="lead">As pontuações ajudam a comparar áreas diferentes. Resultados mais baixos indicam oportunidades de estudo, não aprovação ou reprovação.</p><div class="chart">${bars}</div><div class="comparison"><div class="metric"><small>DEMONSTRADO</small><strong>${scores.demonstrado}%</strong><p>O que apareceu nas respostas objetivas.</p></div><div class="metric"><small>AUTOAVALIAÇÃO</small><strong>${scores.autoavaliacao}%</strong><p>Como o participante percebe sua execução.</p></div></div><div class="priorities">${priorityCards}</div><div class="plan"><h3>META PARA OS PRÓXIMOS 90 DIAS</h3><p>${escapeHTML(p.plano.meta_90_dias||"Meta ainda não informada.")}</p></div><div class="detail-grid"><div class="detail"><h3>DIFICULDADE CONCRETA</h3><p>${escapeHTML(p.plano.dificuldade||"Não informada.")}</p></div><div class="detail"><h3>ROTINA DISPONÍVEL</h3><p>${escapeHTML(p.plano.estudo_semanal||"Não informada.")}</p></div><div class="detail"><h3>REFERÊNCIA DE REPERTÓRIO</h3><p>${escapeHTML(p.plano.repertorio||"Não informada.")}</p></div><div class="detail"><h3>FORMAÇÃO</h3><p>${escapeHTML(p.participante.formacao||"Não informada.")}</p></div></div><p class="note">Este diagnóstico tem finalidade pedagógica. A leitura deve ser complementada por observação prática em ensaio ou audição, considerando precisão, musicalidade, postura de equipe e evolução ao longo do tempo.</p><div class="footer"><span>Emitido em ${escapeHTML(p.gerado_em)}</span><span>2 / 2</span></div></section>
  <script>window.addEventListener("load",()=>setTimeout(()=>window.print(),400));<\/script></body></html>`;
  reportWindow.document.open(); reportWindow.document.write(html); reportWindow.document.close();
}

function scoreColor(value) { if (value < 40) return "#7c9eb2"; if (value < 60) return "#6fa8a1"; if (value < 80) return "#78b7ad"; return "#6ca98c"; }

function generatePDFReport() {
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) { alert("Permita pop-ups para gerar o relatório em PDF."); return; }
  const p = buildExportPayload(), scores = p.pontuacoes, level = getLevel(scores.geral);
  const competencyKeys = ["ritmo","harmonia","percepcao","conjunto","tecnica_especifica","teoria","preparo"].filter(k => scores[k] != null);
  const priorities = competencyKeys.slice().sort((a,b) => scores[a]-scores[b]).slice(0,3);
  const bars = competencyKeys.map(k => `<div class="bar-row"><div class="bar-head"><span>${labels[k]}</span><strong>${scores[k]}%</strong></div><div class="track"><i style="width:${scores[k]}%;background:${scoreColor(scores[k])}"></i></div></div>`).join("");
  const priorityCards = priorities.map((k,i) => `<div class="priority"><b>0${i+1}</b><div><strong>${labels[k]}</strong><p>${scores[k]}% - área prioritária para prática orientada e acompanhamento.</p></div></div>`).join("");
  const personal = [["Referência de repertório",p.plano.repertorio],["Dificuldade observada",p.plano.dificuldade],["Meta para 90 dias",p.plano.meta_90_dias],["Tempo disponível por semana",p.plano.estudo_semanal],["Papel vocal",p.participante.papel_vocal]].filter(([,v])=>v).map(([l,v])=>`<div class="answer"><small>${l}</small><p>${escapeHTML(String(v))}</p></div>`).join("");
  const reviewItems = p.respostas_para_revisar.length ? p.respostas_para_revisar.map((m,i)=>`<div class="review"><div class="review-num">${String(i+1).padStart(2,"0")}</div><div><small>${escapeHTML(m.area)}${m.audio ? " • EXERCÍCIO DE ÁUDIO" : ""}</small><h3>${escapeHTML(m.question)}</h3><p><b>Marcou:</b> ${escapeHTML(m.selected)}<br><b>Resposta esperada:</b> ${escapeHTML(m.correct)}</p><div class="help"><b>Como ajudar:</b> ${escapeHTML(m.guidance)}</div></div></div>`).join("") : '<div class="all-right">Nenhuma questão objetiva incorreta. Confirme o desempenho em uma execução prática.</div>';
  const date = new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });
  reportWindow.document.open();
  reportWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório musical - ${escapeHTML(p.participante.nome)}</title><style>
    @page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;background:#dfe5ec;color:#172033;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:210mm;min-height:297mm;margin:10mm auto;background:#fff;padding:18mm 17mm 15mm;position:relative;page-break-after:always}.page:last-child{page-break-after:auto}.top{display:flex;align-items:center;gap:12px;border-bottom:2px solid #eef1f5;padding-bottom:12px}.logo{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#b8d8d2,#78b7ad);font-size:20px;font-weight:900;color:#10282b}.eyebrow{margin:0 0 3px;color:#4f817a;font-size:9px;font-weight:bold;letter-spacing:1.5px}.top h1{font-size:22px;margin:0}.meta{margin-left:auto;text-align:right;color:#687386;font-size:9px;line-height:1.5}.hero{display:grid;grid-template-columns:1fr 58mm;gap:14mm;padding:18mm 0 12mm}.hero h2{font-size:30px;line-height:1.05;margin:0 0 8px}.hero p{color:#687386;line-height:1.55;margin:0}.tags{display:flex;gap:6px;margin-top:13px;flex-wrap:wrap}.tag{font-size:9px;border-radius:99px;padding:5px 8px;background:#f3f5f8;color:#475369}.donut{width:52mm;height:52mm;border-radius:50%;display:grid;place-items:center;background:conic-gradient(${scoreColor(scores.geral)} ${scores.geral}%,#edf0f4 0);position:relative}.donut:after{content:"";position:absolute;width:37mm;height:37mm;border-radius:50%;background:white}.donut div{z-index:1;text-align:center}.donut strong{display:block;font-size:26px}.donut span{font-size:9px;color:#687386}.section-title{font-size:16px;margin:11mm 0 6mm;display:flex;align-items:center;gap:8px}.section-title:before{content:"";width:4px;height:19px;border-radius:4px;background:#78b7ad}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.metric{border:1px solid #e7ebf0;border-radius:10px;padding:10px}.metric small{display:block;color:#788396;font-size:8px;text-transform:uppercase;letter-spacing:.7px}.metric strong{font-size:18px;display:block;margin-top:4px}.bar-row{margin-bottom:8px}.bar-head{display:flex;justify-content:space-between;font-size:10px;margin-bottom:4px}.track{height:7px;background:#edf0f4;border-radius:9px;overflow:hidden}.track i{height:100%;display:block;border-radius:9px}.note{margin-top:10mm;padding:10px 12px;background:#edf7f5;border-left:4px solid #78b7ad;border-radius:4px;font-size:9px;line-height:1.5;color:#365d59}.priorities{display:grid;gap:8px}.priority{display:flex;gap:12px;border:1px solid #e7ebf0;border-radius:10px;padding:11px}.priority>b{font-size:18px;color:#6fa8a1}.priority strong{font-size:11px}.priority p{margin:4px 0 0;color:#687386;font-size:9px}.answers{display:grid;grid-template-columns:1fr 1fr;gap:8px}.answer{padding:10px;border-radius:9px;background:#f6f8fa;min-height:18mm}.answer small{font-size:8px;color:#788396;text-transform:uppercase;letter-spacing:.6px}.answer p{font-size:10px;line-height:1.45;margin:5px 0 0}.plan{display:grid;grid-template-columns:12mm 1fr;gap:10px;padding:12px;border-radius:10px;background:#1f4246;color:white}.plan b{font-size:23px;color:#b8d8d2}.plan small{color:#aab5c6;font-size:8px;text-transform:uppercase}.plan p{font-size:11px;line-height:1.5;margin:4px 0 0}.footer{position:absolute;bottom:8mm;left:17mm;right:17mm;display:flex;justify-content:space-between;border-top:1px solid #e7ebf0;padding-top:5px;color:#8b95a5;font-size:8px}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:20mm;margin-top:20mm}.signature{border-top:1px solid #8d96a5;text-align:center;padding-top:5px;font-size:9px;color:#687386}.reviews{display:grid;gap:7px}.review{display:grid;grid-template-columns:11mm 1fr;gap:9px;border:1px solid #dce8e5;border-radius:9px;padding:9px;break-inside:avoid}.review-num{font-size:15px;font-weight:bold;color:#6fa8a1}.review small{font-size:7px;color:#4f817a;font-weight:bold;letter-spacing:.6px}.review h3{font-size:10px;line-height:1.3;margin:3px 0 5px}.review p{font-size:8px;line-height:1.4;margin:0}.help{margin-top:5px;padding:6px;background:#edf7f5;border-radius:5px;color:#365d59;font-size:8px;line-height:1.4}.all-right{padding:14px;background:#e8f5ef;color:#336b58;border-radius:9px;font-size:10px}@media print{body{background:white}.page{margin:0;box-shadow:none}}
  </style></head><body>
  <section class="page"><header class="top"><div class="logo">B5</div><div><p class="eyebrow">BANDA 5 • DESENVOLVIMENTO MUSICAL</p><h1>Relatório de diagnóstico musical</h1></div><div class="meta">Emitido em ${date}<br>Relatório individual</div></header>
  <div class="hero"><div><p class="eyebrow">PARTICIPANTE</p><h2>${escapeHTML(p.participante.nome || "Integrante")}</h2><p>Diagnóstico direcionado para <strong>${escapeHTML(p.participante.funcao || "função musical")}</strong>. Este documento transforma os resultados em prioridades claras de desenvolvimento.</p><div class="tags"><span class="tag">${escapeHTML(p.participante.tempo || "Tempo não informado")}</span><span class="tag">${escapeHTML(p.participante.formacao || "Formação não informada")}</span></div></div><div class="donut"><div><strong>${scores.geral}%</strong><span>ÍNDICE GERAL</span></div></div></div>
  <div class="summary"><div class="metric"><small>Conhecimento demonstrado</small><strong>${scores.demonstrado}%</strong></div><div class="metric"><small>Execução percebida</small><strong>${scores.autoavaliacao}%</strong></div><div class="metric"><small>Faixa atual</small><strong style="font-size:14px">${level[0]}</strong></div></div>
  <h3 class="section-title">Mapa de competências</h3>${bars}<div class="note"><strong>Como ler:</strong> o índice geral combina 65% de questões objetivas e auditivas com 35% de autoavaliação. Ele não aprova nem reprova; serve para direcionar estudo e acompanhamento.</div><footer class="footer"><span>Banda 5 • Crescer juntos, tocar melhor e servir com propósito.</span><span>1 / 3</span></footer></section>
  <section class="page"><header class="top"><div class="logo">B5</div><div><p class="eyebrow">PLANO INDIVIDUAL</p><h1>Desenvolvimento musical</h1></div><div class="meta">${escapeHTML(p.participante.nome || "Integrante")}<br>${escapeHTML(p.participante.funcao || "")}</div></header>
  <h3 class="section-title">Três prioridades</h3><div class="priorities">${priorityCards}</div><h3 class="section-title">Contexto do integrante</h3><div class="answers">${personal}</div><h3 class="section-title">Meta central</h3><div class="plan"><b>90</b><div><small>Objetivo para os próximos dias</small><p>${escapeHTML(p.plano.meta_90_dias || "Definir uma meta prática com o líder musical.")}</p></div></div>
  <div class="signatures"><div class="signature">Integrante</div><div class="signature">Líder / avaliador</div></div><div class="note"><strong>Recomendação:</strong> complementar este diagnóstico com uma observação prática em ensaio ou execução de repertório. Reaplicar após 90 dias para comparar evolução.</div><footer class="footer"><span>Documento pedagógico • Uso interno da equipe</span><span>2 / 3</span></footer></section>
  <section class="page"><header class="top"><div class="logo">B5</div><div><p class="eyebrow">ACOMPANHAMENTO PEDAGÓGICO</p><h1>Respostas para revisar</h1></div><div class="meta">${escapeHTML(p.participante.nome || "Integrante")}<br>${p.respostas_para_revisar.length} ponto(s) identificado(s)</div></header><p class="note"><strong>Objetivo:</strong> mostrar exatamente onde o músico precisa de ajuda. Esta lista considera somente questões objetivas e exercícios de áudio; autoavaliações não são classificadas como erro.</p><div class="reviews">${reviewItems}</div><footer class="footer"><span>Use esta página para planejar exercícios e acompanhamento.</span><span>3 / 3</span></footer></section>
  <script>window.addEventListener("load",()=>setTimeout(()=>window.print(),800));<\/script></body></html>`);
  reportWindow.document.close();
}
