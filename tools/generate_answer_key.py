from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak,
    KeepTogether, Table, TableStyle
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "gabarito_banda5_portugues_corrigido_v2.pdf"

COMMON = [
    ("Questões Gerais", [
        ("Qual par está separado por um semitom natural?", "E-F", "Entre E-F e B-C existe um semitom sem alteração."),
        ("Em 4/4, quantas pulsações de semínima completam um compasso?", "4", "O numerador indica quatro tempos; a semínima é a unidade de tempo."),
        ("Em um arranjo, dinâmica é principalmente:", "A variação de intensidade", "Dinâmica trata das variações de intensidade e energia musical."),
    ]),
    ("Harmonia", [
        ("Na tonalidade de G maior, qual é a tônica?", "G", "A tônica é a nota que dá nome à tonalidade."),
        ("Qual sequência pertence inteiramente ao campo harmônico de C maior?", "C-Dm-Em-F", "São os graus I, ii, iii e IV de C maior."),
        ("Em C maior, a progressão G-Am-F-C corresponde a quais graus?", "V-vi-IV-I", "G, Am, F e C ocupam esses graus no campo harmônico."),
        ("Ao transpor C-G-Am-F para o tom de D, qual sequência resulta?", "D-A-Bm-G", "Mantém-se a relação I-V-vi-IV no novo tom."),
        ("Como se constrói uma tríade maior a partir da tônica?", "Tônica, 3ª maior e 5ª justa", "Fórmula intervalar: 1-3-5."),
        ("Qual alteração transforma uma tríade maior em menor?", "Baixar a terça meio tom", "A fórmula passa de 1-3-5 para 1-b3-5."),
    ]),
    ("Escalas e Intervalos", [
        ("Qual é a sequência de tons (T) e semitons (S) da escala maior?", "T-T-S-T-T-T-S", "Esse padrão gera qualquer escala maior a partir da tônica."),
        ("De C até E encontramos qual intervalo?", "3ª maior", "C-D-E abrange três nomes de nota e quatro semitons."),
        ("Quantos semitons formam uma quinta justa?", "7", "Exemplo: de C até G há sete semitons."),
        ("Qual nota recebe sustenido na escala de G maior?", "F", "G maior possui uma alteração: F#."),
    ]),
    ("Percepção Musical", [
        ("Ouça a escala e identifique a nota de repouso (tônica).", "C", "A frase parte de C, percorre C maior e retorna a C."),
        ("O acorde que você ouve é maior ou menor?", "Menor", "As frequências correspondem a A-C-E, uma tríade de A menor."),
        ("Qual intervalo melódico você ouve?", "5ª justa", "As notas tocadas são C e G."),
        ("Qual progressão em C maior foi tocada?", "I-V-vi-IV-I", "A sequência é C-G-Am-F-C."),
    ]),
]

