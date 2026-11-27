// Objetos comuns usados pelas páginas. A API C# continua responsável pelas regras e pelo banco.
class ClienteApi {
    constructor(urlBase) { this.urlBase = urlBase; }
    // Envia JSON ou formulário mantendo o cookie HttpOnly na requisição.
    async requisicao(caminho, metodo = "GET", dados) {
        const opcoes = { method: metodo, credentials: "include", cache: "no-store" };
        if (dados !== undefined) {
            if (dados instanceof FormData) opcoes.body = dados;
            else {
                opcoes.headers = { "Content-Type": "application/json" };
                opcoes.body = JSON.stringify(dados);
            }
        }
        let resposta;
        try { resposta = await fetch(this.urlBase + caminho, opcoes); }
        catch { throw new Error("Não foi possível conectar ao servidor. Verifique se a API está ligada."); }
        const texto = await resposta.text();
        let retorno = {};
        if (texto) {
            try { retorno = JSON.parse(texto); }
            catch { throw new Error("O servidor devolveu uma resposta inesperada."); }
        }
        if (!resposta.ok) {
            const erro = new Error(retorno.mensagem || "Não foi possível concluir a solicitação.");
            erro.status = resposta.status;
            throw erro;
        }
        return retorno;
    }

}

// Cria elementos, mensagens e formulários sem colocar regras de negócio na tela.
class InterfaceSite {
    constructor(documento, clienteApi) {
        this.documento = documento;
        this.api = clienteApi;
        this.atualizador = null;
    }
    campo(id) { return this.documento.getElementById(id); }

    elemento(tag, texto, classe) {
        const item = this.documento.createElement(tag);
        if (texto !== undefined) item.textContent = texto;
        if (classe) item.className = classe;
        return item;
    }

