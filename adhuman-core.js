(function () {
    class ADHumanWCAG {
        constructor() {
            this.violations = [];
            this.corrections = [];
            this.lastMovement = Date.now();

            this.stage0Executed = false;
            this.stage2Executed = false;

            this.reportPanel = null;
            this.controlPanel = null;

            this.injectStyles();
            this.monitorHuman();
            this.loop();

            console.log("[ADHUMAN] Inicializado com sucesso.");
        }

        loop() {
            setInterval(() => {
                const idle = Date.now() - this.lastMovement;

                if (!this.stage0Executed && idle >= 10000) {
                    console.log("[ADHUMAN] Executando estágio 0.");
                    this.stage0();
                    this.stage0Executed = true;
                }

                if (!this.stage2Executed && idle >= 20000) {
                    console.log("[ADHUMAN] Executando estágio 2.");
                    this.stage2();
                    this.stage2Executed = true;
                }
            }, 500);
        }

        monitorHuman() {
            document.addEventListener("mousemove", () => {
                this.lastMovement = Date.now();
            }, { passive: true });
        }

        stage0() {
            this.detectViolations();
            this.applyFixes();
            this.showReport();
        }

        stage2() {
            this.showControlPanel();
        }

        detectViolations() {
            this.violations = [];
            const seen = new Set();

            document.querySelectorAll("*").forEach((el) => {
                const style = getComputedStyle(el);
                const fg = this.parseColor(style.color);
                const bg = this.getEffectiveBackground(el);

                if (fg && bg && this.isTextElement(el)) {
                    const ratio = this.calculateContrast(fg, bg);
                    if (ratio < 4.5) {
                        this.addViolation(seen, "1.4.3", "Contraste insuficiente em texto", el);
                    }
                }

                if (this.isUIElement(el)) {
                    const border = this.parseColor(style.borderTopColor);
                    if (border && bg) {
                        const ratio = this.calculateContrast(border, bg);
                        if (ratio < 3) {
                            this.addViolation(seen, "1.4.11", "Contraste insuficiente em componente não textual", el);
                        }
                    }
                }

                if (el.textContent && /erro|atenção|sucesso|obrigatório/i.test(el.textContent)) {
                    const hasExtraCue =
                        !!el.querySelector("svg, img, strong, b, [aria-label], [role='img']") ||
                        /!|\*|erro|atenção|sucesso/i.test(el.textContent);

                    if (!hasExtraCue) {
                        this.addViolation(seen, "1.4.1", "Possível dependência exclusiva de cor", el);
                    }
                }

                if (this.isTextElement(el)) {
                    const fontSize = parseFloat(style.fontSize);
                    if (!Number.isNaN(fontSize) && fontSize < 12) {
                        this.addViolation(seen, "1.4.4", "Texto muito pequeno", el);
                    }
                }

                if (el.tagName === "P") {
                    const lineHeight = this.resolveLineHeight(style);
                    const maxWidth = parseFloat(style.maxWidth);

                    if (lineHeight < 1.5) {
                        this.addViolation(seen, "1.4.8", "Espaçamento entre linhas inadequado", el);
                    }

                    if (!maxWidth || maxWidth > 900) {
                        this.addViolation(seen, "1.4.8", "Largura excessiva de bloco textual", el);
                    }
                }
            });

            console.log("[ADHUMAN] Violações detectadas:", this.violations);
        }

        applyFixes() {
            this.corrections = [];

            document.querySelectorAll("*").forEach((el) => {
                const style = getComputedStyle(el);
                const fg = this.parseColor(style.color);
                const bg = this.getEffectiveBackground(el);

                if (fg && bg && this.isTextElement(el)) {
                    const ratio = this.calculateContrast(fg, bg);
                    if (ratio < 4.5) {
                        el.classList.add("adhuman-text-contrast-fix");
                        this.corrections.push("1.4.3: contraste textual ajustado");
                    }
                }

                if (this.isUIElement(el)) {
                    el.classList.add("adhuman-ui-contrast-fix");
                }

                if (el.textContent && /erro|atenção|sucesso|obrigatório/i.test(el.textContent)) {
                    if (!el.dataset.adhumanCueApplied) {
                        el.dataset.adhumanCueApplied = "true";
                        if (!el.textContent.trim().startsWith("⚠ ")) {
                            el.textContent = "⚠ " + el.textContent.trim();
                        }
                        this.corrections.push("1.4.1: pista textual adicionada");
                    }
                }

                if (el.tagName === "P") {
                    el.style.lineHeight = "1.6";
                    el.style.maxWidth = "700px";
                    el.style.letterSpacing = "0.12em";
                    el.style.wordSpacing = "0.16em";
                }
            });

            document.documentElement.classList.add("adhuman-resize-text-fix");
            this.corrections.push("1.4.4: escala global de texto aumentada");
            this.corrections.push("1.4.11: contraste de bordas reforçado");
            this.corrections.push("1.4.8: apresentação visual melhorada");

            console.log("[ADHUMAN] Correções aplicadas:", this.corrections);
        }

        showReport() {
            if (this.reportPanel) this.reportPanel.remove();

            const byRule = this.groupByRule(this.violations);
            const correctionCounts = this.groupCorrections(this.corrections);

            const panel = document.createElement("div");
            panel.className = "adhuman-panel";
            panel.innerHTML = `
                <div class="adhuman-title">ADHuman — Estágio 0</div>
                <div><strong>Violações detectadas:</strong></div>
                <ul>
                    ${Object.entries(byRule).map(([rule, count]) => `<li>${rule}: ${count}</li>`).join("") || "<li>Nenhuma</li>"}
                </ul>
                <div><strong>Melhorias aplicadas:</strong></div>
                <ul>
                    ${Object.entries(correctionCounts).map(([rule, count]) => `<li>${rule}: ${count}</li>`).join("") || "<li>Nenhuma</li>"}
                </ul>
            `;

            document.body.appendChild(panel);
            this.reportPanel = panel;
        }

        showControlPanel() {
            if (this.controlPanel) return;

            const panel = document.createElement("div");
            panel.className = "adhuman-control-panel";
            panel.innerHTML = `
                <div class="adhuman-title">ADHuman — Estágio 2</div>
                <p>Você pode ajustar manualmente a interface:</p>
                <button id="adhuman-more-text">Aumentar texto</button>
                <button id="adhuman-more-contrast">Forçar alto contraste</button>
                <button id="adhuman-better-reading">Melhorar leitura</button>
            `;

            document.body.appendChild(panel);
            this.controlPanel = panel;

            document.getElementById("adhuman-more-text").addEventListener("click", () => {
                document.documentElement.style.fontSize = "140%";
            });

            document.getElementById("adhuman-more-contrast").addEventListener("click", () => {
                document.body.classList.toggle("adhuman-force-contrast");
            });

            document.getElementById("adhuman-better-reading").addEventListener("click", () => {
                document.querySelectorAll("p").forEach((p) => {
                    p.style.lineHeight = "1.8";
                    p.style.maxWidth = "650px";
                    p.style.letterSpacing = "0.12em";
                    p.style.wordSpacing = "0.16em";
                });
            });
        }

        addViolation(seen, rule, message, el) {
            const key = `${rule}|${message}|${el.tagName}|${el.className}|${el.id}`;
            if (!seen.has(key)) {
                seen.add(key);
                this.violations.push({ rule, message });
            }
        }

        groupByRule(items) {
            return items.reduce((acc, item) => {
                acc[item.rule] = (acc[item.rule] || 0) + 1;
                return acc;
            }, {});
        }

        groupCorrections(items) {
            return items.reduce((acc, item) => {
                const rule = item.split(":")[0];
                acc[rule] = (acc[rule] || 0) + 1;
                return acc;
            }, {});
        }

        isTextElement(el) {
            const tag = el.tagName;
            return ["P", "SPAN", "A", "LI", "TD", "TH", "LABEL", "BUTTON", "H1", "H2", "H3", "H4", "H5", "H6"].includes(tag);
        }

        isUIElement(el) {
            return ["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"].includes(el.tagName);
        }

        resolveLineHeight(style) {
            if (style.lineHeight === "normal") return 1.2;
            const lh = parseFloat(style.lineHeight);
            const fs = parseFloat(style.fontSize);
            if (!Number.isNaN(lh) && !Number.isNaN(fs) && fs > 0) {
                return lh / fs;
            }
            return 1.2;
        }

        getEffectiveBackground(el) {
            let current = el;
            while (current && current !== document.documentElement) {
                const bg = getComputedStyle(current).backgroundColor;
                const parsed = this.parseColor(bg);
                if (parsed && !this.isTransparent(bg)) {
                    return parsed;
                }
                current = current.parentElement;
            }
            return [255, 255, 255];
        }

        isTransparent(color) {
            return color === "transparent" || color === "rgba(0, 0, 0, 0)";
        }

        parseColor(color) {
            if (!color) return null;
            color = color.trim().toLowerCase();

            if (color.startsWith("#")) {
                return this.hexToRgb(color);
            }

            if (color.startsWith("rgb")) {
                const match = color.match(/\d+(\.\d+)?/g);
                if (!match) return null;
                return match.slice(0, 3).map(Number);
            }

            return null;
        }

        hexToRgb(hex) {
            let clean = hex.replace("#", "");

            if (clean.length === 3) {
                clean = clean.split("").map((c) => c + c).join("");
            }

            if (clean.length !== 6) return null;

            const num = parseInt(clean, 16);
            return [
                (num >> 16) & 255,
                (num >> 8) & 255,
                num & 255
            ];
        }

        luminance([r, g, b]) {
            const values = [r, g, b].map((v) => {
                v /= 255;
                return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
        }

        calculateContrast(fg, bg) {
            const l1 = this.luminance(fg);
            const l2 = this.luminance(bg);
            const lighter = Math.max(l1, l2);
            const darker = Math.min(l1, l2);
            return (lighter + 0.05) / (darker + 0.05);
        }

        injectStyles() {
            const style = document.createElement("style");
            style.textContent = `
                .adhuman-text-contrast-fix {
                    color: #000 !important;
                    background-color: #fff !important;
                }

                .adhuman-ui-contrast-fix {
                    border: 2px solid #000 !important;
                    outline: 2px solid #000 !important;
                }

                .adhuman-resize-text-fix {
                    font-size: 120% !important;
                }

                .adhuman-force-contrast,
                .adhuman-force-contrast * {
                    color: #000 !important;
                    background: #fff !important;
                    border-color: #000 !important;
                }

                .adhuman-panel,
                .adhuman-control-panel {
                    position: fixed;
                    right: 20px;
                    background: #fff;
                    color: #000;
                    border: 2px solid #000;
                    box-shadow: 0 0 10px rgba(0,0,0,0.25);
                    padding: 14px;
                    z-index: 2147483647;
                    max-width: 320px;
                    font: 14px/1.4 Arial, sans-serif;
                }

                .adhuman-panel { top: 20px; }
                .adhuman-control-panel { bottom: 20px; }

                .adhuman-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                }

                .adhuman-control-panel button {
                    display: block;
                    width: 100%;
                    margin-top: 8px;
                    padding: 8px;
                    cursor: pointer;
                }
            `;
            document.head.appendChild(style);
        }
    }

    window.ADHumanWCAG = ADHumanWCAG;
})();