INSTRUMENTS = {
    "Bateria": [
        ("Em 4/4, quantas colcheias há em um compasso completo?", "8", "Cada tempo comporta duas colcheias."),
        ("Uma virada musicalmente segura deve priorizar:", "Tempo, fraseado e retorno ao groove", "A virada deve servir à forma e retornar com precisão."),
    ],
    "Baixo - Divisão de Vozes": [
        ("Em um acorde de C maior, qual nota do baixo cria a primeira inversão?", "E", "A primeira inversão coloca a terça no baixo: C/E."),
        ("Para ligar C a Am com menor movimento, qual nota comum pode ser sustentada?", "C", "C pertence tanto a C maior quanto a A menor."),
    ],
    "Baixo - Avaliação Específica": [
        ("Se a tônica é G, qual é sua quinta justa?", "D", "D está sete semitons acima de G."),
        ("Na progressão C-Am-F-G, quais tônicas formam a linha básica?", "C-A-F-G", "A linha básica acompanha as fundamentais dos acordes."),
    ],
    "Violão - Divisão de Vozes": [
        ("Quais intervalos formam o acorde maior em qualquer região do braço?", "1-3-5", "Tônica, terça maior e quinta justa."),
        ("Ao dividir vozes com teclado, quais notas definem melhor a qualidade maior ou menor do acorde?", "Terça e sétima", "A terça define maior/menor; em acordes de sétima, ambas são vozes-guia."),
        ("Para não competir com um teclado na região média, uma boa escolha é:", "Usar outra região e voicing mais enxuto", "Separar regiões e reduzir dobramentos melhora a clareza."),
    ],
    "Violão - Avaliação Específica": [
        ("Com formas de G e capotraste na 2ª casa, o acorde soa como:", "A", "O capotraste eleva a forma de G em dois semitons."),
        ("Quais notas formam o acorde de D maior?", "D-F#-A", "Fórmula 1-3-5 aplicada a D."),
    ],
    "Guitarra - Divisão de Vozes": [
        ("Quais intervalos formam uma tríade menor?", "1-b3-5", "Tônica, terça menor e quinta justa."),
        ("Em acordes com sétima, quais vozes normalmente revelam melhor a função harmônica?", "Terça e sétima", "São as vozes-guia e caracterizam a qualidade do acorde."),
        ("Se teclado e violão já preenchem o acorde, a guitarra pode contribuir melhor com:", "Tríades em outra região ou linhas complementares", "A escolha evita excesso de dobramento e disputa de frequências."),
    ],
    "Guitarra - Avaliação Específica": [
        ("Quais notas formam a pentatônica menor de A?", "A-C-D-E-G", "Fórmula: 1-b3-4-5-b7."),
        ("Um power chord de G é formado principalmente por:", "G-D", "Power chord usa fundamental e quinta justa, podendo dobrar a oitava."),
    ],
    "Teclado - Divisão de Vozes": [
        ("Quais notas formam Dm7?", "D-F-A-C", "Fórmula 1-b3-5-b7."),
        ("Em um voicing aberto, as notas do acorde são:", "Distribuídas com maior espaço entre as vozes", "Uma ou mais vozes são deslocadas de oitava."),
        ("Na condução de vozes, o objetivo principal é:", "Manter notas comuns e mover as demais pelo caminho mais curto", "Isso cria ligações suaves e economia de movimento."),
    ],
    "Teclado - Avaliação Específica": [
        ("Quais notas formam a tríade de E maior?", "E-G#-B", "Fórmula 1-3-5 aplicada a E."),
        ("A primeira inversão de C maior é:", "E-G-C", "A terça do acorde ocupa a voz mais grave."),
    ],
    "Vocal": [
        ("Uma segunda voz em terça acima de C canta qual nota (em C maior)?", "E", "Contando C-D-E, chega-se à terça diatônica."),
        ("Se uma música força notas agudas e gera tensão, a primeira ação é:", "Pedir avaliação do tom e ajustar", "O tom deve respeitar a extensão e a saúde vocal."),
    ],
}


def register_fonts():
    # As fontes PDF padrao usam WinAnsiEncoding e dispensam arquivos de fonte
    # incorporados. Isso evita incompatibilidade com leitores que interpretam
    # incorretamente subconjuntos TrueType e preserva o portugues (acentos e cedilha).
    return "Helvetica", "Helvetica-Bold"


