"""
Crispy Branding Policy 2026 — Document Generator
BEAU agent · 2026-05-16
"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import copy
import os

# ─── Paths ────────────────────────────────────────────────────────────────────
LOGO_DIR = r"C:\Users\user\Documents\CRISPY\_Brand Assets\Current\Logos\NEW"
OUT_PATH = r"C:\Users\user\Documents\CRISPY\_Brand Assets\Current\Documents\Crispy_Branding_Policy_2026.docx"

BANNER_CREME = os.path.join(LOGO_DIR, "Crispy - Banner - Creme.png")
LOGO_NAME_CREME = os.path.join(LOGO_DIR, "Crispy - Logo-Name - Creme.png")

# ─── Brand Colors ──────────────────────────────────────────────────────────────
NAVY     = RGBColor(0x1B, 0x3A, 0x6B)
ORANGE   = RGBColor(0xE0, 0x75, 0x40)
OFF_WHITE = RGBColor(0xF8, 0xF7, 0xF4)
L_GRAY   = RGBColor(0xE0, 0xDD, 0xD8)
CHARCOAL = RGBColor(0x2C, 0x2C, 0x2C)
WHITE    = RGBColor(0xFF, 0xFF, 0xFF)

# ─── Helpers ──────────────────────────────────────────────────────────────────

def set_cell_bg(cell, hex_color: str):
    """Set table cell background colour."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def set_run_font(run, name="Montserrat", size=11, bold=False, italic=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = color


def add_heading(doc, text, level=1, color=NAVY, font="Montserrat", size=None, italic=False, space_before=18, space_after=6):
    """Add a styled heading paragraph."""
    sizes = {1: 26, 2: 18, 3: 13}
    sz = size or sizes.get(level, 12)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    run = p.add_run(text)
    set_run_font(run, name=font, size=sz, bold=(level <= 2), italic=italic, color=color)
    return p