    aviso(texto, tipo = "informacao") {
        const mensagem = this.campo("mensagem");
        mensagem.textContent = texto;
        mensagem.className = "mensagem " + tipo;
        mensagem.setAttribute("role", tipo === "erro" ? "alert" : "status");
        if (tipo === "erro") {
            mensagem.tabIndex = -1;
            mensagem.focus({ preventScroll: true });
            mensagem.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }

    criarLink(texto, destino, classe = "botao secundario") {
        const link = this.elemento("a", texto, classe);
        link.href = destino;
        return link;
    }

    cartao(titulo, texto) {
        const item = this.elemento("article", undefined, "cartao");
        item.append(this.elemento("h2", titulo));
        if (texto) item.append(this.elemento("p", texto));
        return item;
    }

    vazio(area, texto = "Nenhum registro encontrado.") {
        area.replaceChildren(this.elemento("p", texto, "vazio"));
    }

    progresso(valor) {
        const numero = Number(valor) || 0;
        const bloco = this.elemento("div", undefined, "progresso");
        const barra = this.elemento("progress");
        barra.max = 100;
        barra.value = numero;
        barra.setAttribute("aria-label", "Progresso: " + numero.toFixed(1) + "%");
        bloco.append(barra, this.elemento("span", numero.toFixed(1) + "% concluído"));
        return bloco;
    }

    numeroId(nome = "id") {
        return Number(new URLSearchParams(location.search).get(nome)) || 0;
    }

    dataBrasileira(valor) {
        // O SQL guarda datas em UTC; valores sem fuso recebem a indicação Z.
        const texto = String(valor);
        const utc = /Z$|[+-]\d{2}:\d{2}$/.test(texto) ? texto : texto + "Z";
        return new Date(utc).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    }

    valor(id) { return this.campo(id).value; }

    textoCampo(id) { return this.valor(id).trim(); }

    configurarSexo(selecao, areaOutro, campoOutro) {
        const atualizar = () => {
            const outro = this.valor(selecao) === "Outro";
            this.campo(areaOutro).hidden = !outro;
            this.campo(campoOutro).required = outro;
            if (!outro) this.campo(campoOutro).value = "";
        };
        this.campo(selecao).addEventListener("change", atualizar);
        atualizar();
    }

    metricas(dados) {
        const area = this.campo("metricas");
        area.replaceChildren();
        for (const dado of dados) {
            const item = this.cartao(dado[0]);
            item.append(this.elemento("strong", dado[1], "numero"));
            area.append(item);
        }
    }

    // Desativa o botão durante o envio e apresenta o retorno perto do formulário.
    enviarFormulario(id, tarefa, texto = "Salvando...") {
        const formulario = this.campo(id);
        formulario.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            if (!formulario.reportValidity()) return;
            const botao = formulario.querySelector('button[type="submit"]');
            const anterior = botao.textContent;
            botao.disabled = true;
            botao.textContent = texto;
            this.aviso(texto);
            try { await tarefa(formulario); delete formulario.dataset.pendente; this.atualizador.aplicarAtualizacao(); }
            catch (erro) { this.aviso(erro.message, "erro"); }
            finally { botao.disabled = false; botao.textContent = anterior; }
        });
    }

    paginacao(retorno, carregar) {
        const area = this.campo("paginacao");
        area.replaceChildren();
        if (retorno.totalPaginas < 2) return;
        const anterior = this.elemento("button", "Anterior", "secundario");
        anterior.disabled = retorno.pagina <= 1;
        anterior.onclick = () => carregar(retorno.pagina - 1).catch(erro => this.aviso(erro.message, "erro"));
        const proximo = this.elemento("button", "Próxima", "secundario");
        proximo.disabled = retorno.pagina >= retorno.totalPaginas;
        proximo.onclick = () => carregar(retorno.pagina + 1).catch(erro => this.aviso(erro.message, "erro"));
        area.append(anterior, this.elemento("span", "Página " + retorno.pagina + " de " + retorno.totalPaginas), proximo);
    }

    linkMaterial(material) {
        if (material.arquivo) {
            const link = this.criarLink("PDF · " + material.titulo, this.api.urlBase + "/api/materiais/" + material.id + "/arquivo", "material");
            link.target = "_blank"; link.rel = "noopener";
            return link;
        }
        const url = new URL(material.url);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("O material tem um endereço inválido.");
        const link = this.criarLink(material.tipo + " · " + material.titulo, url.href, "material");
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        return link;
    }

    listarResultados(lista, area) {
        area.replaceChildren();
        if (!lista.length) { this.vazio(area, "Você ainda não tem avaliações realizadas."); return; }
        for (const resultado of lista) {
            const item = this.cartao(resultado.titulo, "Nota " + Number(resultado.nota).toFixed(1) + " · " + (resultado.aprovado ? "Aprovado" : "Não aprovado"));
            item.append(this.criarLink("Ver resultado", "resultado.html?id=" + resultado.id));
            area.append(item);
        }
    }

    dialogo(titulo, texto, pedirTexto = false, confirmar = "Confirmar") {
        return new Promise((resolver) => {
            const janela = this.elemento("dialog", undefined, "dialogo");
            const form = this.elemento("form");
            const cabecalho = this.elemento("h2", titulo);
            cabecalho.id = "titulo-dialogo"; janela.setAttribute("aria-labelledby", cabecalho.id);
            form.append(cabecalho, this.elemento("p", texto));
            let entrada;
            if (pedirTexto) {
                const label = this.elemento("label", "Motivo"); label.htmlFor = "texto-dialogo";
                entrada = this.elemento("textarea"); entrada.id = label.htmlFor;
                entrada.required = true; entrada.minLength = 3; entrada.maxLength = 1000;
                form.append(label, entrada);
            }
            const acoes = this.elemento("div", undefined, "acoes");
            const cancelar = this.elemento("button", "Cancelar", "secundario");
            cancelar.type = "button"; cancelar.onclick = () => janela.close();
            cancelar.hidden = confirmar === "Entendi";
            const aceitar = this.elemento("button", confirmar); aceitar.type = "submit";
            acoes.append(cancelar, aceitar); form.append(acoes); janela.append(form);
            form.onsubmit = (evento) => {
                evento.preventDefault();
                if (entrada && entrada.value.trim().length < 3) {
                    entrada.setCustomValidity("Escreva um motivo com pelo menos 3 caracteres."); entrada.reportValidity(); return;
                }
                janela.close("confirmado");
            };
            if (entrada) entrada.oninput = () => entrada.setCustomValidity("");
            janela.onclose = () => {
                resolver(janela.returnValue === "confirmado" ? (entrada ? entrada.value.trim() : true) : null); janela.remove();
            };
            this.documento.body.append(janela); janela.showModal(); (entrada || (cancelar.hidden ? aceitar : cancelar)).focus();
        });
    }

    botaoAcao(texto, tarefa, classe = "secundario") {
        const botao = this.elemento("button", texto, classe); botao.type = "button";
        botao.onclick = async () => {
            botao.disabled = true;
            try { await tarefa(); } catch (erro) { this.aviso(erro.message, "erro"); }
            finally { botao.disabled = false; }
        };
        return botao;
    }

}

