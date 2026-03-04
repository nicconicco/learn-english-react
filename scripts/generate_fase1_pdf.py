#!/usr/bin/env python3
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Tuple


def _escape_text(s: str) -> str:
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


@dataclass
class PdfObject:
    data: bytes


class PdfBuilder:
    def __init__(self) -> None:
        self._objects: List[PdfObject] = []

    def add(self, data: str | bytes) -> int:
        if isinstance(data, str):
            data_b = data.encode("utf-8")
        else:
            data_b = data
        self._objects.append(PdfObject(data=data_b))
        return len(self._objects)

    def build(self, root_obj_num: int) -> bytes:
        out = bytearray()
        out += b"%PDF-1.4\n%\xff\xff\xff\xff\n"

        offsets: List[int] = [0]
        for i, obj in enumerate(self._objects, start=1):
            offsets.append(len(out))
            out += f"{i} 0 obj\n".encode("ascii")
            out += obj.data
            if not obj.data.endswith(b"\n"):
                out += b"\n"
            out += b"endobj\n"

        xref_offset = len(out)
        out += b"xref\n"
        out += f"0 {len(self._objects) + 1}\n".encode("ascii")
        out += b"0000000000 65535 f \n"
        for off in offsets[1:]:
            out += f"{off:010d} 00000 n \n".encode("ascii")

        out += b"trailer\n"
        out += f"<< /Size {len(self._objects) + 1} /Root {root_obj_num} 0 R >>\n".encode("ascii")
        out += b"startxref\n"
        out += f"{xref_offset}\n".encode("ascii")
        out += b"%%EOF\n"
        return bytes(out)


def _stream(contents: str) -> bytes:
    b = contents.encode("utf-8")
    return b"<< /Length %d >>\nstream\n" % len(b) + b + b"\nendstream\n"


def _rgb_stroke(r: float, g: float, b: float) -> str:
    return f"{r:.3f} {g:.3f} {b:.3f} RG\n"


def _rgb_fill(r: float, g: float, b: float) -> str:
    return f"{r:.3f} {g:.3f} {b:.3f} rg\n"


def _line_width(w: float) -> str:
    return f"{w:.2f} w\n"


def _rect(x: float, y: float, w: float, h: float, fill: bool = False) -> str:
    op = "B" if fill else "S"
    return f"{x:.1f} {y:.1f} {w:.1f} {h:.1f} re {op}\n"


def _line(x1: float, y1: float, x2: float, y2: float) -> str:
    return f"{x1:.1f} {y1:.1f} m {x2:.1f} {y2:.1f} l S\n"


def _arrow(x1: float, y1: float, x2: float, y2: float) -> str:
    # Small arrow head; tuned for mostly horizontal/vertical arrows used below.
    s = _line(x1, y1, x2, y2)
    dx = x2 - x1
    dy = y2 - y1
    if abs(dx) >= abs(dy):
        # horizontal-ish
        sign = 1 if dx >= 0 else -1
        s += _line(x2, y2, x2 - 6 * sign, y2 + 3)
        s += _line(x2, y2, x2 - 6 * sign, y2 - 3)
    else:
        # vertical-ish
        sign = 1 if dy >= 0 else -1
        s += _line(x2, y2, x2 + 3, y2 - 6 * sign)
        s += _line(x2, y2, x2 - 3, y2 - 6 * sign)
    return s


def _text(x: float, y: float, size: int, s: str) -> str:
    return f"BT /F1 {size} Tf 1 0 0 1 {x:.1f} {y:.1f} Tm ({_escape_text(s)}) Tj ET\n"


def _center_text(x: float, y: float, w: float, h: float, size: int, s: str) -> str:
    # approximate centering by character count (good enough for boxes here)
    approx_char_w = size * 0.52
    text_w = len(s) * approx_char_w
    tx = x + (w - text_w) / 2
    ty = y + (h - size) / 2 + 2
    return _text(tx, ty, size, s)


def _box(x: float, y: float, w: float, h: float, title: str, subtitle: str | None = None) -> str:
    s = _rect(x, y, w, h)
    s += _center_text(x, y + h / 2 - 6, w, 18, 12, title)
    if subtitle:
        s += _center_text(x, y + 4, w, 16, 9, subtitle)
    return s


def _page_header(title: str) -> str:
    s = ""
    s += _rgb_stroke(0.20, 0.20, 0.25)
    s += _line_width(1.2)
    s += _text(40, 800, 18, title)
    s += _line(40, 792, 555, 792)
    return s


def _footer(page: int, total: int) -> str:
    return _text(40, 24, 9, f"Fase 1 • Arquitetura & Fluxos • Página {page}/{total}")


