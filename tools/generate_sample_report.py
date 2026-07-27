from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth

OUT = Path(__file__).resolve().parents[1] / "output" / "pdf" / "modelo_relatorio_banda5.pdf"
W, H = A4
NAVY = colors.HexColor("#1F4246")
GOLD = colors.HexColor("#78B7AD")
MUTED = colors.HexColor("#718096")
PALE = colors.HexColor("#F6F8FB")
BORDER = colors.HexColor("#DFE5ED")
scores = {"Ritmo": 68, "Harmonia": 55, "Percepcao": 47, "Tocar em conjunto": 79, "Tecnica da funcao": 63, "Teoria": 71, "Preparo": 84}

def rounded(c, x, y, w, h, fill, stroke=BORDER, radius=10):
    c.setFillColor(fill); c.setStrokeColor(stroke); c.roundRect(x, y, w, h, radius, fill=1, stroke=1)

def footer(c, page):
    c.setStrokeColor(BORDER); c.line(48, 31, W-48, 31)
    c.setFont("Helvetica", 7); c.setFillColor(MUTED)
    c.drawString(48, 19, "Banda 5 - Diagnostico Musical")
    c.drawRightString(W-48, 19, f"{page} / 2")

def brand(c):
    rounded(c, 48, H-74, 36, 36, GOLD, GOLD, 9)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 15); c.drawCentredString(66, H-62, "B5")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 10); c.drawString(94, H-51, "BANDA 5")
    c.setFillColor(MUTED); c.setFont("Helvetica", 6); c.drawString(94, H-63, "DESENVOLVIMENTO MUSICAL")

def metric(c, x, y, title, value, dark=False):
    fill = NAVY if dark else PALE; rounded(c, x, y, 231, 65, fill, NAVY if dark else BORDER)
    c.setFillColor(GOLD if dark else MUTED); c.setFont("Helvetica-Bold", 6); c.drawString(x+13, y+46, title)
    c.setFillColor(colors.white if dark else NAVY); c.setFont("Helvetica-Bold", 22); c.drawString(x+13, y+18, value)

c = canvas.Canvas(str(OUT), pagesize=A4)
c.setTitle("Modelo de Relatorio Musical - Banda 5")

brand(c)
c.setFillColor(colors.HexColor("#B57A00")); c.setFont("Helvetica-Bold", 7); c.drawString(48, H-174, "DIAGNOSTICO INDIVIDUAL")
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 30); c.drawString(48, H-210, "Relatorio de")
c.drawString(48, H-243, "desenvolvimento musical")
c.setFillColor(MUTED); c.setFont("Helvetica", 10); c.drawString(48, H-269, "Um retrato das competencias atuais para orientar estudos e ensaios.")

for i, (title, val) in enumerate([("PARTICIPANTE", "Maria Oliveira"), ("FUNCAO AVALIADA", "Vocal"), ("PAPEL VOCAL", "Voz principal")]):
    x = 48 + i*166; rounded(c, x, H-355, 154, 58, PALE)
    c.setFillColor(MUTED); c.setFont("Helvetica-Bold", 6); c.drawString(x+10, H-318, title)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 9); c.drawString(x+10, H-339, val)

cx, cy, r = 104, H-467, 54
c.setLineWidth(11); c.setStrokeColor(colors.HexColor("#E7EBF1")); c.circle(cx, cy, r, stroke=1, fill=0)
c.setStrokeColor(GOLD); c.setLineCap(1); c.arc(cx-r, cy-r, cx+r, cy+r, 90, -238)
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 27); c.drawCentredString(cx, cy-7, "66%")
c.setFillColor(MUTED); c.setFont("Helvetica", 6); c.drawCentredString(cx, cy-23, "INDICE GERAL")

rounded(c, 185, H-523, 362, 112, NAVY, NAVY, 12)
c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 7); c.drawString(203, H-439, "FAIXA DE DESENVOLVIMENTO")
c.setFillColor(colors.white); c.setFont("Helvetica-Bold", 20); c.drawString(203, H-468, "Consistente")
c.setFillColor(colors.HexColor("#C8D1DF")); c.setFont("Helvetica", 8)
c.drawString(203, H-489, "A base esta funcional. Avance em percepcao,")
c.drawString(203, H-501, "repertorio, refinamento tecnico e decisoes de arranjo.")
metric(c, 48, H-622, "CONHECIMENTO DEMONSTRADO", "61%", True)
metric(c, 316, H-622, "EXECUCAO PERCEBIDA", "74%", False)
footer(c, 1); c.showPage()

brand(c)
c.setFillColor(colors.HexColor("#B57A00")); c.setFont("Helvetica-Bold", 7); c.drawString(48, H-118, "MAPA DE COMPETENCIAS")
c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 23); c.drawString(48, H-148, "Onde concentrar o desenvolvimento")
c.setFillColor(MUTED); c.setFont("Helvetica", 8); c.drawString(48, H-167, "Resultados mais baixos indicam oportunidades de estudo, nao aprovacao ou reprovacao.")

rounded(c, 48, H-424, W-96, 230, colors.white)
y = H-227
for label, value in scores.items():
    c.setFillColor(NAVY); c.setFont("Helvetica", 8); c.drawString(62, y, label)
    c.setFont("Helvetica-Bold", 8); c.drawRightString(W-62, y, f"{value}%")
    c.setStrokeColor(colors.HexColor("#EDF0F4")); c.setLineWidth(7); c.setLineCap(1); c.line(62, y-10, W-62, y-10)
    c.setStrokeColor(GOLD); c.line(62, y-10, 62+(W-124)*value/100, y-10)
    y -= 28

metric(c, 48, H-514, "CONHECIMENTO DEMONSTRADO", "61%", True)
metric(c, 316, H-514, "EXECUCAO PERCEBIDA", "74%", False)

for i, (label, value) in enumerate(sorted(scores.items(), key=lambda x:x[1])[:3]):
    y = H-588-i*56; rounded(c, 48, y, W-96, 45, PALE)
    c.setFillColor(GOLD); c.setFont("Helvetica-Bold", 18); c.drawString(61, y+14, f"0{i+1}")
    c.setFillColor(MUTED); c.setFont("Helvetica-Bold", 6); c.drawString(105, y+28, "PRIORIDADE")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 10); c.drawString(105, y+12, f"{label} - {value}%")

rounded(c, 48, 76, W-96, 69, colors.HexColor("#FFF7E6"), GOLD, 8)
c.setFillColor(colors.HexColor("#936200")); c.setFont("Helvetica-Bold", 7); c.drawString(62, 126, "META PARA OS PROXIMOS 90 DIAS")
c.setFillColor(NAVY); c.setFont("Helvetica", 8); c.drawString(62, 106, "Sustentar a segunda voz no repertorio atual e reconhecer os graus I, IV, V e vi")
c.drawString(62, 94, "em tres tonalidades, estudando duas sessoes de 30 minutos por semana.")
footer(c, 2); c.save()
print(OUT)
