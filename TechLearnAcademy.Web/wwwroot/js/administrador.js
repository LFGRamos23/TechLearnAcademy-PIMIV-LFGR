// Monta a visão administrativa de usuários e contas ativas.
class PaginaAdministrador {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
        this.pagina = document.body.dataset.pagina;
        this.autor = null;
    }

    // Busca uma página de usuários; só o administrador recebe a ação de ativar conta.
    async listarUsuarios(paginaNumero = 1) {
        const retorno = await this.api.requisicao("/api/administracao/usuarios?busca=" + encodeURIComponent(this.tela.textoCampo("busca")) + "&pagina=" + paginaNumero);
        const area = this.tela.campo("lista"); area.replaceChildren();
        if (!retorno.itens.length) this.tela.vazio(area, "Nenhum usuário encontrado.");
        for (const usuario of retorno.itens) {
            const item = this.tela.cartao(usuario.nome, usuario.email);
            item.append(this.tela.elemento("p", usuario.perfil + " · " + (usuario.ativo ? "Ativo" : "Inativo")),
                this.tela.criarLink("Editar dados", "editar-usuario.html?id=" + usuario.id));
            if (usuario.telefone) item.append(this.tela.elemento("p", "Telefone: " + usuario.telefone));
            if (this.autor.perfil === "Administrador") item.append(this.tela.botaoAcao(usuario.ativo ? "Desativar conta" : "Ativar conta", async () => {
                if (!await this.tela.dialogo("Situação da conta", (usuario.ativo ? "Desativar" : "Ativar") + " a conta de " + usuario.nome + "?")) return;
                const resposta = await this.api.requisicao("/api/administracao/usuarios/" + usuario.id, "PUT", { ativo: !usuario.ativo });
                this.tela.aviso(resposta.mensagem, "sucesso"); await this.listarUsuarios(paginaNumero);
            }));
            area.append(item);
        }
        this.tela.paginacao(retorno, numero => this.listarUsuarios(numero));
    }

    iniciar() {
        this.sessao.iniciar(["Administrador", "Gestor"], async (usuario) => {
            this.autor = usuario;
            if (this.pagina === "painel") {
                if (usuario.perfil !== "Administrador") throw new Error("Este painel pertence ao administrador.");
                const resumo = await this.api.requisicao("/api/administracao/painel");
                this.tela.metricas([["Usuários ativos", resumo.ativos], ["Usuários inativos", resumo.inativos]]);
                for (const perfil of resumo.perfis) {
                    const card = this.tela.cartao(perfil.perfil); card.append(this.tela.elemento("strong", perfil.quantidade, "numero")); this.tela.campo("lista").append(card);
                }
            }
            if (this.pagina === "usuarios") {
                this.tela.campo("form-busca").onsubmit = (e) => { e.preventDefault(); this.listarUsuarios().catch(erro => this.tela.aviso(erro.message, "erro")); };
                await this.listarUsuarios();
            }
            // O gestor só pode cadastrar mentor; o administrador escolhe mentor ou gestor.
            if (this.pagina === "cadastrar") {
                this.tela.configurarSexo("conta-sexo", "area-conta-sexo-outro", "conta-sexo-outro");
                if (usuario.perfil === "Gestor") {
                    this.tela.campo("titulo-cadastro").textContent = "Cadastrar mentor";
                    this.tela.campo("conta-perfil").querySelector('option[value="Gestor"]').remove();
                    this.tela.campo("conta-perfil").disabled = true;
                }
                this.tela.enviarFormulario("form-conta", async (form) => {
                    verificarNome(this.tela.textoCampo("conta-nome")); verificarEmail(this.tela.textoCampo("conta-contato"));
                    verificarSenha(this.tela.valor("conta-senha"), this.tela.valor("conta-confirmacao"));
                    const retorno = await this.api.requisicao("/api/administracao/usuarios", "POST", {
                        nome: this.tela.textoCampo("conta-nome"), emailContato: this.tela.textoCampo("conta-contato"), perfil: this.tela.valor("conta-perfil"),
                        telefone: this.tela.textoCampo("conta-telefone"), sexo: this.tela.valor("conta-sexo"), sexoOutro: this.tela.textoCampo("conta-sexo-outro"),
                        senha: this.tela.valor("conta-senha"), confirmarSenha: this.tela.valor("conta-confirmacao")
                    });
                    form.reset(); this.tela.campo("conta-sexo").dispatchEvent(new Event("change")); this.tela.aviso(retorno.mensagem, "sucesso");
                    await this.tela.dialogo("Conta cadastrada", "E-mail de acesso: " + retorno.email + "\nInforme esse e-mail e a senha inicial ao usuário.", false, "Entendi");
                });
            }
            // O perfil e o e-mail institucional não são alterados nesta tela.
            if (this.pagina === "editar") {
                const u = await this.api.requisicao("/api/administracao/usuarios/" + this.tela.numeroId());
                this.tela.campo("nome-editado").textContent = u.nome; this.tela.campo("perfil-editado").textContent = u.perfil;
                this.tela.campo("nome-editado-input").value = u.nome; this.tela.campo("email-editado-input").value = u.email;
                this.tela.campo("email-editado-input").readOnly = u.perfil !== "Aluno";
                this.tela.campo("contato-editado").value = u.emailContato || u.email;
                this.tela.campo("telefone-editado").value = u.telefone || "";
                this.tela.campo("sexo-editado").value = u.sexo || "";
                this.tela.campo("sexo-outro-editado").value = u.sexoOutro || "";
                this.tela.configurarSexo("sexo-editado", "area-sexo-outro-editado", "sexo-outro-editado");
                this.tela.campo("ativo").value = String(u.ativo);
                this.tela.campo("situacao-conta").hidden = usuario.perfil !== "Administrador";
                this.tela.enviarFormulario("form-usuario", async () => {
                    const resposta = await this.api.requisicao("/api/administracao/usuarios/" + u.id, "PUT", {
                        nome: this.tela.textoCampo("nome-editado-input"), email: this.tela.textoCampo("email-editado-input"),
                        emailContato: this.tela.textoCampo("contato-editado"), telefone: this.tela.textoCampo("telefone-editado"),
                        sexo: this.tela.valor("sexo-editado"), sexoOutro: this.tela.textoCampo("sexo-outro-editado"),
                        ativo: usuario.perfil === "Administrador" ? this.tela.valor("ativo") === "true" : u.ativo
                    });
                    this.tela.aviso(resposta.mensagem, "sucesso");
                });
            }
        });


    }
}

new PaginaAdministrador(api, tela, sessao).iniciar();