def build_pages() -> List[str]:
    pages: List[str] = []

    # Page 1: Integrator + Router + Feature Apps
    c = _page_header("Fase 1 — Como o site funciona (alto nível)")
    c += _text(40, 770, 10, "Stack: React 18 + React Router + Feature Hub (Feature Apps + Feature Service compartilhado).")
    c += _text(40, 755, 10, "Objetivo: mostrar rotas, containers, e os métodos principais que conectam o app (progresso/XP).")

    c += _rgb_stroke(0.35, 0.35, 0.45)
    c += _line_width(1.0)

    # Layout coordinates (A4: 595x842). Origin bottom-left.
    c += _box(40, 675, 160, 52, "Browser", "URL / navegação")
    c += _box(230, 675, 325, 52, "src/main.tsx", "createRoot(...).render(<App/>)")
    c += _arrow(200, 701, 230, 701)

    c += _box(40, 595, 160, 60, "src/App.tsx", "App()")
    c += _box(230, 595, 160, 60, "FeatureHubContextProvider", "featureAppManager")
    c += _box(395, 595, 160, 60, "BrowserRouter", "React Router")
    c += _arrow(312, 675, 120, 655)  # main -> app
    c += _arrow(120, 655, 230, 625)  # app -> fh provider
    c += _arrow(390, 625, 395, 625)  # provider -> router

    c += _box(40, 505, 240, 70, "Topbar()", "useProgress(): getState()+subscribe()")
    c += _box(315, 505, 240, 70, "Routes", "/, /trainer, /lessons/:id, ...")
    c += _arrow(475, 595, 160, 575)  # router -> topbar
    c += _arrow(475, 595, 435, 575)  # router -> routes

    # Feature apps grid
    c += _text(40, 470, 10, "Cada rota renderiza um FeatureAppContainer com uma definition (Feature App).")

    def _fa_box(x: float, y: float, name: str, file: str) -> str:
        s = _rect(x, y, 250, 52)
        s += _center_text(x, y + 22, 250, 18, 12, name)
        s += _center_text(x, y + 6, 250, 14, 9, file)
        return s

    c += _fa_box(40, 410, "Home", "src/feature-apps/home/definition.tsx")
    c += _fa_box(305, 410, "Trainer", "src/feature-apps/trainer/definition.tsx")
    c += _fa_box(40, 348, "Lesson (param: lessonId)", "src/feature-apps/lesson/definition.tsx")
    c += _fa_box(305, 348, "Flashcards", "src/feature-apps/flashcards/definition.tsx")
    c += _fa_box(40, 286, "Progress", "src/feature-apps/progress/definition.tsx")

    c += _arrow(435, 505, 165, 462)
    c += _arrow(435, 505, 430, 462)
    c += _arrow(435, 505, 165, 400)
    c += _arrow(435, 505, 430, 400)
    c += _arrow(435, 505, 165, 338)

    c += _text(40, 250, 10, "Métodos-chave nessa fase:")
    c += _text(60, 235, 10, "• Rotas: <Routes>/<Route> (src/App.tsx) + <FeatureAppContainer ...>")
    c += _text(60, 221, 10, "• Serviço global: learningProgressServiceDefinition (XP/nível/streak) via Feature Hub")
    c += _text(60, 207, 10, "• Persistência: localStorage (progresso e flashcards)")
    c += _footer(1, 3)
    pages.append(c)

    # Page 2: Feature Service internals
    c = _page_header("Fase 1 — Feature Service (progresso) e sincronização")
    c += _text(40, 770, 10, "O progresso é um Feature Service registrado no integrator e consumido por todos os Feature Apps.")

    c += _rgb_stroke(0.35, 0.35, 0.45)
    c += _line_width(1.0)

    c += _box(40, 680, 250, 56, "createFeatureHub()", "src/feature-hub/featureHub.ts")
    c += _box(315, 680, 240, 56, "learningProgressServiceDefinition", "src/feature-services/learningProgress.ts")
    c += _arrow(290, 708, 315, 708)

    c += _box(40, 600, 250, 56, "createLearningProgressService()", "state + listeners")
    c += _arrow(435, 680, 165, 640)

    c += _box(315, 600, 240, 56, "localStorage", "edu:learningProgress:v1")
    c += _arrow(290, 628, 315, 628)

    c += _box(40, 510, 250, 70, "API do serviço", "getState / subscribe / addXp / complete... / reset")
    c += _arrow(165, 600, 165, 580)

    c += _box(315, 510, 240, 70, "notify()", "setItem(...) + chama listeners")
    c += _arrow(290, 545, 315, 545)
    c += _arrow(435, 600, 435, 580)  # storage participates in notify persistence conceptually

    c += _box(40, 410, 250, 70, "Subscribers (React)", "useProgress(): setState via subscribe()")
    c += _arrow(165, 510, 165, 480)

    c += _box(315, 410, 240, 70, "UI re-render", "Topbar + telas atualizam")
    c += _arrow(290, 445, 315, 445)
    c += _arrow(165, 445, 315, 445)

    c += _text(40, 360, 10, "Chamadas mais importantes:")
    c += _text(60, 345, 10, "• Topbar: service.getState() + service.subscribe(setState) (src/App.tsx)")
    c += _text(60, 331, 10, "• Trainer: progressService.addXp(xp) ao acertar desafio")
    c += _text(60, 317, 10, "• Lesson: progressService.completeLessonAndReward(lessonId, 25) ao acertar o quiz")
    c += _text(60, 303, 10, "• Progress: progressService.reset() para zerar")

    c += _footer(2, 3)
    pages.append(c)

    # Page 3: Main flows
    c = _page_header("Fase 1 — Fluxos (o que chama o quê)")
    c += _text(40, 770, 10, "Fluxo A: navegar para uma aula e ganhar XP ao acertar o mini-quiz.")
    c += _rgb_stroke(0.35, 0.35, 0.45)
    c += _line_width(1.0)

    # Flow A boxes
    c += _box(40, 695, 245, 52, "Router", "match /lessons/:lessonId")
    c += _box(315, 695, 240, 52, "Lesson Feature App", "render() + LessonView")
    c += _arrow(285, 721, 315, 721)

    c += _box(40, 625, 245, 52, "Usuário", "seleciona resposta")
    c += _box(315, 625, 240, 52, "useEffect (LessonView)", "se correto -> completeLessonAndReward")
    c += _arrow(162, 677, 162, 625 + 52)
    c += _arrow(285, 651, 315, 651)

    c += _box(40, 555, 245, 60, "progressService", "completeLessonAndReward(lessonId, 25)")
    c += _box(315, 555, 240, 60, "notify()", "localStorage.setItem + listeners")
    c += _arrow(435, 625, 162, 615)
    c += _arrow(285, 585, 315, 585)

    c += _box(40, 480, 245, 60, "Topbar subscriber", "setState -> re-render XP/Level")
    c += _box(315, 480, 240, 60, "Outras telas", "também re-renderizam")
    c += _arrow(435, 555, 162, 540)
    c += _arrow(435, 555, 435, 540)

    c += _text(40, 440, 10, "Fluxo B: treino contínuo (ganha XP por desafio).")
    c += _text(60, 425, 10, "TrainerView.submit(): progressService.addXp(challenge.xp) quando resposta correta.")

    c += _text(40, 395, 10, "Fluxo C: flashcards (SRS) + XP global.")
    c += _text(60, 380, 10, "FlashcardsView.answer('good'): atualiza store no localStorage e chama progressService.addXp(5).")

    c += _text(40, 350, 10, "Observação: não há backend; as 'requests' são simuladas (ex.: fakeFetchWord no Try It de useEffect).")
    c += _footer(3, 3)
    pages.append(c)

    return pages


