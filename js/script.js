document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "projeto_de_vida_dados_v1";

    const areasRoda = [
        "Saúde & Bem-estar",
        "Estudos & Conhecimento",
        "Carreira & Vocação",
        "Finanças",
        "Família",
        "Amigos & Vida Social",
        "Equilíbrio Emocional",
        "Lazer & Hobbies"
    ];

    let estado = {
        nome: "",
        idade: "",
        valores: "",
        sonhoGrande: "",
        pilarPessoal: "",
        pilarSocial: "",
        pilarProfissional: "",
        roda: [7, 7, 6, 5, 8, 7, 6, 6],
        metas: [
            { id: 1, titulo: "Definir minhas prioridades para este semestre", prazo: "Curto Prazo (até 1 ano)", pilar: "Pessoal", concluida: false },
            { id: 2, titulo: "Participar de um projeto voluntário ou comunitário", prazo: "Médio Prazo (1 a 3 anos)", pilar: "Social", concluida: false }
        ]
    };

    let filtroAtual = "Todas";

    // Carregar dados salvos
    function carregarDados() {
        const salvo = localStorage.getItem(STORAGE_KEY);
        if (salvo) {
            try {
                estado = { ...estado, ...JSON.parse(salvo) };
            } catch (e) {
                console.error("Erro ao ler dados salvos:", e);
            }
        }
    }

    // Salvar dados no localStorage
    function salvarDados() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
        const statusEl = document.getElementById("status-save");
        if (statusEl) {
            statusEl.textContent = "Salvo agora ✓";
            setTimeout(() => {
                statusEl.textContent = "Salvo automaticamente";
            }, 1500);
        }
    }

    // Vincular campos de texto
    const camposTexto = [
        { id: "nome", prop: "nome" },
        { id: "idade", prop: "idade" },
        { id: "valores", prop: "valores" },
        { id: "sonho-grande", prop: "sonhoGrande" },
        { id: "pilar-pessoal-texto", prop: "pilarPessoal" },
        { id: "pilar-social-texto", prop: "pilarSocial" },
        { id: "pilar-profissional-texto", prop: "pilarProfissional" }
    ];

    function inicializarCamposTexto() {
        camposTexto.forEach(campo => {
            const el = document.getElementById(campo.id);
            if (!el) return;
            el.value = estado[campo.prop] || "";
            el.addEventListener("input", (e) => {
                estado[campo.prop] = e.target.value;
                salvarDados();
            });
        });
    }

    // Construir Sliders e Gráfico da Roda da Vida
    function inicializarRodaDaVida() {
        const container = document.getElementById("sliders-container");
        container.innerHTML = "";

        areasRoda.forEach((area, index) => {
            const valor = estado.roda[index] ?? 5;
            const item = document.createElement("div");
            item.className = "slider-item";
            item.innerHTML = `
                <div class="slider-header">
                    <span>${area}</span>
                    <span id="val-area-${index}">${valor}/10</span>
                </div>
                <input type="range" min="1" max="10" value="${valor}" data-index="${index}">
            `;

            const slider = item.querySelector("input");
            slider.addEventListener("input", (e) => {
                const novoVal = parseInt(e.target.value, 10);
                estado.roda[index] = novoVal;
                document.getElementById(`val-area-${index}`).textContent = `${novoVal}/10`;
                desenharRoda();
                salvarDados();
            });

            container.appendChild(item);
        });

        desenharRoda();
    }

    function desenharRoda() {
        const canvas = document.getElementById("rodaCanvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = 135;
        const total = areasRoda.length;

        ctx.clearRect(0, 0, w, h);

        // Círculos de grade (2 em 2)
        for (let nivel = 2; nivel <= 10; nivel += 2) {
            ctx.beginPath();
            ctx.arc(cx, cy, (maxR / 10) * nivel, 0, Math.PI * 2);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Eixos e rótulos
        areasRoda.forEach((area, i) => {
            const angulo = (Math.PI * 2 / total) * i - Math.PI / 2;
            const x = cx + Math.cos(angulo) * maxR;
            const y = cy + Math.sin(angulo) * maxR;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.strokeStyle = "#cbd5e1";
            ctx.stroke();

            // Texto curto
            const lx = cx + Math.cos(angulo) * (maxR + 24);
            const ly = cy + Math.sin(angulo) * (maxR + 24);
            ctx.fillStyle = "#334155";
            ctx.font = "600 11px Segoe UI, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const nomeCurto = area.split(" ")[0];
            ctx.fillText(nomeCurto, lx, ly);
        });

        // Polígono preenchido com os valores
        ctx.beginPath();
        estado.roda.forEach((val, i) => {
            const angulo = (Math.PI * 2 / total) * i - Math.PI / 2;
            const r = (maxR / 10) * val;
            const x = cx + Math.cos(angulo) * r;
            const y = cy + Math.sin(angulo) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(37, 99, 235, 0.28)";
        ctx.fill();
        ctx.strokeStyle = "#2563eb";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Pontos nos vértices
        estado.roda.forEach((val, i) => {
            const angulo = (Math.PI * 2 / total) * i - Math.PI / 2;
            const r = (maxR / 10) * val;
            const x = cx + Math.cos(angulo) * r;
            const y = cy + Math.sin(angulo) * r;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#1d4ed8";
            ctx.fill();
        });

        // Calcular média
        const soma = estado.roda.reduce((acc, v) => acc + v, 0);
        const media = (soma / total).toFixed(1);
        document.getElementById("media-valor").textContent = media;
    }

    // Gerenciamento de Metas
    function renderizarMetas() {
        const lista = document.getElementById("lista-metas");
        lista.innerHTML = "";

        const metasFiltradas = estado.metas.filter(m => {
            if (filtroAtual === "Pendentes") return !m.concluida;
            if (filtroAtual === "Concluidas") return m.concluida;
            return true;
        });

        if (metasFiltradas.length === 0) {
            lista.innerHTML = `<li style="text-align:center; color:#64748b; padding:16px;">Nenhuma meta encontrada neste filtro.</li>`;
            return;
        }

        metasFiltradas.forEach(meta => {
            const li = document.createElement("li");
            li.className = `meta-item ${meta.concluida ? "concluida" : ""}`;
            li.innerHTML = `
                <div class="meta-info">
                    <input type="checkbox" class="meta-checkbox" ${meta.concluida ? "checked" : ""}>
                    <div>
                        <div class="meta-texto"><strong>${meta.titulo}</strong></div>
                        <div class="meta-tags">
                            <span class="tag tag-prazo">${meta.prazo}</span>
                            <span class="tag tag-pilar">${meta.pilar}</span>
                        </div>
                    </div>
                </div>
                <button class="btn-delete" title="Excluir meta">🗑️</button>
            `;

            li.querySelector(".meta-checkbox").addEventListener("change", () => {
                meta.concluida = !meta.concluida;
                salvarDados();
                renderizarMetas();
            });

            li.querySelector(".btn-delete").addEventListener("click", () => {
                estado.metas = estado.metas.filter(item => item.id !== meta.id);
                salvarDados();
                renderizarMetas();
            });

            lista.appendChild(li);
        });
    }

    document.getElementById("form-meta").addEventListener("submit", (e) => {
        e.preventDefault();
        const inputTitulo = document.getElementById("meta-titulo");
        const prazo = document.getElementById("meta-prazo").value;
        const pilar = document.getElementById("meta-pilar").value;

        if (!inputTitulo.value.trim()) return;

        estado.metas.unshift({
            id: Date.now(),
            titulo: inputTitulo.value.trim(),
            prazo,
            pilar,
            concluida: false
        });

        inputTitulo.value = "";
        salvarDados();
        renderizarMetas();
    });

    document.querySelectorAll(".filtro-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filtroAtual = btn.dataset.filtro;
            renderizarMetas();
        });
    });

    // Botão Salvar PDF / Imprimir
    document.getElementById("btn-exportar").addEventListener("click", () => {
        window.print();
    });

    // Botão Resetar
    document.getElementById("btn-limpar").addEventListener("click", () => {
        if (confirm("Tem certeza que deseja apagar todos os dados preenchidos?")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    });

    // Inicialização geral
    carregarDados();
    inicializarCamposTexto();
    inicializarRodaDaVida();
    renderizarMetas();
});
