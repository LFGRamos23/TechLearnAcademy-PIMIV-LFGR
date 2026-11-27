// Controla cadastro, login e recuperação de senha antes da entrada no site.
class PaginaPublica {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
        this.pagina = document.body.dataset.pagina;
    }
    iniciar() {
        if (this.pagina === "login") this.configurarLogin();
        if (this.pagina === "cadastro") this.configurarCadastro();
        if (this.pagina === "recuperar") this.configurarRecuperacao();
        if (this.pagina === "redefinir") this.configurarRedefinicao();
    }

    // O login recebe o perfil da API e segue para o painel correspondente.
    configurarLogin() {
        this.tela.enviarFormulario("form-login", async () => {
            const email = this.tela.textoCampo("email");
            verificarEmail(email);
            const usuario = await this.api.requisicao("/api/usuarios/login", "POST", { email: email, senha: this.tela.valor("senha") });
            const destino = this.sessao.destinoPerfil(usuario.perfil);
            if (!destino) throw new Error("Perfil de usuário não reconhecido.");
            this.tela.aviso("Login realizado com sucesso.", "sucesso");
            // O token da API não é salvo. O navegador envia o cookie HttpOnly.
            setTimeout(() => { location.href = destino; }, 600);
        }, "Entrando...");
    }

    // O formulário público cria um aluno após validar dados pessoais e senha.
    configurarCadastro() {
        this.tela.configurarSexo("sexo", "area-sexo-outro", "sexo-outro");
        this.tela.enviarFormulario("form-cadastro", async (formulario) => {
            const nome = this.tela.textoCampo("nome");
            const email = this.tela.textoCampo("email");
            verificarNome(nome);
            verificarEmail(email);
            verificarSenha(this.tela.valor("senha"), this.tela.valor("confirmar-senha"));
            const resposta = await this.api.requisicao("/api/usuarios/cadastro", "POST", {
                nome: nome, email: email, telefone: this.tela.textoCampo("telefone"), sexo: this.tela.valor("sexo"), sexoOutro: this.tela.textoCampo("sexo-outro"),
                senha: this.tela.valor("senha"), confirmarSenha: this.tela.valor("confirmar-senha")
            });
            formulario.reset();
            this.tela.campo("sexo").dispatchEvent(new Event("change"));
            this.tela.aviso(resposta.mensagem, "sucesso");
        }, "Cadastrando...");
    }

    // A resposta é igual para e-mails cadastrados ou não, sem expor contas existentes.
    configurarRecuperacao() {
        this.tela.enviarFormulario("form-recuperar", async (formulario) => {
            const email = this.tela.textoCampo("email");
            verificarEmail(email);
            const resposta = await this.api.requisicao("/api/usuarios/recuperar-senha", "POST", { email: email });
            formulario.reset();
            this.tela.aviso(resposta.mensagem, "sucesso");
        }, "Enviando...");
    }

    configurarRedefinicao() {
        this.tela.campo("token").value = new URLSearchParams(location.search).get("token") || "";
        this.tela.enviarFormulario("form-redefinir", async (formulario) => {
            verificarSenha(this.tela.valor("senha"), this.tela.valor("confirmar-senha"));
            const resposta = await this.api.requisicao("/api/usuarios/redefinir-senha", "POST", {
                token: this.tela.textoCampo("token"), senha: this.tela.valor("senha"), confirmarSenha: this.tela.valor("confirmar-senha")
            });
            formulario.reset();
            // Remove o código do endereço depois de usar o link recebido por e-mail.
            history.replaceState(null, "", "redefinir-senha.html");
            this.tela.aviso(resposta.mensagem + " Volte ao login para entrar.", "sucesso");
        });
    }
}

new PaginaPublica(api, tela, sessao).iniciar();