def generate_pdf(out_path: str) -> None:
    pages_content = build_pages()
    pdf = PdfBuilder()

    # Shared font resource
    font_obj = pdf.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n")

    # Content streams and page objects
    content_objs: List[int] = []
    page_objs: List[int] = []

    for content in pages_content:
        content_obj = pdf.add(_stream(content))
        content_objs.append(content_obj)

    # Object numbering is deterministic based on insertion order:
    # 1) font (1 object)
    # 2) N content streams
    # 3) N page objects
    # 4) pages root
    # 5) catalog
    n = len(pages_content)
    pages_obj_num = 2 * n + 2

    for idx, content_obj in enumerate(content_objs):
        page_dict = (
            "<< /Type /Page /Parent {PAGES} 0 R "
            "/MediaBox [0 0 595 842] "
            "/Resources << /Font << /F1 {FONT} 0 R >> >> "
            "/Contents {CONT} 0 R >>\n"
        ).format(PAGES=pages_obj_num, FONT=font_obj, CONT=content_obj)
        page_objs.append(pdf.add(page_dict))

    kids = " ".join(f"{n} 0 R" for n in page_objs)
    pages_dict = f"<< /Type /Pages /Kids [ {kids} ] /Count {len(page_objs)} >>\n"
    pages_obj = pdf.add(pages_dict)

    # Catalog
    catalog_obj = pdf.add(f"<< /Type /Catalog /Pages {pages_obj} 0 R >>\n")

    data = pdf.build(root_obj_num=catalog_obj)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(data)


def main() -> None:
    out_path = os.environ.get("OUT", "docs/fase-1/fase-1-arquitetura.pdf")
    generate_pdf(out_path)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
