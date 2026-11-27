// Monta conversas de chamados, certificados e desempenho por curso.
// Cada página usa as mesmas funções de comunicação e de mensagens de api.js.
class PaginaAtendimento {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
        this.pagina = document.body.dataset.pagina;
        this.usuarioAtual = null;
        this.chamadoAtual = 0;
        this.ultimaConversa = "";
        this.atualizandoChamados = false;
    }

    nomeTipo(tipo) {
        if (tipo === "AjudaCurso") return "Dúvida do curso";
        if (tipo === "ContatoAdministracao") return "Contato com a administração";
        return "Ouvidoria / ajuda com o gestor";
    }

    // Mostra separadamente os chamados recebidos e os enviados.
    async listarChamados() {
        const lista = await this.api.requisicao("/api/chamados");
        const filtro = this.tela.valor("filtro-chamados");
        const area = this.tela.campo("lista"); area.replaceChildren();
        let exibidos = 0;
        for (const chamado of lista) {
            const meu = chamado.solicitanteId === this.usuarioAtual.id || chamado.responsavelId === this.usuarioAtual.id;
            const disponivel = chamado.podeAtender === true;
            if (filtro === "abertos" && chamado.status === "Encerrado") continue;
            if (filtro === "meus" && !meu) continue;
            if (filtro === "disponiveis" && !disponivel) continue;
            const card = this.tela.cartao("#" + chamado.id + " · " + chamado.assunto, this.nomeTipo(chamado.tipo));
            card.append(this.tela.elemento("p", "Solicitante: " + chamado.solicitante + (chamado.curso ? " · Curso: " + chamado.curso : "")),
                this.tela.elemento("p", "Responsável: " + (chamado.responsavel || "Aguardando atendimento")),
                this.tela.elemento("span", chamado.status, "selo"),
                this.tela.botaoAcao(chamado.solicitanteId === this.usuarioAtual.id ? "Acompanhar meu chamado" : "Abrir conversa", () => this.abrirConversa(chamado.id)));
            if (disponivel) card.append(this.tela.botaoAcao("Atender chamado", async () => {
                await this.api.requisicao("/api/chamados/" + chamado.id + "/assumir", "POST");
                this.tela.aviso("Você assumiu o chamado.", "sucesso");
                await this.listarChamados(); await this.abrirConversa(chamado.id);
            }));
            area.append(card); exibidos++;
        }
        if (!exibidos) this.tela.vazio(area, "Nenhum chamado neste filtro.");
    }

    // Carrega as mensagens e ações disponíveis para este chamado.
    async abrirConversa(id, automatico = false) {
        this.chamadoAtual = id;
        const chamado = await this.api.requisicao("/api/chamados/" + id);
        // Uma resposta atrasada não pode trocar o chamado que acabou de ser aberto.
        if (this.chamadoAtual !== id) return;
        const versao = JSON.stringify(chamado);
        if (automatico && this.chamadoAtual === id && this.ultimaConversa === versao) return;
        this.ultimaConversa = versao;
        const detalhe = this.tela.campo("detalhe-chamado"); detalhe.hidden = false;
        this.tela.campo("titulo-chamado").textContent = "#" + id + " · " + chamado.assunto;
        this.tela.campo("dados-chamado").textContent = chamado.solicitante + " · " + this.nomeTipo(chamado.tipo) + " · " + chamado.status +
            " · Responsável: " + (chamado.responsavel || "Aguardando") + (chamado.curso ? " · " + chamado.curso : "");
        this.tela.campo("descricao-chamado").textContent = chamado.descricao;
        const conversa = this.tela.campo("conversa"); conversa.replaceChildren();
        for (const mensagem of chamado.mensagens) {
            const item = this.tela.elemento("article");
            item.append(this.tela.elemento("strong", mensagem.nome + " · " + mensagem.perfil),
                this.tela.elemento("p", mensagem.texto), this.tela.elemento("small", this.tela.dataBrasileira(mensagem.data)));
            conversa.append(item);
        }
        if (!chamado.mensagens.length) this.tela.vazio(conversa, "Ainda não há respostas. Acompanhe por aqui.");
        conversa.scrollTop = conversa.scrollHeight;
        this.tela.campo("form-mensagem").hidden = !chamado.podeResponder;
        this.tela.campo("situacao-conversa").textContent = chamado.status === "Encerrado" ? "Chamado encerrado. A conversa permanece no histórico." :
            chamado.solicitanteId === this.usuarioAtual.id && this.usuarioAtual.perfil !== "Aluno" ? "Este é o seu chamado. Acompanhe aqui o status e a resposta do responsável." :
            chamado.solicitanteId === this.usuarioAtual.id && !chamado.responsavelId ? "Seu chamado foi enviado. Aguarde um responsável assumir o atendimento. Você pode acompanhar o status por aqui." : "";
        const acoes = this.tela.campo("acoes-chamado"); acoes.replaceChildren();
        acoes.append(this.tela.botaoAcao("Atualizar conversa", () => this.abrirConversa(id)));
        if (chamado.podeAtender)
            acoes.append(this.tela.botaoAcao("Atender chamado", async () => {
                await this.api.requisicao("/api/chamados/" + id + "/assumir", "POST"); await this.abrirConversa(id); await this.listarChamados();
            }));
        if (chamado.podeEncerrar) acoes.append(this.tela.botaoAcao("Encerrar chamado", async () => {
            if (!await this.tela.dialogo("Encerrar chamado", "A conversa será mantida no histórico. Deseja encerrar este atendimento?")) return;
            await this.api.requisicao("/api/chamados/" + id + "/encerrar", "POST");
            this.tela.aviso("Chamado encerrado.", "sucesso"); await this.abrirConversa(id); await this.listarChamados();
        }));
        if (!automatico) detalhe.scrollIntoView({ block: "start", behavior: "smooth" });
    }

    // Define quem pode abrir chamado e inicia a atualização periódica da conversa.
    async configurarChamados() {
        if (this.usuarioAtual.perfil === "Administrador") {
            this.tela.campo("novo-chamado").hidden = true;
            this.tela.campo("destino-chamado").textContent = "";
        } else {
            this.tela.campo("destino-chamado").textContent = this.usuarioAtual.perfil === "Gestor" ?
                "Sua solicitação será recebida pelo administrador." : "Ajuda e ouvidoria serão recebidas pelo gestor.";
            if (this.usuarioAtual.perfil === "Aluno") {
                this.tela.campo("campo-curso").hidden = false;
                const cursos = await this.api.requisicao("/api/matriculas/minhas");
                for (const curso of cursos) {
                    const opcao = this.tela.elemento("option", "Ajuda com mentor · " + curso.nome); opcao.value = curso.cursoId;
                    this.tela.campo("curso-chamado").append(opcao);
                }
                if (cursos.some(c => c.cursoId === this.tela.numeroId("curso"))) this.tela.campo("curso-chamado").value = this.tela.numeroId("curso");
                this.tela.campo("curso-chamado").onchange = () => {
                    this.tela.campo("destino-chamado").textContent = Number(this.tela.valor("curso-chamado")) ?
                        "Sua dúvida será recebida pelos mentores. Um deles assumirá seu chamado." : "Sua ouvidoria será recebida pelos gestores.";
                };
                this.tela.campo("curso-chamado").onchange();
            }
            this.tela.enviarFormulario("form-chamado", async (form) => {
                const retorno = await this.api.requisicao("/api/chamados", "POST", {
                    cursoId: this.usuarioAtual.perfil === "Aluno" ? Number(this.tela.valor("curso-chamado")) : 0,
                    assunto: this.tela.textoCampo("assunto"), texto: this.tela.textoCampo("texto-chamado")
                });
                this.tela.campo("assunto").value = ""; this.tela.campo("texto-chamado").value = "";
                this.tela.aviso(retorno.mensagem, "sucesso"); await this.listarChamados(); await this.abrirConversa(retorno.id);
            });
        }
        this.tela.campo("filtro-chamados").onchange = () => this.listarChamados().catch(e => this.tela.aviso(e.message, "erro"));
        this.tela.campo("atualizar-lista").onclick = () => this.listarChamados().catch(e => this.tela.aviso(e.message, "erro"));
        this.tela.enviarFormulario("form-mensagem", async (form) => {
            await this.api.requisicao("/api/chamados/" + this.chamadoAtual + "/mensagens", "POST", { texto: this.tela.textoCampo("texto-mensagem") });
            form.reset(); this.tela.aviso("Mensagem enviada.", "sucesso"); await this.abrirConversa(this.chamadoAtual);
        });
        await this.listarChamados();
        if (this.tela.numeroId()) await this.abrirConversa(this.tela.numeroId());
        // Atualiza a fila e as respostas, preservando a mensagem em digitação.
        setInterval(async () => {
            if (document.hidden || this.atualizandoChamados || document.querySelector("dialog[open]")) return;
            this.atualizandoChamados = true;
            try { await this.listarChamados(); if (this.chamadoAtual) await this.abrirConversa(this.chamadoAtual, true); }
            catch (erro) { this.tela.aviso(erro.message, "erro"); }
            finally { this.atualizandoChamados = false; }
        }, 5000);
    }

    // Exibe pedidos pendentes ao gestor e certificados disponíveis ao aluno.
    async listarCertificados() {
        const lista = await this.api.requisicao("/api/certificados");
        const area = this.tela.campo("lista"); area.replaceChildren();
        if (!lista.length) { this.tela.vazio(area, "Nenhuma solicitação ou curso matriculado encontrado."); return; }
        for (const certificado of lista) {
            const item = this.tela.cartao(certificado.curso, certificado.aluno ? "Aluno: " + certificado.aluno : "");
            item.append(this.tela.elemento("span", certificado.status || "Ainda não solicitado", "selo"));
            if (certificado.motivo) item.append(this.tela.elemento("p", "Motivo: " + certificado.motivo));
            if (certificado.codigo) item.append(this.tela.elemento("p", "Código: " + certificado.codigo));
            if (certificado.gestor) item.append(this.tela.elemento("p", "Gestor: " + certificado.gestor));
            if (certificado.status === "Aprovado") {
                const link = this.tela.criarLink("Ver certificado / salvar PDF", "certificado.html?id=" + certificado.id);
                link.target = "_blank"; link.rel = "noopener"; item.append(link);
            } else if (this.usuarioAtual.perfil === "Aluno") {
                if (certificado.status === "Pendente") item.append(this.tela.elemento("p", "Aguardando análise do gestor."));
                else if (certificado.podeSolicitar) item.append(this.tela.botaoAcao("Solicitar certificado", async () => {
                    const resposta = await this.api.requisicao("/api/certificados", "POST", { cursoId: certificado.cursoId });
                    this.tela.aviso(resposta.mensagem, "sucesso"); await this.listarCertificados();
                }));
                else item.append(this.tela.elemento("p", "Conclua todos os módulos e alcance nota 6 em cada avaliação."));
            } else if (certificado.status === "Pendente") {
                item.append(this.tela.botaoAcao("Aprovar e gerar", async () => {
                    if (!await this.tela.dialogo("Aprovar certificado", "O sistema conferirá a aprovação em todos os módulos antes da emissão.")) return;
                    const r = await this.api.requisicao("/api/certificados/" + certificado.id + "/decisao", "POST", { aprovar: true });
                    this.tela.aviso(r.mensagem, "sucesso"); await this.listarCertificados();
                }));
                item.append(this.tela.botaoAcao("Recusar", async () => {
                    const motivo = await this.tela.dialogo("Recusar certificado", "Explique ao aluno o motivo da recusa.", true, "Enviar recusa");
                    if (!motivo) return;
                    const r = await this.api.requisicao("/api/certificados/" + certificado.id + "/decisao", "POST", { aprovar: false, motivo });
                    this.tela.aviso(r.mensagem, "sucesso"); await this.listarCertificados();
                }, "perigo"));
            }
            area.append(item);
        }
    }

    // Mostra ao gestor notas atuais e histórico de tentativas de um aluno.
    async abrirDesempenho(alunoId) {
        const r = await this.api.requisicao("/api/relatorios/cursos/" + this.tela.numeroId() + "/alunos/" + alunoId);
        this.tela.campo("relatorio-aluno").hidden = false;
        this.tela.campo("nome-aluno").textContent = r.nome;
        this.tela.campo("situacao-aluno").textContent = "Tentativa atual do curso: " + r.tentativaCurso + ". " + (r.aprovadoCurso ? "Aprovado em todos os módulos do curso." : "Ainda há módulos ou avaliações pendentes.");
        this.tela.campo("modulos-relatorio").replaceChildren();
        for (const m of r.modulos) this.tela.campo("modulos-relatorio").append(this.tela.cartao(m.ordem + ". " + m.titulo,
            !m.ativo ? "Módulo inativo" : m.aprovado ? "Aprovado" : "Pendente na tentativa atual do curso"));
        this.tela.campo("avaliacoes-relatorio").replaceChildren();
        for (const a of r.avaliacoes) {
            const item = this.tela.cartao(a.modulo + " · " + a.titulo,
                a.nota == null ? "Não realizada" : "Nota " + Number(a.nota).toFixed(2) + " · " + (a.aprovado ? "Aprovado" : "Reprovado"));
            item.append(this.tela.elemento("p", "Tentativas: " + a.tentativas + (a.nota == null ? "" : " · Acertos: " + a.acertos + "/" + a.total + " · " + Number(a.percentual).toFixed(2) + "%")));
            if (!a.ativo) item.append(this.tela.elemento("p", "Avaliação inativa."));
            if (a.resultadoId) item.append(this.tela.criarLink("Ver respostas e gabarito", "resultado.html?id=" + a.resultadoId));
            this.tela.campo("avaliacoes-relatorio").append(item);
        }
        const tabela = this.tela.elemento("table"); tabela.append(this.tela.elemento("caption", "Todas as tentativas deste aluno no curso"));
        const cabecalho = this.tela.elemento("thead"), tr = this.tela.elemento("tr");
        for (const texto of ["Data", "Tentativa do curso", "Módulo / avaliação", "Acertos", "Percentual", "Nota", "Situação", "Respostas"]) tr.append(this.tela.elemento("th", texto));
        cabecalho.append(tr); tabela.append(cabecalho);
        const corpo = this.tela.elemento("tbody");
        for (const h of r.historico) {
            const linha = this.tela.elemento("tr");
            for (const texto of [this.tela.dataBrasileira(h.data), h.tentativaCurso, h.modulo + " / " + h.titulo, h.acertos + "/" + h.total,
                Number(h.percentual).toFixed(2) + "%", Number(h.nota).toFixed(2), h.aprovado ? "Aprovado" : "Reprovado"])
                linha.append(this.tela.elemento("td", texto));
            const link = this.tela.elemento("td"); link.append(this.tela.criarLink("Ver", "resultado.html?id=" + h.id, "")); linha.append(link); corpo.append(linha);
        }
        tabela.append(corpo);
        this.tela.campo("historico-relatorio").replaceChildren(tabela);
        if (!r.historico.length) this.tela.vazio(this.tela.campo("historico-relatorio"), "Este aluno ainda não realizou avaliações.");
        this.tela.campo("relatorio-aluno").scrollIntoView({ block: "start", behavior: "smooth" });
    }

    iniciar() {
        this.sessao.iniciar((this.pagina === "certificados" || this.pagina === "certificado") ? ["Aluno", "Gestor"] : this.pagina === "desempenho" ? ["Gestor"] : [], async (usuario) => {
            this.usuarioAtual = usuario;
            if (this.pagina === "chamados") document.querySelector(".introducao .subtitulo").textContent =
                usuario.perfil === "Administrador" ? "Receba e responda às solicitações dos gestores." :
                usuario.perfil === "Gestor" ? "Atenda alunos e mentores na ouvidoria. Contate o administrador pelo novo chamado." :
                usuario.perfil === "Mentor" ? "Escolha um chamado de aluno para atender. Para falar com o gestor, abra uma ouvidoria." :
                "Peça ajuda ao mentor dentro do curso ou fale com o gestor na ouvidoria.";
            if (this.pagina === "chamados") await this.configurarChamados();
            if (this.pagina === "certificados") {
                if (usuario.perfil === "Gestor") this.tela.campo("regra-certificado").textContent = "Analise as solicitações. A aprovação emite o certificado para o aluno imprimir ou salvar em PDF.";
                this.tela.campo("atualizar-certificados").onclick = () => this.listarCertificados().catch(e => this.tela.aviso(e.message, "erro"));
                await this.listarCertificados();
            }
            if (this.pagina === "certificado") {
                const certificado = await this.api.requisicao("/api/certificados/" + this.tela.numeroId());
                this.tela.campo("certificado-aluno").textContent = certificado.aluno;
                this.tela.campo("certificado-curso").textContent = certificado.curso;
                this.tela.campo("certificado-carga").textContent = certificado.carga + " horas";
                this.tela.campo("certificado-data").textContent = new Date(certificado.data).toLocaleDateString("pt-BR");
                this.tela.campo("certificado-codigo").textContent = certificado.codigo;
                this.tela.campo("certificado-gestor").textContent = certificado.gestor;
                this.tela.campo("imprimir-certificado").disabled = false;
                this.tela.campo("imprimir-certificado").onclick = () => window.print();
            }
            if (this.pagina === "desempenho") {
                const curso = await this.api.requisicao("/api/relatorios/cursos/" + this.tela.numeroId() + "/alunos");
                this.tela.campo("nome-curso").textContent = curso.nome;
                if (!curso.alunos.length) this.tela.vazio(this.tela.campo("lista"), "Nenhum aluno matriculado neste curso.");
                for (const aluno of curso.alunos) {
                    const item = this.tela.cartao(aluno.nome, aluno.email); item.append(this.tela.progresso(aluno.progresso),
                        this.tela.botaoAcao("Ver desempenho", () => this.abrirDesempenho(aluno.id))); this.tela.campo("lista").append(item);
                }
            }
        });

    }
}

new PaginaAtendimento(api, tela, sessao).iniciar();