REGULAR, BOLD = register_fonts()
TEAL = colors.HexColor("#4F817A")
DARK = colors.HexColor("#203B3D")
MUTED = colors.HexColor("#617B7C")
PALE = colors.HexColor("#EDF7F5")
BORDER = colors.HexColor("#D7E7E3")


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(TEAL)
    canvas.roundRect(17 * mm, height - 19 * mm, 10 * mm, 10 * mm, 2.5 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont(BOLD, 9)
    canvas.drawCentredString(22 * mm, height - 15.5 * mm, "B5")
    canvas.setFillColor(DARK)
    canvas.setFont(BOLD, 9)
    canvas.drawString(31 * mm, height - 13.5 * mm, "BANDA 5 - GABARITO DO DIAGNOSTICO MUSICAL")
    canvas.setFillColor(MUTED)
    canvas.setFont(REGULAR, 7)
    canvas.drawString(31 * mm, height - 17 * mm, "Material de apoio interno - respostas objetivas")
    canvas.setStrokeColor(BORDER)
    canvas.line(17 * mm, 15 * mm, width - 17 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont(REGULAR, 7)
    canvas.drawString(17 * mm, 10.5 * mm, "Banda 5 - uso do avaliador")
    canvas.drawRightString(width - 17 * mm, 10.5 * mm, f"Pagina {doc.page}")
    canvas.restoreState()


def styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("Title", parent=base["Title"], fontName=BOLD, fontSize=25, leading=29, textColor=DARK, alignment=TA_CENTER, spaceAfter=5 * mm),
        "subtitle": ParagraphStyle("Subtitle", parent=base["BodyText"], fontName=REGULAR, fontSize=10, leading=15, textColor=MUTED, alignment=TA_CENTER),
        "h1": ParagraphStyle("H1", parent=base["Heading1"], fontName=BOLD, fontSize=17, leading=21, textColor=DARK, spaceBefore=2 * mm, spaceAfter=4 * mm),
        "h2": ParagraphStyle("H2", parent=base["Heading2"], fontName=BOLD, fontSize=12, leading=15, textColor=TEAL, spaceBefore=3 * mm, spaceAfter=2.5 * mm),
        "q": ParagraphStyle("Q", parent=base["BodyText"], fontName=BOLD, fontSize=9, leading=12, textColor=DARK),
        "answer": ParagraphStyle("Answer", parent=base["BodyText"], fontName=BOLD, fontSize=9, leading=12, textColor=TEAL),
        "why": ParagraphStyle("Why", parent=base["BodyText"], fontName=REGULAR, fontSize=8.2, leading=11.5, textColor=DARK),
        "note": ParagraphStyle("Note", parent=base["BodyText"], fontName=REGULAR, fontSize=9, leading=13, textColor=DARK),
    }


def answer_card(number, question, answer, explanation, st):
    rows = [
        [Paragraph(f"{number:02d}", st["answer"]), Paragraph(question, st["q"])],
        ["", Paragraph(f"<b>Resposta:</b> {answer}", st["answer"])],
        ["", Paragraph(f"<b>Explicação da resposta:</b> {explanation}", st["why"])],
    ]
    table = Table(rows, colWidths=[11 * mm, 150 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), PALE),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("LINEBELOW", (1, 0), (1, 0), 0.4, BORDER),
        ("BACKGROUND", (1, 2), (1, 2), colors.HexColor("#F7FBFA")),
        ("SPAN", (0, 0), (0, -1)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return KeepTogether([table, Spacer(1, 2.2 * mm)])


def add_sections(story, sections, st, start=1):
    number = start
    for heading, items in sections:
        story.append(Paragraph(heading, st["h2"]))
        for question, answer, explanation in items:
            story.append(answer_card(number, question, answer, explanation, st))
            number += 1
    return number


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    st = styles()
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=17 * mm, rightMargin=17 * mm, topMargin=26 * mm, bottomMargin=20 * mm,
                          title="Gabarito do Diagnostico Musical - Banda 5", author="Banda 5")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="answer-key", frames=[frame], onPage=header_footer)])

    story = [Spacer(1, 27 * mm), Paragraph("Gabarito do<br/>Diagnóstico Musical", st["title"]),
             Paragraph("Respostas de referência para revisar, acrescentar ou retirar questões do teste.", st["subtitle"]),
             Spacer(1, 15 * mm)]
    note = Table([[Paragraph("<b>Como usar</b><br/>Este documento contempla somente perguntas com resposta objetiva. Itens de perfil, frequência e autoavaliação não possuem gabarito, pois dependem da experiência e da demonstração de cada participante.", st["note"]) ]], colWidths=[155 * mm])
    note.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), PALE), ("BOX", (0, 0), (-1, -1), 0.8, BORDER), ("LEFTPADDING", (0, 0), (-1, -1), 13), ("RIGHTPADDING", (0, 0), (-1, -1), 13), ("TOPPADDING", (0, 0), (-1, -1), 12), ("BOTTOMPADDING", (0, 0), (-1, -1), 12)]))
    structure = KeepTogether([Paragraph("Estrutura", st["h2"]),
                  Paragraph("Parte 1 - Questões comuns: gerais, harmonia, escalas, intervalos e percepção.<br/>Parte 2 - Questões específicas: bateria, baixo, violão, guitarra, teclado e vocal.", st["note"])])
    story.extend([note, Spacer(1, 8 * mm), structure,
                  PageBreak(), Paragraph("Parte 1 - Questões comuns", st["h1"])])
    add_sections(story, COMMON, st)

    story.extend([Spacer(1, 5 * mm), Paragraph("Parte 2 - Questões por instrumento", st["h1"]),
                  Paragraph("A numeração reinicia em cada bloco para facilitar a comparação com a avaliação específica.", st["note"]), Spacer(1, 3 * mm)])
    for heading, items in INSTRUMENTS.items():
        story.append(Paragraph(heading, st["h2"]))
        for number, (question, answer, explanation) in enumerate(items, 1):
            story.append(answer_card(number, question, answer, explanation, st))

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