def add_body(doc, text, color=CHARCOAL, size=11, italic=False, space_before=2, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    run = p.add_run(text)
    set_run_font(run, name="Montserrat", size=size, italic=italic, color=color)
    return p


def add_bullet(doc, text, color=CHARCOAL, size=11):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    set_run_font(run, name="Montserrat", size=size, color=color)
    return p


def add_divider(doc):
    """Add a navy horizontal rule."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "1B3A6B")
    pBdr.append(bottom)
    pPr.append(pBdr)
    return p


def simple_table(doc, headers, rows, header_bg="1B3A6B", header_fg=WHITE, col_widths=None):
    """Create a styled table."""
    num_cols = len(headers)
    table = doc.add_table(rows=1 + len(rows), cols=num_cols)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT

    # Header row
    hdr = table.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        set_cell_bg(cell, header_bg)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(h)
        set_run_font(run, size=10, bold=True, color=header_fg)

    # Data rows
    for ri, row_data in enumerate(rows):
        row = table.rows[ri + 1]
        bg = "FFFFFF" if ri % 2 == 0 else "F8F7F4"
        for ci, cell_text in enumerate(row_data):
            cell = row.cells[ci]
            set_cell_bg(cell, bg)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(str(cell_text))
            set_run_font(run, size=10, color=CHARCOAL)

    # Set column widths if provided
    if col_widths:
        for i, w in enumerate(col_widths):
            for row in table.rows:
                row.cells[i].width = Cm(w)

    return table


# ─── Build Document ────────────────────────────────────────────────────────────

doc = Document()

# Page margins
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.8)
    section.right_margin = Cm(2.8)

# ══════════════════════════════════════════════════════════
# COVER PAGE
# ══════════════════════════════════════════════════════════

# Logo banner at top
try:
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_logo.paragraph_format.space_before = Pt(0)
    p_logo.paragraph_format.space_after = Pt(16)
    run_logo = p_logo.add_run()
    run_logo.add_picture(BANNER_CREME, width=Inches(3.8))
except Exception as e:
    print(f"Warning: could not embed banner logo: {e}")

# Title
p_title = doc.add_paragraph()
p_title.paragraph_format.space_before = Pt(24)
p_title.paragraph_format.space_after = Pt(6)
run_title = p_title.add_run("Crispy Branding Policy")
set_run_font(run_title, name="Montserrat", size=32, bold=True, color=NAVY)

# Subtitle
p_sub = doc.add_paragraph()
p_sub.paragraph_format.space_before = Pt(0)
p_sub.paragraph_format.space_after = Pt(4)
run_sub = p_sub.add_run("Canonical Brand Reference — Version 2026")
set_run_font(run_sub, name="Montserrat", size=14, color=ORANGE)

# Tagline (accent font)
p_tag = doc.add_paragraph()
p_tag.paragraph_format.space_before = Pt(4)
p_tag.paragraph_format.space_after = Pt(20)
run_tag = p_tag.add_run('"Raising leaders who cross cultures."')
set_run_font(run_tag, name="Cormorant Garamond", size=18, italic=True, color=NAVY)

# Meta
p_meta = doc.add_paragraph()
run_meta = p_meta.add_run("Issued: May 2026  |  Maintained by: BEAU (Brand Agent)  |  Applies to: All Crispy agents and collaborators")
set_run_font(run_meta, name="Montserrat", size=9, color=RGBColor(0x88, 0x88, 0x88))

add_divider(doc)

# Scope note
p_scope = doc.add_paragraph()
p_scope.paragraph_format.space_before = Pt(8)
p_scope.paragraph_format.space_after = Pt(8)
run_scope = p_scope.add_run(
    "This document is the canonical brand reference for Crispy Development and the Crispy Leaders platform. "
    "All agents, collaborators, and designers must follow these guidelines for every branded touchpoint. "
    "JATI and Runhaar Upsidedown are separate brands with their own guidelines — do not apply these rules to those identities."
)
set_run_font(run_scope, name="Montserrat", size=10, italic=True, color=CHARCOAL)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 1 — BRAND ARCHITECTURE
# ══════════════════════════════════════════════════════════

add_heading(doc, "1. Brand Architecture", level=1)
add_divider(doc)

add_body(doc,
    "Crispy operates under two names that serve distinct but related purposes. "
    "Understanding the difference is essential — using the wrong name or identity in the wrong context undermines brand clarity.",
    space_before=8, space_after=8
)

add_heading(doc, "Crispy Development — The Company", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "The legal and organisational entity.")
add_bullet(doc, "Used in: formal documents, contracts, invoices, letterhead, email signatures, partnership materials, company introductions.")
add_bullet(doc, "Always uses the full logo including the company name (Banner or Logo-Name variants).")
add_bullet(doc, "Domain: crispydevelopment.com (legacy/formal). Primary active platform: crispyleaders.com.")
add_bullet(doc, 'When writing: "Crispy Development" — always two words, always capitalised.')

add_heading(doc, "Crispy Leaders — The Platform", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "The platform, resource hub, and community where leaders engage.")
add_bullet(doc, "Used in: website navigation, app contexts, platform UI, push notifications, social media, content.")
add_bullet(doc, "Uses the icon/mark only (Logo or Logo Icon variants) — no wordmark required in platform contexts.")
add_bullet(doc, "Domain: crispyleaders.com — this is the primary public-facing site. Follow its design patterns.")
add_bullet(doc, 'When writing: "Crispy Leaders" — always two words, always capitalised.')

add_heading(doc, "Key Rule", level=3, color=ORANGE, space_before=10, space_after=4)
add_body(doc,
    "Never mix the two identities. Do not put the Crispy Development wordmark on platform UI, "
    "and do not represent Crispy Leaders with company-level formal materials. "
    "Old crispydevelopment.com branding is obsolete — ignore it entirely. "
    "All current design decisions follow crispyleaders.com only.",
    space_before=4, space_after=8
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 2 — VISION, MISSION & PURPOSE
# ══════════════════════════════════════════════════════════

add_heading(doc, "2. Vision, Mission & Purpose", level=1)
add_divider(doc)

add_heading(doc, "Vision Statement", level=2, color=NAVY, space_before=12, space_after=6)

# Pull-quote style vision block
p_vision = doc.add_paragraph()
p_vision.paragraph_format.space_before = Pt(8)
p_vision.paragraph_format.space_after = Pt(8)
p_vision.paragraph_format.left_indent = Cm(1.2)
run_v = p_vision.add_run(
    "We believe that the most complex challenges in cross-cultural ministry don't need to stay complex. "
    "Crispy exists to take the hard-won wisdom of the field, strip it down to what actually works, "
    "and put it into the hands of Christian leaders who are doing the work — "
    "through practical tools, honest community, and resources built for the real world, not the seminar room."
)
set_run_font(run_v, name="Cormorant Garamond", size=14, italic=True, color=NAVY)

add_heading(doc, "Tagline", level=2, color=NAVY, space_before=12, space_after=4)
p_tl = doc.add_paragraph()
run_tl = p_tl.add_run('"Raising leaders who cross cultures."')
set_run_font(run_tl, name="Cormorant Garamond", size=16, italic=True, color=ORANGE)
add_body(doc,
    "This is the ONE official tagline. Do not paraphrase, modify, or substitute it. "
    "It applies to both Crispy Development and the Crispy Leaders platform.",
    size=10, space_before=4, space_after=8
)

add_heading(doc, "Brand Purpose", level=2, color=NAVY, space_before=12, space_after=4)
add_body(doc,
    "Crispy exists at the intersection of faith, leadership, and cultural complexity. "
    "We are not a training organisation producing certificates. We are not a content mill. "
    "We are a trusted resource for Christian leaders working across cultures — "
    "people who need practical wisdom, not more theory.",
    space_before=4, space_after=6
)
add_bullet(doc, "We make complexity accessible — not by dumbing it down, but by cutting through the noise.")
add_bullet(doc, "We serve cross-cultural workers with tools that actually work in the field.")
add_bullet(doc, "We root everything in Kingdom purpose — not market trends or platform metrics.")
add_bullet(doc, "We build community, not just content.")

add_heading(doc, "What Crispy Is Not", level=3, color=ORANGE, space_before=10, space_after=4)
add_bullet(doc, "Not a seminary or formal training programme.")
add_bullet(doc, "Not a Western-centric resource dressed up in global language.")
add_bullet(doc, "Not a coaching brand built around a personality.")
add_bullet(doc, "Not a content platform optimising for virality.")

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 3 — LOGO SYSTEM
# ══════════════════════════════════════════════════════════

add_heading(doc, "3. Logo System", level=1)
add_divider(doc)

add_heading(doc, "Naming Convention", level=2, color=NAVY, space_before=12, space_after=4)
p_conv = doc.add_paragraph()
run_conv = p_conv.add_run("[Brand] - [Type] - [Background].png")
set_run_font(run_conv, name="Montserrat", size=12, bold=True, color=NAVY)
add_body(doc, "Example: Crispy - Banner - Transp..png", size=10, space_before=2, space_after=8)

add_heading(doc, "Logo Types", level=2, color=NAVY, space_before=10, space_after=6)
simple_table(doc,
    headers=["Type", "Description", "When to Use"],
    rows=[
        ["Banner",      "Horizontal — icon + wordmark side by side",         "Email headers, presentations, printed materials, anywhere the full Crispy Development identity is needed"],
        ["Logo",        "Full compass mark only, square format",              "Website nav, app icon backgrounds, general brand representation for the Crispy Leaders platform"],
        ["Logo Icon",   "Compact ROUND shape — simplified mark",             "App icons, favicons, push notification badges, profile pictures, small badge contexts (round crop required)"],
        ["Logo-Name",   "Icon + 'Crispy Development' name stacked",          "Formal documents, letterhead, email signatures, company-level materials"],
    ],
    col_widths=[3.0, 5.5, 7.5]
)

add_heading(doc, "Background Variants", level=2, color=NAVY, space_before=14, space_after=6)
simple_table(doc,
    headers=["Variant", "When to Use"],
    rows=[
        ["Blue",   "Use on dark or navy backgrounds — logo renders in light colours for contrast"],
        ["Creme",  "Use on light, cream, or off-white backgrounds"],
        ["Transp.", "Transparent background — most versatile, use on any solid background. Default choice when unsure."],
    ],
    col_widths=[3.0, 13.0]
)

add_heading(doc, "Available Files", level=2, color=NAVY, space_before=14, space_after=4)
add_body(doc,
    "Location: C:\\Users\\user\\Documents\\CRISPY\\_Brand Assets\\Current\\Logos\\NEW\\",
    size=10, space_before=2, space_after=6
)
file_rows = [
    ["Crispy - Banner - Blue.png",      "Banner",     "Blue",   "Email headers on dark/navy backgrounds"],
    ["Crispy - Banner - Creme.png",     "Banner",     "Creme",  "Documents, presentations with white/cream backgrounds"],
    ["Crispy - Banner - Transp..png",   "Banner",     "Transp.", "Versatile — any background"],
    ["Crispy - Logo - Creme.png",       "Logo",       "Creme",  "Website, app, light backgrounds"],
    ["Crispy - Logo - Transp..png",     "Logo",       "Transp.", "Website nav, general platform use"],
    ["Crispy - Logo Icon - Blue.png",   "Logo Icon",  "Blue",   "App icon, badges, dark backgrounds (round crop)"],
    ["Crispy - Logo Icon - Transp..png","Logo Icon",  "Transp.", "Favicon, push notifications, light backgrounds (round crop)"],
    ["Crispy - Logo-Name - Creme.png",  "Logo-Name",  "Creme",  "Letterhead, formal documents"],
    ["Crispy - Logo-Name - Transp..png","Logo-Name",  "Transp.", "Email signatures, versatile company-level use"],
]
simple_table(doc,
    headers=["Filename", "Type", "Background", "Primary Use"],
    rows=file_rows,
    col_widths=[5.5, 2.5, 2.5, 5.5]
)

add_heading(doc, "Logo Rules — Non-Negotiable", level=2, color=NAVY, space_before=14, space_after=4)
add_bullet(doc, "Never alter, stretch, recolour, rotate, or add effects to any logo file.")
add_bullet(doc, "Never recreate the logo from scratch — always use an approved file from the canonical folder.")
add_bullet(doc, "Minimum size: 80px on screen, 2cm in print. Never go smaller.")
add_bullet(doc, "Clear space: on all four sides, maintain space equal to the height of the letter 'C' in CRISPY.")
add_bullet(doc, "Only place logos on white, off-white, or navy backgrounds — unless using the Transp. variant.")
add_bullet(doc, "Never place any logo on a busy image or textured background without the Transp. variant.")
add_bullet(doc, "The Logo Icon MUST be used in round crop contexts (app icons, badges, profile pictures).")

add_heading(doc, "Logo in Documents (This Policy)", level=3, color=ORANGE, space_before=10, space_after=4)

try:
    p_doclogo = doc.add_paragraph()
    p_doclogo.paragraph_format.space_before = Pt(4)
    p_doclogo.paragraph_format.space_after = Pt(4)
    run_dl = p_doclogo.add_run()
    run_dl.add_picture(LOGO_NAME_CREME, width=Inches(1.6))
except Exception as e:
    print(f"Warning: could not embed logo-name: {e}")
    add_body(doc, "[Crispy - Logo-Name - Creme.png]", size=10)

add_body(doc,
    "Use Crispy - Logo-Name - Creme.png in document headers (top-left) and formal materials. "
    "Use Crispy - Banner - Creme.png for wide header blocks and presentations.",
    size=10, space_before=4, space_after=8
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 4 — COLOR PALETTE
# ══════════════════════════════════════════════════════════

add_heading(doc, "4. Color Palette", level=1)
add_divider(doc)

add_body(doc,
    "Five colours. No exceptions, no additions, no substitutions without brand approval. "
    "Each colour has a defined role — use them consistently across all touchpoints.",
    space_before=8, space_after=8
)

simple_table(doc,
    headers=["Name", "Hex", "RGB", "OKLCH (web)", "Use"],
    rows=[
        ["Navy",       "#1B3A6B", "27, 58, 107",   "oklch(22% 0.10 260)",  "Primary brand colour — headers, nav, key text, logo background"],
        ["Orange",     "#E07540", "224, 117, 64",   "oklch(65% 0.15 45)",   "Accent & energy — CTAs, highlights, icons, active states"],
        ["Off-White",  "#F8F7F4", "248, 247, 244",  "oklch(96% 0.005 80)",  "Page backgrounds, document backgrounds"],
        ["Light Gray", "#E0DDD8", "224, 221, 216",  "oklch(88% 0.008 80)",  "Dividers, borders, subtle UI elements, table stripes"],
        ["Charcoal",   "#2C2C2C", "44, 44, 44",     "oklch(18% 0.000 0)",   "Body text — all running text on white/off-white backgrounds"],
    ],
    col_widths=[2.8, 2.2, 3.0, 3.8, 4.2]
)

add_heading(doc, "Colour Usage Rules", level=2, color=NAVY, space_before=14, space_after=4)
add_bullet(doc, "Navy is always primary — it anchors the brand. When in doubt, Navy.")
add_bullet(doc, "Orange is always secondary — use to draw attention, not to decorate.")
add_bullet(doc, "Off-White is the default background — warmer than pure white, softer on screen.")
add_bullet(doc, "Light Gray is structural — use for dividers, table stripes, disabled states. Never for text.")
add_bullet(doc, "Charcoal is for all body text — never pure black (#000000) on digital surfaces.")
add_bullet(doc, "Do not introduce additional colours without BEAU approval.")
add_bullet(doc, "Never use Navy text on Orange, or Orange text on Navy — contrast is poor at small sizes.")

add_heading(doc, "Web/Code Usage", level=3, color=ORANGE, space_before=10, space_after=4)
add_body(doc,
    "Use OKLCH values in CSS for precise colour rendering in modern browsers. "
    "Use hex values as fallback for email clients, PDF exports, and legacy contexts.",
    size=10, space_before=4, space_after=8
)

p_code = doc.add_paragraph()
p_code.paragraph_format.space_before = Pt(4)
p_code.paragraph_format.space_after = Pt(8)
p_code.paragraph_format.left_indent = Cm(1.2)
code_text = (
    "--color-navy:      oklch(22% 0.10 260);   /* #1B3A6B */\n"
    "--color-orange:    oklch(65% 0.15 45);    /* #E07540 */\n"
    "--color-off-white: oklch(96% 0.005 80);   /* #F8F7F4 */\n"
    "--color-light-gray:oklch(88% 0.008 80);   /* #E0DDD8 */\n"
    "--color-charcoal:  oklch(18% 0.000 0);    /* #2C2C2C */"
)
run_code = p_code.add_run(code_text)
set_run_font(run_code, name="Courier New", size=9, color=NAVY)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 5 — TYPOGRAPHY
# ══════════════════════════════════════════════════════════

add_heading(doc, "5. Typography", level=1)
add_divider(doc)

add_body(doc,
    "Two typefaces. Both available free from Google Fonts. "
    "Montserrat carries the brand's clarity and confidence. Cormorant Garamond carries its warmth and depth. "
    "Together they reflect who Crispy is: sharp and thoughtful.",
    space_before=8, space_after=8
)

add_heading(doc, "Primary — Montserrat", level=2, color=NAVY, space_before=12, space_after=6)
add_body(doc, "Google Fonts: fonts.google.com/specimen/Montserrat", size=10, space_before=2, space_after=6)

simple_table(doc,
    headers=["Weight", "Name", "Use"],
    rows=[
        ["800", "ExtraBold", "Headlines, logo wordmark, bold display text"],
        ["600", "SemiBold",  "Subheadings (H2, H3), navigation, labels, button text"],
        ["400", "Regular",   "All body text — paragraphs, descriptions, UI copy"],
        ["300", "Light",     "Captions, metadata labels, secondary descriptors"],
    ],
    col_widths=[2.0, 3.0, 11.0]
)

add_body(doc,
    "Use Montserrat for: logo, headers, navigation, buttons, form labels, all UI text.",
    size=10, space_before=6, space_after=8
)

add_heading(doc, "Accent — Cormorant Garamond", level=2, color=NAVY, space_before=12, space_after=6)
add_body(doc, "Google Fonts: fonts.google.com/specimen/Cormorant+Garamond", size=10, space_before=2, space_after=6)

simple_table(doc,
    headers=["Weight/Style", "Use"],
    rows=[
        ["Italic (600)",  "Pull quotes, taglines, H1 display headlines"],
        ["Light (300)",   "Secondary taglines, chapter openers, decorative section headers"],
    ],
    col_widths=[4.0, 12.0]
)

add_body(doc,
    "Use Cormorant Garamond for: pull quotes, taglines, H1 headings, section openers, decorative text.\n"
    "NEVER use Cormorant Garamond as body text — it is an accent typeface only.",
    size=10, space_before=6, space_after=8
)

add_heading(doc, "Type Hierarchy", level=2, color=NAVY, space_before=12, space_after=6)

simple_table(doc,
    headers=["Level", "Font", "Weight/Style", "Size", "Notes"],
    rows=[
        ["H1",    "Cormorant Garamond", "Italic 600",  "clamp(40px, 6vw, 72px)", "Display headlines, hero sections"],
        ["H2",    "Montserrat",         "SemiBold 600","28–36px",                "Section headers"],
        ["H3",    "Montserrat",         "SemiBold 600","20–24px",                "Sub-section, card titles"],
        ["Body",  "Montserrat",         "Regular 400", "16–18px",                "All running text. Colour: Charcoal #2C2C2C"],
        ["Label", "Montserrat",         "Light 300 or SemiBold 600 (small)", "11–13px", "With generous letter-spacing. Never Regular at small sizes."],
        ["Quote", "Cormorant Garamond", "Italic",      "20–26px",                "Pull quotes, testimonials, scripture references"],
    ],
    col_widths=[2.0, 4.5, 3.5, 4.0, 2.0]
)

add_heading(doc, "Typography Rules", level=3, color=ORANGE, space_before=12, space_after=4)
add_bullet(doc, "Never mix more than two typefaces on any one material.")
add_bullet(doc, "Never use Cormorant Garamond for body text or UI copy.")
add_bullet(doc, "Never use system fonts (Arial, Helvetica, Times New Roman) in brand materials.")
add_bullet(doc, "Line height for body text: 1.6–1.7. Line height for headlines: 1.05–1.15.")
add_bullet(doc, "Letter spacing: tight for headlines (-0.02em), slightly open for labels (+0.05em).")

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 6 — BRAND VOICE & TONE
# ══════════════════════════════════════════════════════════

add_heading(doc, "6. Brand Voice & Tone", level=1)
add_divider(doc)

add_body(doc,
    "The Crispy voice is the most important and least visible part of the brand. "
    "It is how every piece of writing — from a button label to a 2,000-word article — sounds when someone reads it. "
    "Get the voice wrong and even beautiful design feels off.",
    space_before=8, space_after=8
)

add_heading(doc, "The Voice in Four Words", level=2, color=NAVY, space_before=12, space_after=6)

simple_table(doc,
    headers=["Word", "What It Means", "What It Is Not"],
    rows=[
        ["Warm",     "Speaks like a trusted friend who happens to be an expert. Human, not corporate.",              "Sentimental, informal, or casual to the point of losing credibility."],
        ["Sharp",    "Gets to the point. Cuts through noise. Has a clear position and holds it.",                    "Blunt, harsh, or needlessly provocative."],
        ["Grounded", "Rooted in faith and practice. Earned through real field experience, not theory.",              "Preachy, jargon-heavy, or overly spiritual to the point of vagueness."],
        ["Global",   "Written for leaders everywhere — not just the Western church or Western leadership models.",   "Tokenistic. Not a translated Western approach with diverse stock photos."],
    ],
    col_widths=[2.5, 7.0, 6.5]
)

add_heading(doc, "Voice in Practice", level=2, color=NAVY, space_before=14, space_after=6)

simple_table(doc,
    headers=["Write This", "Not This"],
    rows=[
        ["'Cross-cultural workers' or 'field leaders'", "'Missionaries' — this word is off-limits in all Crispy content"],
        ["'Leaders who cross cultures'",                "'Global mission workers' — too formal and distant"],
        ["Direct, active sentences",                    "Passive constructions that hedge and qualify everything"],
        ["'Here is what works.'",                       "'We believe that it may be possible that...'"],
        ["One idea per paragraph",                      "Dense blocks of text with three ideas merged together"],
        ["Faith woven in naturally",                    "A devotional paragraph dropped into a practical article"],
    ],
    col_widths=[8.0, 8.0]
)

add_heading(doc, "Hard Rules", level=2, color=NAVY, space_before=14, space_after=4)
add_bullet(doc, 'Never use the word "missionaries" — use "cross-cultural workers" or "field leaders".')
add_bullet(doc, "Never use em dashes (—) in content writing. Use commas, colons, or rewrite the sentence.")
add_bullet(doc, "No coaching clichés: 'unlock your potential', 'level up', 'transform', 'journey', etc.")
add_bullet(doc, "No buzzwords: 'synergy', 'ecosystem', 'leverage', 'best-in-class', 'world-class'.")
add_bullet(doc, "No overly churchy language: 'anointed', 'move of God', 'prophetic edge', etc.")
add_bullet(doc, "No passive voice as a default — be direct and confident.")
add_bullet(doc, "No Western-centric assumptions — write for Penang as naturally as for Pittsburgh.")

add_heading(doc, "Tone Adjustments by Context", level=2, color=NAVY, space_before=12, space_after=6)

simple_table(doc,
    headers=["Context", "Tone Adjustment"],
    rows=[
        ["Website homepage",     "Confident, welcoming, clear. Minimal text. Big ideas simply stated."],
        ["Resource article",     "Expert but accessible. Like a well-written field report, not an academic paper."],
        ["Email newsletter",     "Personal, direct, warm. Chris writes these — his voice leads, not the brand's."],
        ["Social media",         "Sharp and brief. One idea. One insight. Conversational but never flippant."],
        ["Formal documents",     "Professional and precise. No slang, but still warm. Clear structure."],
        ["Push notifications",   "Ultra-brief. Action-oriented. Specific. Never clickbait."],
    ],
    col_widths=[4.0, 12.0]
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 7 — IMAGERY GUIDELINES
# ══════════════════════════════════════════════════════════

add_heading(doc, "7. Imagery Guidelines", level=1)
add_divider(doc)

add_body(doc,
    "Imagery reinforces the brand's warmth, global identity, and sense of purpose. "
    "The wrong image — even with perfect typography and colour — can undo the brand instantly.",
    space_before=8, space_after=8
)

add_heading(doc, "General Style", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Warm and grounded — avoid cold corporate stock photo aesthetics.")
add_bullet(doc, "Professional enough to attract leaders, human enough to feel real.")
add_bullet(doc, "Scenes that feel lived-in: leadership in multicultural settings, collaborative study, reflection, prayer.")
add_bullet(doc, "Natural light preferred. Avoid harsh studio lighting.")
add_bullet(doc, "Earthy tones that complement the brand palette — navy, warm orange, natural textures.")

add_heading(doc, "AI-Generated Imagery", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "AI-generated images are acceptable for Crispy brand use.")
add_bullet(doc, "Minimise faces in generated images wherever possible — use hands, objects, settings, backs of heads.")
add_bullet(doc, "When faces are needed: diverse, non-Western representation is strongly preferred.")
add_bullet(doc, "Avoid AI 'sameness' — generic poses, plastic lighting, overly perfect settings.")
add_bullet(doc, "All generated images must be reviewed against brand fit before use.")

add_heading(doc, "Subject Matter — Good Contexts", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Leadership in multicultural settings — meetings, conversations, shared work.")
add_bullet(doc, "Reflection and study — books, notebooks, people in thought.")
add_bullet(doc, "Prayer and quiet moments — hands, bowed heads, stillness.")
add_bullet(doc, "Collaboration across cultures — people from different backgrounds working together.")
add_bullet(doc, "Maps, compasses, navigation imagery — connects to the brand icon's meaning.")
add_bullet(doc, "Textures and objects: worn leather, open books, light through windows, coffee, stone.")

add_heading(doc, "What to Avoid", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Stock photo smiles — posed, artificial, too corporate.")
add_bullet(doc, "Crowds at conferences with name badges — too generic Christian conference.")
add_bullet(doc, "Western leadership contexts presented as universal (boardrooms, Silicon Valley vibes).")
add_bullet(doc, "Overly polished, filtered, or artificially colour-graded images.")
add_bullet(doc, "AI images with obvious AI artefacts — check carefully before use.")

add_heading(doc, "Image Storage", level=2, color=NAVY, space_before=12, space_after=4)
add_body(doc,
    r"Save all generated and approved brand images to:",
    size=10, space_before=4, space_after=2
)
add_body(doc,
    "C:\\Users\\user\\Documents\\CRISPY\\_Brand Assets\\Current\\Images\\Photo Stock\\",
    size=10, italic=True, space_before=2, space_after=8
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 8 — AGENT-SPECIFIC RULES
# ══════════════════════════════════════════════════════════

add_heading(doc, "8. Agent-Specific Rules", level=1)
add_divider(doc)

p_agent_note = doc.add_paragraph()
p_agent_note.paragraph_format.space_before = Pt(6)
p_agent_note.paragraph_format.space_after = Pt(8)
run_an = p_agent_note.add_run(
    "This section is written specifically for AI agents working on Crispy. "
    "These are not suggestions — they are operational rules. Violating them produces work that must be redone."
)
set_run_font(run_an, name="Montserrat", size=10, italic=True, color=CHARCOAL)

add_heading(doc, "Before Starting Any Brand Task", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Always read this policy document before producing any Crispy-branded output.")
add_bullet(doc, "Always read BEAU's memory file: agents/memory/beau_memory.md")
add_bullet(doc, "Always use approved logo files — never recreate logos from scratch.")
add_bullet(doc, "When in doubt about brand fit: consult BEAU or EDEN.")

add_heading(doc, "Mandatory Web Design Sequence", level=2, color=NAVY, space_before=12, space_after=6)

simple_table(doc,
    headers=["Step", "Skill", "Purpose"],
    rows=[
        ["1", "/shape",               "Plan UX/UI structure before writing any code. No shortcuts."],
        ["2", "/design-taste-frontend","Apply premium design principles. Kill generic AI aesthetics."],
        ["3", "/impeccable",          "Build production-grade, non-generic interfaces."],
        ["4", "/critique",            "Ruthless review: UX, hierarchy, emotional resonance, brand fit."],
        ["5", "/polish",              "Final quality pass before handover."],
    ],
    col_widths=[1.2, 4.0, 10.8]
)

add_body(doc,
    "Skipping any step = reject the output. No exceptions. Always run all five in order.",
    size=10, space_before=6, space_after=8
)

add_heading(doc, "Hard Technical Rules", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Canva is BANNED. It produces generic AI output unfit for professional brand work. Use Figma or handcrafted components.")
add_bullet(doc, "/impeccable MUST run before any SVG, illustration, or visual component is shipped.")
add_bullet(doc, "Never place a logo on a busy image or coloured background without using the Transp. variant.")
add_bullet(doc, "Never use stick figures, basic geometric shapes, or placeholder graphics in production.")
add_bullet(doc, "All design decisions must have a reason — no arbitrary choices.")
add_bullet(doc, "For technical diagrams and system visualisations: invoke /fireworks-tech-graph.")

add_heading(doc, "Content Rules", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Never say 'missionaries'. Write 'cross-cultural workers' or 'field leaders'.")
add_bullet(doc, "Never use em dashes in content writing.")
add_bullet(doc, "Match the brand voice (Section 6) on every piece of copy — including microcopy, button text, and labels.")
add_bullet(doc, "All content must be reviewed by BEAU before publication.")

add_heading(doc, "Logo Selection Quick Reference", level=2, color=NAVY, space_before=12, space_after=6)

simple_table(doc,
    headers=["Context", "Correct Logo File"],
    rows=[
        ["Email header (formal company)",    "Crispy - Banner - Creme.png"],
        ["Website navigation",               "Crispy - Logo - Transp..png"],
        ["App icon / favicon",               "Crispy - Logo Icon - Transp..png (round crop)"],
        ["Push notification badge",          "Crispy - Logo Icon - Blue.png or Transp. (round)"],
        ["Formal document header",           "Crispy - Logo-Name - Creme.png"],
        ["Email signature",                  "Crispy - Logo-Name - Transp..png"],
        ["Presentation cover (dark bg)",     "Crispy - Banner - Blue.png"],
        ["Presentation cover (light bg)",    "Crispy - Banner - Creme.png"],
        ["Social media profile (round)",     "Crispy - Logo Icon - Blue.png (round crop)"],
    ],
    col_widths=[7.0, 9.0]
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════
# SECTION 9 — SCOPE & MAINTENANCE
# ══════════════════════════════════════════════════════════

add_heading(doc, "9. Scope & Maintenance", level=1)
add_divider(doc)

add_heading(doc, "What This Document Covers", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "Crispy Development (company identity)")
add_bullet(doc, "Crispy Leaders (platform identity)")
add_bullet(doc, "crispyleaders.com and all associated digital touchpoints")

add_heading(doc, "What This Document Does Not Cover", level=2, color=NAVY, space_before=12, space_after=4)
add_bullet(doc, "JATI (Yayasan Jala Transformasi Indonesia) — separate brand, separate guidelines")
add_bullet(doc, "Runhaar Upsidedown — separate personal brand")
add_bullet(doc, "Doa Sejati — separate product with its own identity")
add_bullet(doc, "WayPoint — separate product brand, logo set pending from Chris")

add_heading(doc, "Document Maintenance", level=2, color=NAVY, space_before=12, space_after=4)
add_body(doc,
    "BEAU owns this document. All updates must be reviewed by BEAU and approved by Chris before being applied.",
    space_before=4, space_after=4
)
add_bullet(doc, "Version control: filename includes year (e.g., Crispy_Branding_Policy_2026.docx)")
add_bullet(doc, "Update trigger: new logo set, colour change, typography change, new platform, major brand decision")
add_bullet(doc, "After any update: log change in agents/agent_training_log.md, update beau_memory.md")
add_bullet(doc, "Chris's approval required for any changes to Section 2 (Vision), Section 4 (Colours), or Section 5 (Typography)")

add_heading(doc, "Questions & Escalation", level=2, color=NAVY, space_before=12, space_after=4)
add_body(doc,
    "If any agent is unsure about a brand decision not covered by this document:",
    space_before=4, space_after=4
)
add_bullet(doc, "First: re-read Section 6 (Brand Voice) and Section 8 (Agent Rules).")
add_bullet(doc, "Second: consult BEAU's current memory file for any recent decisions not yet in this document.")
add_bullet(doc, "Third: if still uncertain on Kingdom alignment or ethics, consult EDEN.")
add_bullet(doc, "Fourth: flag to Yada and ask Chris via Telegram — do not guess and ship.")

add_divider(doc)

# Footer block
p_footer = doc.add_paragraph()
p_footer.paragraph_format.space_before = Pt(16)
p_footer.paragraph_format.space_after = Pt(4)
run_footer = p_footer.add_run("Crispy Development  |  Crispy Branding Policy 2026  |  crispyleaders.com")
set_run_font(run_footer, name="Montserrat", size=9, color=RGBColor(0xAA, 0xAA, 0xAA))

p_footer2 = doc.add_paragraph()
run_footer2 = p_footer2.add_run(
    "This document is maintained by BEAU (Brand Agent). Last reviewed: May 2026. "
    "For questions contact Chris via Telegram."
)
set_run_font(run_footer2, name="Montserrat", size=8, italic=True, color=RGBColor(0xBB, 0xBB, 0xBB))

# ─── Save ─────────────────────────────────────────────────────────────────────
doc.save(OUT_PATH)
print(f"SUCCESS: Saved to {OUT_PATH}")