// Mantém a sessão do navegador e monta o menu conforme o perfil recebido da API.
class SessaoSite {
    constructor(clienteApi, interfaceSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.usuario = null;
    }
    destinoPerfil(perfil) {
        if (perfil === "Aluno") return "painel-aluno.html";
        if (perfil === "Mentor") return "painel-mentor.html";
        if (perfil === "Gestor") return "painel-gestor.html";
        if (perfil === "Administrador") return "painel-administrador.html";
        return "";
    }

    menu(perfil) {
        const links = [[this.destinoPerfil(perfil), "Visão geral"]];
        if (perfil === "Aluno") links.push(["cursos.html", "Catálogo"], ["meus-cursos.html", "Meus cursos"], ["resultado.html", "Resultados"], ["certificados.html", "Certificados"]);
        if (perfil === "Mentor") links.push(["alunos-mentor.html", "Alunos atendidos"]);
        if (perfil === "Gestor") links.push(["gerenciar-cursos.html", "Cursos"], ["gerenciar-conteudo.html", "Conteúdo"], ["gerenciar-avaliacoes.html", "Avaliações"], ["relatorios.html", "Relatórios"], ["certificados.html", "Certificados"], ["usuarios.html", "Usuários"]);
        if (perfil === "Administrador") links.push(["usuarios.html", "Usuários"]);
        if (perfil === "Administrador" || perfil === "Gestor") links.push(["cadastrar-usuario.html", "Cadastrar usuário"]);
        links.push(["chamados.html", perfil === "Aluno" || perfil === "Mentor" ? "Ajuda e ouvidoria" : "Chamados"], ["perfil.html", "Meu perfil"]);
        const area = this.tela.campo("menu");
        for (const link of links) {
            const item = this.tela.criarLink(link[1], link[0], "");
            if (location.pathname.endsWith(link[0])) item.setAttribute("aria-current", "page");
            area.append(item);
        }
    }

    // Carrega o usuário antes da página e confere o perfil permitido.
    async iniciar(perfis, tarefa) {
        const area = this.tela.campo("conteudo");
        if (area) area.inert = true;
        this.tela.aviso("Carregando...");
        try {
            const usuario = await this.api.requisicao("/api/usuarios/perfil");
            this.usuario = usuario;
            this.menu(usuario.perfil);
            this.tela.campo("nome-usuario").textContent = usuario.nome + " · " + usuario.perfil;
            const botaoSair = this.tela.campo("sair");
            botaoSair.addEventListener("click", async () => {
                botaoSair.disabled = true;
                try {
                    await this.api.requisicao("/api/usuarios/logout", "POST");
                    location.href = "index.html";
                } catch (erro) { this.tela.aviso(erro.message, "erro"); botaoSair.disabled = false; }
            });
            if (perfis.length && !perfis.includes(usuario.perfil)) {
                this.tela.aviso("Seu perfil não tem acesso a esta página.", "erro");
                this.tela.campo("conteudo").hidden = true;
                return;
            }
            await tarefa(usuario);
            if (this.tela.campo("mensagem").textContent === "Carregando...") this.tela.aviso("");
        } catch (erro) {
            if (erro.status === 401) {
                location.href = "index.html";
                return;
            }
            this.tela.aviso(erro.message, "erro");
        } finally {
            if (area) area.inert = false;
        }
    }

}

