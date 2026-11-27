// Monta os formulários de conteúdo, avaliações e relatórios do gestor.
class PaginaGestor {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
        this.pagina = document.body.dataset.pagina;
        this.materialTemArquivo = false;
        this.avaliacaoAtual = 0;
        this.contadorAlternativas = 0;
    }

    async todosCursos() {
        let paginaNumero = 1;
        let retorno;
        const cursos = [];
        do {
            retorno = await this.api.requisicao("/api/cursos?todos=true&pagina=" + paginaNumero);
            for (const curso of retorno.itens) cursos.push(curso);
            paginaNumero++;
        } while (paginaNumero <= retorno.totalPaginas);
        return cursos;
    }

    async selecionarCursos() {
        for (const curso of await this.todosCursos()) {
            const opcao = this.tela.elemento("option", curso.nome + (curso.ativo ? "" : " (inativo)"));
            opcao.value = curso.id;
            this.tela.campo("curso-selecionado").append(opcao);
        }
    }

    limparSelect(id, texto) {
        const opcao = this.tela.elemento("option", texto);
        opcao.value = "";
        this.tela.campo(id).replaceChildren(opcao);
    }

    async carregarModulos() {
        this.limparSelect("modulo-selecionado", "Selecione um módulo");
        if (!this.tela.valor("curso-selecionado")) return [];
        const curso = await this.api.requisicao("/api/cursos/" + this.tela.valor("curso-selecionado"));
        for (const modulo of curso.modulos) {
            const opcao = this.tela.elemento("option", modulo.ordem + ". " + modulo.titulo + (modulo.ativo ? "" : " (inativo)"));
            opcao.value = modulo.id;
            this.tela.campo("modulo-selecionado").append(opcao);
        }
        return curso.modulos;
    }

    editarBotao(tarefa) {
        const botao = this.tela.elemento("button", "Editar", "secundario");
        botao.type = "button";
        botao.onclick = tarefa;
        return botao;
    }

    // Confirma a exclusão antes de chamar a rota correspondente na API.
    excluirBotao(tipo, id, nome, atualizar) {
        return this.tela.botaoAcao("Excluir", async () => {
            if (!await this.tela.dialogo("Excluir " + tipo, "Deseja excluir " + nome + "? O conteúdo sairá do site. O histórico de notas e certificados será preservado.", false, "Excluir")) return;
            const rotas = { curso: "cursos", módulo: "modulos", material: "materiais", avaliação: "avaliacoes" };
            const retorno = await this.api.requisicao("/api/" + rotas[tipo] + "/" + id, "DELETE");
            this.tela.aviso(retorno.mensagem, "sucesso"); await atualizar();
        }, "perigo");
    }

    // Mostra cursos paginados e oferece edição e exclusão em cada cartão.
    async listarCursos(paginaNumero = 1) {
        const retorno = await this.api.requisicao("/api/cursos?todos=true&busca=" + encodeURIComponent(this.tela.textoCampo("busca")) + "&pagina=" + paginaNumero);
        const area = this.tela.campo("lista");
        area.replaceChildren();
        if (!retorno.itens.length) this.tela.vazio(area, "Nenhum curso encontrado. Cadastre o primeiro curso.");
        for (const curso of retorno.itens) {
            const item = this.tela.cartao(curso.nome, curso.descricao);
            item.append(this.tela.elemento("p", curso.cargaHoraria + " horas · " + (curso.ativo ? "Ativo" : "Inativo")));
            item.append(this.editarBotao(() => {
                this.tela.campo("curso-id").value = curso.id;
                this.tela.campo("nome").value = curso.nome;
                this.tela.campo("descricao").value = curso.descricao;
                this.tela.campo("carga").value = curso.cargaHoraria;
                this.tela.campo("ativo").value = String(curso.ativo);
                this.tela.campo("ativo").disabled = false;
                this.tela.campo("titulo-form").textContent = "Editar curso";
                this.tela.campo("nome").focus();
            }));
            item.append(this.excluirBotao("curso", curso.id, curso.nome, () => this.listarCursos()));
            area.append(item);
        }
        this.tela.paginacao(retorno, numero => this.listarCursos(numero));
    }

    async configurarCursos() {
        // Novos registros são ativos; a situação muda durante a edição.
        this.tela.campo("ativo").disabled = true;
        this.tela.campo("cancelar").onclick = () => {
            this.tela.campo("form-curso").reset();
            this.tela.campo("curso-id").value = "0";
            this.tela.campo("ativo").disabled = true;
            this.tela.campo("titulo-form").textContent = "Novo curso";
            this.tela.campo("nome").focus();
        };
        this.tela.campo("form-busca").onsubmit = (evento) => {
            evento.preventDefault();
            this.listarCursos().catch(erro => this.tela.aviso(erro.message, "erro"));
        };
        this.tela.enviarFormulario("form-curso", async () => {
            const id = Number(this.tela.valor("curso-id"));
            const dados = { nome: this.tela.textoCampo("nome"), descricao: this.tela.textoCampo("descricao"), cargaHoraria: Number(this.tela.valor("carga")) };
            if (!dados.nome || !dados.descricao) throw new Error("Preencha o nome e a descrição do curso.");
            if (id) dados.ativo = this.tela.valor("ativo") === "true";
            const retorno = await this.api.requisicao("/api/cursos" + (id ? "/" + id : ""), id ? "PUT" : "POST", dados);
            this.tela.campo("cancelar").click();
            this.tela.aviso(retorno.mensagem, "sucesso");
            await this.listarCursos();
        });
        await this.listarCursos();
    }

    // Busca apenas os materiais do módulo escolhido pelo gestor.
    async listarMateriais() {
        const area = this.tela.campo("materiais");
        area.replaceChildren();
        if (!this.tela.valor("modulo-selecionado")) { this.tela.vazio(area, "Selecione um módulo para consultar seus materiais."); return; }
        const materiais = await this.api.requisicao("/api/modulos/" + this.tela.valor("modulo-selecionado") + "/materiais");
        if (!materiais.length) this.tela.vazio(area, "Este módulo ainda não tem materiais.");
        for (const material of materiais) {
            const item = this.tela.cartao(material.titulo, material.tipo + " · " + (material.ativo ? "Ativo" : "Inativo"));
            item.append(this.tela.linkMaterial(material));
            item.append(this.editarBotao(() => {
                this.tela.campo("material-id").value = material.id;
                this.tela.campo("material-titulo").value = material.titulo;
                this.tela.campo("tipo").value = material.tipo;
                this.tela.campo("url").value = material.url;
                this.materialTemArquivo = material.arquivo;
                this.tela.campo("origem-material").value = material.arquivo ? "arquivo" : "link";
                this.tela.campo("arquivo-pdf").value = "";
                this.configurarOrigemMaterial();
                this.tela.campo("material-ativo").value = String(material.ativo);
                this.tela.campo("material-ativo").disabled = false;
                this.tela.campo("titulo-material").textContent = "Editar material";
                this.tela.campo("material-titulo").focus();
            }));
            item.append(this.excluirBotao("material", material.id, material.titulo, () => this.listarMateriais()));
            area.append(item);
        }
    }

    // Exibe o limite de quatro módulos e os materiais do módulo selecionado.
    async listarModulos() {
        const modulos = await this.carregarModulos();
        this.tela.campo("limite-modulos").textContent = modulos.length + " de 4 módulos cadastrados. É possível adicionar vários materiais em cada módulo.";
        const area = this.tela.campo("modulos");
        area.replaceChildren();
        if (!modulos.length) this.tela.vazio(area, "Nenhum módulo neste curso.");
        for (const modulo of modulos) {
            const item = this.tela.cartao(modulo.ordem + ". " + modulo.titulo, modulo.ativo ? "Ativo" : "Inativo");
            item.append(this.editarBotao(() => {
                this.tela.campo("modulo-id").value = modulo.id;
                this.tela.campo("titulo").value = modulo.titulo;
                this.tela.campo("ordem").value = modulo.ordem;
                this.tela.campo("modulo-ativo").value = String(modulo.ativo);
                this.tela.campo("modulo-ativo").disabled = false;
                this.tela.campo("titulo-modulo").textContent = "Editar módulo";
                this.tela.campo("titulo").focus();
            }));
            item.append(this.excluirBotao("módulo", modulo.id, modulo.titulo, () => this.listarModulos()));
            area.append(item);
        }
        await this.listarMateriais();
    }


    // Alterna entre o campo de link e o envio de um arquivo PDF.
    configurarOrigemMaterial() {
        const arquivo = this.tela.valor("origem-material") === "arquivo";
        this.tela.campo("campo-link").hidden = arquivo;
        this.tela.campo("campo-arquivo").hidden = !arquivo;
        this.tela.campo("url").required = !arquivo;
        this.tela.campo("arquivo-pdf").required = arquivo && !this.materialTemArquivo;
        this.tela.campo("tipo").disabled = arquivo;
        if (arquivo) this.tela.campo("tipo").value = "PDF";
    }

    // Liga os formulários de módulo e material às respectivas rotas da API.
    async configurarConteudo() {
        this.tela.campo("origem-material").onchange = () => this.configurarOrigemMaterial();
        this.configurarOrigemMaterial();
        this.tela.campo("modulo-ativo").disabled = true;
        this.tela.campo("material-ativo").disabled = true;
        await this.selecionarCursos();
        this.tela.campo("curso-selecionado").onchange = () => {
            this.tela.campo("novo-modulo").click();
            this.tela.campo("novo-material").click();
            this.listarModulos().catch(erro => this.tela.aviso(erro.message, "erro"));
        };
        this.tela.campo("modulo-selecionado").onchange = () => {
            this.tela.campo("novo-material").click();
            this.listarMateriais().catch(erro => this.tela.aviso(erro.message, "erro"));
        };
        this.tela.campo("novo-modulo").onclick = () => {
            this.tela.campo("form-modulo").reset();
            this.tela.campo("modulo-id").value = "0";
            this.tela.campo("modulo-ativo").disabled = true;
            this.tela.campo("titulo-modulo").textContent = "Novo módulo";
        };
        this.tela.campo("novo-material").onclick = () => {
            delete this.tela.campo("form-material").dataset.pendente;
            this.tela.campo("material-id").value = "0";
            this.tela.campo("material-titulo").value = "";
            this.tela.campo("url").value = "";
            this.tela.campo("tipo").value = "PDF";
            this.tela.campo("material-ativo").value = "true";
            this.tela.campo("material-ativo").disabled = true;
            this.tela.campo("titulo-material").textContent = "Novo material";
            this.materialTemArquivo = false;
            this.tela.campo("origem-material").value = "arquivo";
            this.tela.campo("arquivo-pdf").value = "";
            this.configurarOrigemMaterial();
        };
        this.tela.enviarFormulario("form-modulo", async () => {
            const id = Number(this.tela.valor("modulo-id"));
            const dados = { titulo: this.tela.textoCampo("titulo"), ordem: Number(this.tela.valor("ordem")) };
            if (!dados.titulo) throw new Error("Informe o título do módulo.");
            if (!this.tela.valor("curso-selecionado")) throw new Error("Selecione um curso.");
            if (id) dados.ativo = this.tela.valor("modulo-ativo") === "true";
            else dados.cursoId = Number(this.tela.valor("curso-selecionado"));
            const retorno = await this.api.requisicao("/api/modulos" + (id ? "/" + id : ""), id ? "PUT" : "POST", dados);
            this.tela.campo("novo-modulo").click();
            this.tela.aviso(retorno.mensagem, "sucesso");
            await this.listarModulos();
        });
        this.tela.enviarFormulario("form-material", async () => {
            const id = Number(this.tela.valor("material-id"));
            if (!this.tela.valor("modulo-selecionado")) throw new Error("Selecione um módulo.");
            const titulo = this.tela.textoCampo("material-titulo");
            const ativo = !id || this.tela.valor("material-ativo") === "true";
            let retorno;
            if (this.tela.valor("origem-material") === "arquivo" && this.tela.campo("arquivo-pdf").files.length) {
                const arquivo = this.tela.campo("arquivo-pdf").files[0];
                if (arquivo.size > 10 * 1024 * 1024) throw new Error("O PDF deve ter até 10 MB.");
                const dados = new FormData();
                dados.append("arquivo", arquivo); dados.append("titulo", titulo);
                dados.append("moduloId", this.tela.valor("modulo-selecionado")); dados.append("ativo", ativo);
                retorno = await this.api.requisicao(id ? "/api/materiais/" + id + "/pdf" : "/api/materiais/pdf", id ? "PUT" : "POST", dados);
            } else {
                if (this.tela.valor("origem-material") === "arquivo" && !this.materialTemArquivo) throw new Error("Selecione um PDF.");
                const dados = { titulo, ativo, tipo: this.tela.valor("tipo"), url: this.tela.valor("origem-material") === "arquivo" ? "" : this.tela.textoCampo("url"), moduloId: Number(this.tela.valor("modulo-selecionado")) };
                retorno = await this.api.requisicao("/api/materiais" + (id ? "/" + id : ""), id ? "PUT" : "POST", dados);
            }
            this.tela.campo("novo-material").click();
            this.tela.aviso(retorno.mensagem, "sucesso");
            await this.listarMateriais();
        });
        this.tela.vazio(this.tela.campo("modulos"), "Selecione um curso para começar.");
        this.tela.vazio(this.tela.campo("materiais"), "Selecione um módulo para consultar seus materiais.");
    }


    // A interface só permite até cinco opções, identificadas de A a E.
    adicionarAlternativa(texto = "", correta = false) {
        if (this.contadorAlternativas >= 5) { this.tela.aviso("Uma questão pode ter no máximo cinco alternativas: A a E.", "erro"); return; }
        const indice = this.contadorAlternativas++;
        this.tela.campo("adicionar-alternativa").disabled = this.contadorAlternativas >= 5;
        const bloco = this.tela.elemento("div", undefined, "linha");
        const id = "alternativa-" + indice;
        const label = this.tela.elemento("label", "Alternativa " + "ABCDE"[indice]);
        label.htmlFor = id;
        const entrada = this.tela.elemento("input");
        entrada.id = id;
        entrada.type = "text";
        entrada.className = "texto-alternativa";
        entrada.value = texto;
        entrada.maxLength = 1000;
        const gabarito = this.tela.elemento("label", undefined, "alternativa");
        const radio = this.tela.elemento("input");
        radio.type = "radio";
        radio.name = "gabarito";
        radio.value = indice;
        radio.checked = correta;
        gabarito.append(radio, this.tela.elemento("span", "Esta é a alternativa correta"));
        bloco.append(label, entrada, gabarito);
        this.tela.campo("alternativas").append(bloco);
    }

    novaQuestao() {
        this.tela.campo("form-questao").reset();
        this.tela.campo("questao-id").value = "0";
        this.tela.campo("questao-ativo").disabled = true;
        this.tela.campo("titulo-form-questao").textContent = "Nova questão";
        this.tela.campo("alternativas").replaceChildren();
        this.contadorAlternativas = 0;
        this.tela.campo("adicionar-alternativa").disabled = false;
        this.adicionarAlternativa();
        this.adicionarAlternativa();
    }

    // Mostra questões e gabarito somente na tela de gestão.
    async abrirQuestoes(id, titulo) {
        this.avaliacaoAtual = id;
        this.tela.campo("avaliacao-atual").textContent = titulo;
        this.novaQuestao();
        const avaliacao = await this.api.requisicao("/api/avaliacoes/" + id);
        const area = this.tela.campo("questoes");
        area.replaceChildren();
        if (!avaliacao.questoes.length) this.tela.vazio(area, "Esta avaliação ainda não tem questões.");
        for (const questao of avaliacao.questoes) {
            const item = this.tela.cartao(questao.enunciado, questao.ativo === false ? "Inativa" : "Ativa");
            for (const [i, alternativa] of questao.alternativas.entries()) item.append(this.tela.elemento("p", "ABCDE"[i] + ") " + (alternativa.correta ? "✓ " : "") + alternativa.texto));
            item.append(this.editarBotao(() => {
                this.tela.campo("questao-id").value = questao.id;
                this.tela.campo("enunciado").value = questao.enunciado;
                this.tela.campo("questao-ativo").value = String(questao.ativo !== false);
                this.tela.campo("questao-ativo").disabled = false;
                this.tela.campo("titulo-form-questao").textContent = "Editar questão";
                this.tela.campo("alternativas").replaceChildren();
                this.contadorAlternativas = 0;
                this.tela.campo("adicionar-alternativa").disabled = false;
                for (const alternativa of questao.alternativas) this.adicionarAlternativa(alternativa.texto, alternativa.correta);
                this.tela.campo("enunciado").focus();
            }));
            area.append(item);
        }
    }

    async listarAvaliacoes() {
        const area = this.tela.campo("avaliacoes");
        area.replaceChildren();
        this.avaliacaoAtual = 0;
        this.tela.campo("avaliacao-atual").textContent = "Selecione uma avaliação.";
        this.tela.campo("questoes").replaceChildren();
        if (!this.tela.valor("modulo-selecionado")) { this.tela.vazio(area, "Selecione um módulo."); return; }
        const lista = await this.api.requisicao("/api/modulos/" + this.tela.valor("modulo-selecionado") + "/avaliacoes");
        if (!lista.length) this.tela.vazio(area, "Este módulo ainda não possui avaliações.");
        for (const avaliacao of lista) {
            const item = this.tela.cartao(avaliacao.titulo, avaliacao.ativo ? "Ativa" : "Inativa");
            item.append(this.editarBotao(() => {
                this.tela.campo("avaliacao-id").value = avaliacao.id;
                this.tela.campo("titulo").value = avaliacao.titulo;
                this.tela.campo("avaliacao-ativo").value = String(avaliacao.ativo);
                this.tela.campo("avaliacao-ativo").disabled = false;
                this.tela.campo("titulo-form-avaliacao").textContent = "Editar avaliação";
                this.abrirQuestoes(avaliacao.id, avaliacao.titulo).catch(erro => this.tela.aviso(erro.message, "erro"));
            }));
            const botao = this.tela.elemento("button", "Questões e gabarito", "secundario");
            botao.type = "button";
            botao.onclick = () => this.abrirQuestoes(avaliacao.id, avaliacao.titulo).catch(erro => this.tela.aviso(erro.message, "erro"));
            item.append(botao, this.excluirBotao("avaliação", avaliacao.id, avaliacao.titulo, () => this.listarAvaliacoes()));
            area.append(item);
        }
    }

    // Liga os formulários de avaliações e questões às rotas da API.
    async configurarAvaliacoes() {
        this.tela.campo("avaliacao-ativo").disabled = true;
        await this.selecionarCursos();
        this.novaQuestao();
        this.tela.campo("curso-selecionado").onchange = async () => {
            this.tela.campo("nova-avaliacao").click();
            try { await this.carregarModulos(); await this.listarAvaliacoes(); }
            catch (erro) { this.tela.aviso(erro.message, "erro"); }
        };
        this.tela.campo("modulo-selecionado").onchange = () => {
            this.tela.campo("nova-avaliacao").click();
            this.listarAvaliacoes().catch(erro => this.tela.aviso(erro.message, "erro"));
        };
        this.tela.campo("nova-avaliacao").onclick = () => {
            this.tela.campo("form-avaliacao").reset();
            this.tela.campo("avaliacao-id").value = "0";
            this.tela.campo("avaliacao-ativo").disabled = true;
            this.tela.campo("titulo-form-avaliacao").textContent = "Nova avaliação";
        };
        this.tela.campo("nova-questao").onclick = () => this.novaQuestao();
        this.tela.campo("adicionar-alternativa").onclick = () => this.adicionarAlternativa();
        this.tela.enviarFormulario("form-avaliacao", async () => {
            if (!this.tela.valor("modulo-selecionado")) throw new Error("Selecione um módulo.");
            const id = Number(this.tela.valor("avaliacao-id"));
            const dados = { titulo: this.tela.textoCampo("titulo") };
            if (!dados.titulo) throw new Error("Informe o título da avaliação.");
            if (id) dados.ativo = this.tela.valor("avaliacao-ativo") === "true";
            else dados.moduloId = Number(this.tela.valor("modulo-selecionado"));
            const retorno = await this.api.requisicao("/api/avaliacoes" + (id ? "/" + id : ""), id ? "PUT" : "POST", dados);
            this.tela.campo("nova-avaliacao").click();
            this.tela.aviso(retorno.mensagem, "sucesso");
            await this.listarAvaliacoes();
        });
        this.tela.enviarFormulario("form-questao", async () => {
            if (!this.avaliacaoAtual) throw new Error("Selecione uma avaliação.");
            const marcada = this.tela.campo("alternativas").querySelector('input[name="gabarito"]:checked');
            if (!marcada) throw new Error("Marque uma alternativa correta.");
            const entradas = this.tela.campo("alternativas").querySelectorAll(".texto-alternativa");
            const alternativas = [];
            for (const [indice, entrada] of Array.from(entradas).entries()) {
                const texto = entrada.value.trim();
                if (texto) alternativas.push({ texto: texto, correta: indice === Number(marcada.value) });
            }
            if (alternativas.length < 2) throw new Error("Preencha pelo menos duas alternativas.");
            if (!alternativas.some(item => item.correta)) throw new Error("A alternativa correta não pode estar vazia.");
            const id = Number(this.tela.valor("questao-id"));
            const dados = { enunciado: this.tela.textoCampo("enunciado"), alternativas: alternativas };
            if (!dados.enunciado) throw new Error("Escreva o enunciado.");
            if (id) dados.ativo = this.tela.valor("questao-ativo") === "true";
            else dados.avaliacaoId = this.avaliacaoAtual;
            const retorno = await this.api.requisicao("/api/questoes" + (id ? "/" + id : ""), id ? "PUT" : "POST", dados);
            this.tela.aviso(retorno.mensagem, "sucesso");
            await this.abrirQuestoes(this.avaliacaoAtual, this.tela.campo("avaliacao-atual").textContent);
        });
        this.tela.vazio(this.tela.campo("avaliacoes"), "Selecione um curso e um módulo.");
        this.tela.vazio(this.tela.campo("questoes"), "Selecione uma avaliação para consultar suas questões.");
    }

    // Monta os indicadores e os links para notas detalhadas de cada curso.
    async relatorio() {
        const retorno = await this.api.requisicao("/api/relatorios");
        if (!Array.isArray(retorno.cursos) || !Array.isArray(retorno.atendimentos) || !Array.isArray(retorno.chamadosMentores))
            throw new Error("A API aberta está em uma versão antiga. Pare e inicie o projeto TechLearnAcademy.Api desta solução.");
        this.tela.metricas([["Cursos", retorno.quantidadeCursos], ["Matrículas", retorno.totalMatriculas],
            ["Média das tentativas", Number(retorno.mediaGeral).toFixed(1)], ["Aprovação nas tentativas", Number(retorno.aprovacao).toFixed(1) + "%"]]);
        if (this.pagina !== "relatorios") return;
        this.tela.campo("lista").replaceChildren();
        if (!retorno.cursos.length) this.tela.vazio(this.tela.campo("lista"), "Nenhum curso cadastrado.");
        for (const curso of retorno.cursos) {
            const item = this.tela.cartao(curso.nome, curso.matriculas + " matrículas");
            item.append(this.tela.elemento("p", "Média " + Number(curso.media).toFixed(1) + " · Aprovação " + Number(curso.aprovacao).toFixed(1) + "%"),
                this.tela.criarLink("Ver alunos e notas", "desempenho-curso.html?id=" + curso.cursoId));
            this.tela.campo("lista").append(item);
        }
        const tabela = this.tela.elemento("table"), head = this.tela.elemento("thead"), linha = this.tela.elemento("tr");
        tabela.append(this.tela.elemento("caption", "Chamados assumidos e encerrados por mentor ou gestor"));
        for (const titulo of ["Responsável", "Perfil", "Assumidos", "Encerrados"]) linha.append(this.tela.elemento("th", titulo));
        head.append(linha); tabela.append(head);
        const body = this.tela.elemento("tbody");
        for (const a of retorno.atendimentos) {
            const tr = this.tela.elemento("tr");
            for (const v of [a.nome, a.perfil, a.assumidos, a.encerrados]) tr.append(this.tela.elemento("td", v));
            body.append(tr);
        }
        tabela.append(body); this.tela.campo("atendimentos").replaceChildren(tabela);
        this.tela.campo("chamados-mentores").replaceChildren();
        if (!retorno.chamadosMentores.length) this.tela.vazio(this.tela.campo("chamados-mentores"), "Nenhum chamado de aluno foi assumido por um mentor.");
        for (const c of retorno.chamadosMentores) {
            const item = this.tela.cartao("Mentor: " + c.responsavel, "Aluno: " + c.solicitante + " · Curso: " + c.curso);
            item.append(this.tela.elemento("p", "#" + c.id + " · " + c.assunto + " · " + c.status), this.tela.criarLink("Ver conversa", "chamados.html?id=" + c.id));
            this.tela.campo("chamados-mentores").append(item);
        }
    }

    iniciar() {
        this.sessao.iniciar(["Gestor"], async () => {
            if (this.pagina === "painel" || this.pagina === "relatorios") await this.relatorio();
            if (this.pagina === "cursos") await this.configurarCursos();
            if (this.pagina === "conteudo") await this.configurarConteudo();
            if (this.pagina === "avaliacoes") await this.configurarAvaliacoes();
        });

    }
}

new PaginaGestor(api, tela, sessao).iniciar();
