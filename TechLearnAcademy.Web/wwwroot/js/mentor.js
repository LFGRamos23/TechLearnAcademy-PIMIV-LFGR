// Monta a lista de alunos e as orientações registradas pelo mentor.
class PaginaMentor {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
        this.pagina = document.body.dataset.pagina;
    }

    cardAluno(aluno) {
        const item = this.tela.cartao(aluno.nome, aluno.email);
        item.append(this.tela.elemento("p", "Aluno atendido por você em um chamado."));
        item.append(this.tela.criarLink("Ver orientações e curso", "acompanhamento-aluno.html?id=" + aluno.id));
        return item;
    }

    mostrarOrientacoes(lista, area, nome = "") {
        area.replaceChildren();
        if (!lista.length) { this.tela.vazio(area, "Ainda não há orientações registradas."); return; }
        for (const orientacao of lista) {
            const item = this.tela.cartao(nome || "Orientação", orientacao.texto);
            item.append(this.tela.elemento("p", this.tela.dataBrasileira(orientacao.data), "ajuda"));
            area.append(item);
        }
    }

    // O acompanhamento reúne cursos, resultados e orientações do aluno atendido.
    async detalheAluno() {
        const aluno = await this.api.requisicao("/api/mentor/alunos/" + this.tela.numeroId());
        this.tela.campo("detalhes").append(this.tela.elemento("h2", aluno.nome), this.tela.elemento("p", aluno.email));
        this.tela.campo("acoes").append(this.tela.criarLink("Registrar orientação", "orientacao.html?id=" + aluno.id));
        if (!aluno.cursos.length) this.tela.vazio(this.tela.campo("cursos"), "O aluno ainda não possui matrículas.");
        for (const curso of aluno.cursos) {
            const item = this.tela.cartao(curso.nome);
            item.append(this.tela.progresso(curso.progresso));
            this.tela.campo("cursos").append(item);
        }
        this.tela.listarResultados(aluno.resultados, this.tela.campo("lista"));
        this.mostrarOrientacoes(aluno.orientacoes, this.tela.campo("orientacoes"));
    }

    iniciar() {
        this.sessao.iniciar(["Mentor"], async (usuario) => {
            if (this.pagina === "painel" || this.pagina === "alunos") {
                const alunos = await this.api.requisicao("/api/mentor/alunos");
                if (this.pagina === "alunos") {
                    if (!alunos.length) this.tela.vazio(this.tela.campo("lista"), "Você ainda não assumiu chamados de alunos. Acesse Ajuda e ouvidoria para escolher um chamado.");
                    for (const aluno of alunos) this.tela.campo("lista").append(this.cardAluno(aluno));
                } else {
                    const chamados = await this.api.requisicao("/api/chamados");
                    const disponiveis = chamados.filter(c => c.podeAtender === true);
                    const meus = chamados.filter(c => c.responsavelId === usuario.id && c.status === "Em atendimento");
                    this.tela.metricas([["Chamados disponíveis", disponiveis.length], ["Em atendimento", meus.length], ["Alunos atendidos", alunos.length]]);
                    this.tela.campo("lista").append(this.tela.criarLink("Ver chamados e atender aluno", "chamados.html"));
                    for (const chamado of meus) {
                        const card = this.tela.cartao(chamado.solicitante, chamado.assunto);
                        card.append(this.tela.criarLink("Abrir conversa", "chamados.html?id=" + chamado.id)); this.tela.campo("lista").append(card);
                    }
                    // Cada histórico vem da API; não criamos orientações de exemplo.
                    const recentes = [];
                    for (const aluno of alunos) {
                        const detalhe = await this.api.requisicao("/api/mentor/alunos/" + aluno.id);
                        for (const orientacao of detalhe.orientacoes) {
                            recentes.push({ texto: orientacao.texto, data: orientacao.data, nome: aluno.nome });
                        }
                    }
                    recentes.sort((a, b) => new Date(b.data) - new Date(a.data));
                    if (!recentes.length) this.tela.vazio(this.tela.campo("orientacoes"), "Ainda não há orientações registradas.");
                    for (const orientacao of recentes.slice(0, 6)) {
                        const item = this.tela.cartao(orientacao.nome, orientacao.texto);
                        item.append(this.tela.elemento("p", this.tela.dataBrasileira(orientacao.data), "ajuda"));
                        this.tela.campo("orientacoes").append(item);
                    }
                }
            }
            if (this.pagina === "acompanhamento") await this.detalheAluno();
            if (this.pagina === "orientacao") {
                const carregar = async () => {
                    const aluno = await this.api.requisicao("/api/mentor/alunos/" + this.tela.numeroId());
                    this.tela.campo("nome-aluno").textContent = aluno.nome;
                    this.mostrarOrientacoes(aluno.orientacoes, this.tela.campo("orientacoes"));
                }
                await carregar();
                this.tela.enviarFormulario("form-orientacao", async (formulario) => {
                    const texto = this.tela.textoCampo("texto");
                    if (!texto) throw new Error("Escreva uma orientação antes de enviar.");
                    const retorno = await this.api.requisicao("/api/mentor/orientacoes", "POST", { alunoId: this.tela.numeroId(), texto: texto });
                    formulario.reset();
                    this.tela.aviso(retorno.mensagem, "sucesso");
                    await carregar();
                });
            }
        });

    }
}

new PaginaMentor(api, tela, sessao).iniciar();
