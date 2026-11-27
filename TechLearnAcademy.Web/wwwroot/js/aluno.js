// Monta cursos, estudo, avaliações e resultados vistos pelo aluno.
class PaginaAluno {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
        this.pagina = document.body.dataset.pagina;
    }

    // O aluno confirma antes de apagar o progresso da tentativa atual.
    botaoReiniciarCurso(cursoId) {
        return this.tela.botaoAcao("Reiniciar curso", async () => {
            if (!await this.tela.dialogo("Reiniciar curso", "O progresso de todos os módulos será zerado. Você começará uma nova tentativa do curso e poderá responder cada avaliação uma vez. As notas anteriores continuarão no histórico. Deseja reiniciar?", false, "Reiniciar curso")) return;
            await this.api.requisicao("/api/cursos/" + cursoId + "/reiniciar", "POST");
            location.href = "curso.html?id=" + cursoId;
        });
    }

    cardCurso(curso, mostrarProgresso = false) {
        const item = this.tela.cartao(curso.nome, curso.descricao);
        item.append(this.tela.elemento("p", curso.cargaHoraria + " horas"));
        if (mostrarProgresso) item.append(this.tela.progresso(curso.progresso));
        if (curso.reprovado) item.append(this.tela.elemento("p", "Você reprovou em uma avaliação. Reinicie o curso para tentar novamente."));
        item.append(this.tela.criarLink(mostrarProgresso ? "Continuar estudando" : "Ver curso", "curso.html?id=" + (curso.cursoId || curso.id)));
        return item;
    }

    // A busca consulta a API e mostra uma página de cursos por vez.
    async catalogo(paginaNumero = 1) {
        const retorno = await this.api.requisicao("/api/cursos?busca=" + encodeURIComponent(this.tela.textoCampo("busca")) + "&pagina=" + paginaNumero);
        const area = this.tela.campo("lista");
        area.replaceChildren();
        if (!retorno.itens.length) this.tela.vazio(area, "Nenhum curso disponível para esta pesquisa.");
        for (const curso of retorno.itens) area.append(this.cardCurso(curso));
        this.tela.paginacao(retorno, numero => this.catalogo(numero));
    }

    // A página usa a matrícula para decidir entre entrar no curso e matricular-se.
    async detalheCurso() {
        const curso = await this.api.requisicao("/api/cursos/" + this.tela.numeroId());
        const area = this.tela.campo("detalhes");
        area.replaceChildren(this.tela.elemento("h2", curso.nome), this.tela.elemento("p", curso.descricao), this.tela.elemento("p", curso.cargaHoraria + " horas"));
        area.append(this.tela.elemento("span", curso.matriculado ? "Você está matriculado" : "Matrícula disponível", "selo"));
        const acoes = this.tela.campo("acoes");
        acoes.replaceChildren();
        if (!curso.matriculado) {
            const botao = this.tela.elemento("button", "Matricular-se");
            botao.onclick = async () => {
                botao.disabled = true;
                try {
                    const retorno = await this.api.requisicao("/api/matriculas", "POST", { cursoId: curso.id });
                    this.tela.aviso(retorno.mensagem, "sucesso");
                    await this.detalheCurso();
                } catch (erro) { this.tela.aviso(erro.message, "erro"); }
                finally { botao.disabled = false; }
            };
            acoes.append(botao);
        }
        if (curso.matriculado) acoes.append(this.tela.criarLink("Ajuda com mentor", "chamados.html?curso=" + curso.id), this.tela.criarLink("Certificado do curso", "certificados.html?curso=" + curso.id));
        if (curso.reprovado) acoes.append(this.tela.elemento("p", "Você reprovou em uma avaliação. Para fazer novas avaliações, reinicie o curso e revise todos os módulos."), this.botaoReiniciarCurso(curso.id));
        const lista = this.tela.campo("lista");
        lista.replaceChildren();
        if (!curso.modulos.length) this.tela.vazio(lista, "Este curso ainda não possui módulos disponíveis.");
        for (const modulo of curso.modulos) {
            const item = this.tela.cartao(modulo.ordem + ". " + modulo.titulo);
            item.append(this.tela.elemento("span", modulo.concluido ? "Concluído" : "Próxima etapa", "selo"));
            if (curso.matriculado) {
                item.append(this.tela.criarLink("Estudar módulo", "estudar.html?id=" + modulo.id + "&curso=" + curso.id));
                const materiais = await this.api.requisicao("/api/modulos/" + modulo.id + "/materiais");
                for (const material of materiais) item.append(this.tela.linkMaterial(material));
            } else item.append(this.tela.elemento("p", "Matricule-se para acessar os materiais e as avaliações."));
            lista.append(item);
        }
    }

    // Materiais e conclusão são carregados para o módulo indicado no endereço.
    async estudar() {
        const curso = await this.api.requisicao("/api/cursos/" + this.tela.numeroId("curso"));
        const modulo = curso.modulos.find(item => item.id === this.tela.numeroId());
        if (!modulo) throw new Error("Módulo não encontrado neste curso.");
        this.tela.campo("detalhes").append(this.tela.elemento("h2", modulo.titulo), this.tela.elemento("p", curso.nome), this.tela.criarLink("Voltar ao curso", "curso.html?id=" + curso.id));
        const materiais = await this.api.requisicao("/api/modulos/" + modulo.id + "/materiais");
        const area = this.tela.campo("materiais");
        if (!materiais.length) this.tela.vazio(area, "Nenhum material disponível neste módulo.");
        for (const material of materiais) area.append(this.tela.linkMaterial(material));
        this.tela.campo("detalhes").append(this.tela.criarLink("Pedir ajuda ao mentor", "chamados.html?curso=" + curso.id),
            this.tela.elemento("p", "Você pode responder cada avaliação uma única vez por tentativa do curso. A nota mínima é 6. Se reprovar, será necessário reiniciar o curso inteiro."));
        if (curso.reprovado) this.tela.campo("detalhes").append(this.tela.elemento("p", "Novas avaliações estão bloqueadas por reprovação. Seus materiais continuam disponíveis para revisão."), this.botaoReiniciarCurso(curso.id));
        const botao = this.tela.campo("concluir");
        if (modulo.concluido) { botao.disabled = true; botao.textContent = "Módulo concluído"; }
        if (curso.reprovado) { botao.disabled = true; botao.textContent = "Reinicie o curso para continuar"; }
        botao.onclick = async () => {
            botao.disabled = true;
            try {
                const retorno = await this.api.requisicao("/api/progresso", "POST", { moduloId: modulo.id });
                botao.textContent = "Módulo concluído";
                this.tela.aviso(retorno.mensagem, "sucesso");
            } catch (erro) { this.tela.aviso(erro.message, "erro"); botao.disabled = false; }
        };
        const avaliacoes = await this.api.requisicao("/api/modulos/" + modulo.id + "/avaliacoes");
        const lista = this.tela.campo("lista");
        if (!avaliacoes.length) this.tela.vazio(lista, "Nenhuma avaliação disponível neste módulo.");
        for (const avaliacao of avaliacoes) {
            const item = this.tela.cartao(avaliacao.titulo, avaliacao.nota == null ? "Ainda não realizada nesta tentativa do curso" : "Nota: " + Number(avaliacao.nota).toFixed(2) + (avaliacao.aprovado ? " · Aprovado" : " · Reprovado: é necessário reiniciar o curso"));
            if (avaliacao.podeResponder) item.append(this.tela.criarLink("Responder avaliação", "avaliacao.html?id=" + avaliacao.id));
            else if (avaliacao.resultadoId) item.append(this.tela.criarLink("Ver resultado", "resultado.html?id=" + avaliacao.resultadoId));
            else item.append(this.tela.elemento("p", "Avaliação bloqueada. Reinicie o curso após a reprovação."));
            lista.append(item);
        }
    }

    // Busca a avaliação permitida para a tentativa atual do curso.
    async abrirAvaliacao() {
        const avaliacao = await this.api.requisicao("/api/avaliacoes/" + this.tela.numeroId());
        this.tela.campo("titulo-avaliacao").textContent = avaliacao.titulo;
        const area = this.tela.campo("questoes");
        const botao = this.tela.campo("form-avaliacao").querySelector("button");
        const acoes = this.tela.campo("acoes-avaliacao");
        acoes.append(this.tela.criarLink("Voltar ao curso", "curso.html?id=" + avaliacao.cursoId));
        if (!avaliacao.podeResponder) {
            this.tela.campo("andamento").textContent = avaliacao.motivoBloqueio;
            this.tela.campo("barra-prova").hidden = true;
            if (avaliacao.resultadoId) acoes.append(this.tela.criarLink("Ver resultado", "resultado.html?id=" + avaliacao.resultadoId));
            return;
        }
        if (!avaliacao.questoes.length) {
            botao.disabled = true;
            this.tela.campo("andamento").textContent = "Esta avaliação ainda não tem questões disponíveis.";
            return;
        }
        this.tela.campo("form-avaliacao").hidden = false;
        for (const [indice, questao] of avaliacao.questoes.entries()) {
            const grupo = this.tela.elemento("fieldset");
            grupo.append(this.tela.elemento("legend", (indice + 1) + ". " + questao.enunciado));
            for (const [indiceAlternativa, alternativa] of questao.alternativas.entries()) {
                const label = this.tela.elemento("label", undefined, "alternativa");
                const radio = this.tela.elemento("input");
                radio.type = "radio";
                radio.name = "questao-" + questao.id;
                radio.value = alternativa.id;
                radio.required = true;
                label.append(radio, this.tela.elemento("span", "ABCDE"[indiceAlternativa] + ") " + alternativa.texto));
                grupo.append(label);
            }
            area.append(grupo);
        }
        const atualizarAndamento = () => {
            const respondidas = area.querySelectorAll('input:checked').length;
            this.tela.campo("andamento").textContent = respondidas + " de " + avaliacao.questoes.length + " questões respondidas";
            this.tela.campo("barra-prova").value = respondidas * 100 / avaliacao.questoes.length;
        }
        area.addEventListener("change", atualizarAndamento);
        atualizarAndamento();
        this.tela.enviarFormulario("form-avaliacao", async (formulario) => {
            const dados = new FormData(formulario);
            const respostas = avaliacao.questoes.map(questao => ({
                questaoId: questao.id, alternativaId: Number(dados.get("questao-" + questao.id))
            }));
            let retorno;
            try { retorno = await this.api.requisicao("/api/avaliacoes/" + avaliacao.id + "/respostas", "POST", { respostas, tentativaCurso: avaliacao.tentativaCurso }); }
            catch (erro) {
                if (erro.status === 409) {
                    formulario.hidden = true;
                    this.tela.campo("barra-prova").hidden = true;
                    this.tela.campo("andamento").textContent = erro.message;
                }
                throw erro;
            }
            location.href = "resultado.html?id=" + retorno.id;
        }, "Enviando respostas...");
    }

    // Exibe a nota e a aprovação devolvidas pela API.
    async mostrarResultado(usuario) {
        const resultado = await this.api.requisicao("/api/resultados/" + this.tela.numeroId());
        this.tela.metricas([["Acertos", resultado.acertos], ["Erros", resultado.total - resultado.acertos],
            ["Percentual", Number(resultado.percentual).toFixed(1) + "%"], ["Nota", Number(resultado.nota).toFixed(1) + " / 10"]]);
        const detalhe = this.tela.cartao(resultado.titulo, resultado.aprovado ? "Aprovado: você atingiu pelo menos 60% de acertos." : "Reprovado nesta avaliação. Uma nova avaliação só será permitida após reiniciar o curso.");
        detalhe.append(this.tela.elemento("p", "Tentativa do curso: " + resultado.tentativaCurso));
        detalhe.append(this.tela.progresso(resultado.progresso));
        if (resultado.cursoId && usuario.perfil === "Aluno") {
            detalhe.append(this.tela.criarLink("Voltar ao curso", "curso.html?id=" + resultado.cursoId));
            if (resultado.podeReiniciar) detalhe.append(this.botaoReiniciarCurso(resultado.cursoId));
            detalhe.append(this.tela.criarLink("Certificados", "certificados.html?curso=" + resultado.cursoId));
        }
        this.tela.campo("detalhes").append(detalhe);
        for (const resposta of resultado.respostas) {
            const item = this.tela.cartao(resposta.enunciado, "Sua resposta: " + resposta.texto);
            item.append(this.tela.elemento("span", resposta.correta ? "Acerto" : "Erro", "selo"));
            if (!resposta.correta) item.append(this.tela.elemento("p", "Resposta correta: " + resposta.respostaCorreta));
            this.tela.campo("lista").append(item);
        }
    }

    iniciar() {
        this.sessao.iniciar(this.pagina === "resultado" && this.tela.numeroId() ? ["Aluno", "Mentor", "Gestor"] : ["Aluno"], async (usuario) => {
            if (this.pagina === "painel") {
                const painel = await this.api.requisicao("/api/aluno/painel");
                this.tela.metricas([["Cursos matriculados", painel.cursosMatriculados], ["Progresso geral", Number(painel.progressoGeral).toFixed(1) + "%"]]);
                this.tela.listarResultados(painel.avaliacoesRecentes, this.tela.campo("lista"));
                const orientacoes = await this.api.requisicao("/api/aluno/orientacoes");
                if (!orientacoes.length) this.tela.vazio(this.tela.campo("orientacoes"), "Seu mentor ainda não registrou orientações.");
                for (const orientacao of orientacoes) {
                    const item = this.tela.cartao(orientacao.mentor, orientacao.texto);
                    item.append(this.tela.elemento("p", this.tela.dataBrasileira(orientacao.data), "ajuda"));
                    this.tela.campo("orientacoes").append(item);
                }
            }
            if (this.pagina === "cursos") {
                this.tela.campo("form-busca").addEventListener("submit", (evento) => {
                    evento.preventDefault();
                    this.catalogo().catch(erro => this.tela.aviso(erro.message, "erro"));
                });
                await this.catalogo();
            }
            if (this.pagina === "curso") await this.detalheCurso();
            if (this.pagina === "meus") {
                const cursos = await this.api.requisicao("/api/matriculas/minhas");
                if (!cursos.length) this.tela.vazio(this.tela.campo("lista"), "Você ainda não está matriculado. Explore o catálogo para começar.");
                for (const curso of cursos) this.tela.campo("lista").append(this.cardCurso(curso, true));
            }
            if (this.pagina === "estudar") await this.estudar();
            if (this.pagina === "avaliacao") await this.abrirAvaliacao();
            if (this.pagina === "resultado") {
                if (this.tela.numeroId()) await this.mostrarResultado(usuario);
                else this.tela.listarResultados(await this.api.requisicao("/api/resultados"), this.tela.campo("lista"));
            }
        });

    }
}

new PaginaAluno(api, tela, sessao).iniciar();