// Guarda a versão carregada e atualiza somente depois que o usuário termina de digitar.
class AtualizadorSite {
    constructor(interfaceSite) {
        this.tela = interfaceSite;
        this.versaoPagina = document.querySelector('meta[name="versao-site"]')?.content;
        this.atualizacaoDisponivel = false;
    }
    iniciar() {
        document.addEventListener("input", evento => {
            if (evento.target.form) evento.target.form.dataset.pendente = "true";
        });
        document.addEventListener("reset", evento => { delete evento.target.dataset.pendente; });
        setInterval(() => this.conferirAtualizacao(), 5000);
        document.addEventListener("visibilitychange", () => this.conferirAtualizacao());
        window.addEventListener("pageshow", () => this.conferirAtualizacao());
    }
    aplicarAtualizacao() {
        if (!this.atualizacaoDisponivel) return;
        const digitando = document.querySelector('form[data-pendente="true"]');
        if (!digitando && !document.querySelector("dialog[open]")) location.reload();
        else if (!this.tela.campo("aviso-atualizacao")) {
            const avisoAtualizacao = this.tela.elemento("aside", "O site recebeu uma atualização. Salve o que está digitando para aplicá-la automaticamente. ", "mensagem informacao");
            avisoAtualizacao.id = "aviso-atualizacao"; avisoAtualizacao.setAttribute("role", "status");
            const botao = this.tela.elemento("button", "Atualizar agora", "secundario");
            botao.onclick = () => location.reload(); avisoAtualizacao.append(botao);
            document.body.prepend(avisoAtualizacao);
        }
    }

    async conferirAtualizacao() {
        if (!this.versaoPagina || document.hidden) return;
        try {
            const resposta = await fetch("/versao-site", { cache: "no-store" });
            if (!resposta.ok) return;
            const nova = (await resposta.json()).versao;
            if (nova !== this.versaoPagina) { this.atualizacaoDisponivel = true; this.aplicarAtualizacao(); }
        } catch { /* Uma reinicialização breve do servidor não interrompe a página. */ }
    }

}

// Validações pequenas são funções puras; não guardam estado nem precisam de classe.
function verificarSenha(senha, confirmacao) {
    if (Array.from(senha).length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres.");
    if (/\s/u.test(senha)) throw new Error("A senha não pode conter espaços.");
    // As regras Unicode também aceitam letras e números de outros idiomas.
    if (!/\p{Lu}/u.test(senha)) throw new Error("Inclua pelo menos uma letra maiúscula.");
    if (!/\p{N}/u.test(senha)) throw new Error("Inclua pelo menos um número.");
    if (!/[^\p{L}\p{N}\s]/u.test(senha)) throw new Error("Inclua pelo menos um caractere especial.");
    if (senha !== confirmacao) throw new Error("A confirmação deve ser exatamente igual à senha.");
}

function verificarEmail(email) {
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Digite um e-mail válido de até 254 caracteres.");
}

function verificarNome(nome) {
    const tamanho = nome.length;
    if (tamanho < 2 || tamanho > 100) throw new Error("O nome deve ter de 2 a 100 caracteres.");
}

const api = new ClienteApi(URL_API);
const tela = new InterfaceSite(document, api);
const sessao = new SessaoSite(api, tela);
const atualizador = new AtualizadorSite(tela);
tela.atualizador = atualizador;
atualizador.iniciar();
