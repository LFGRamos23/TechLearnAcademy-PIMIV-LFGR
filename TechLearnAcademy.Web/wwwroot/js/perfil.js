// Preenche e envia os dados pessoais mostrados na página de perfil.
class PaginaPerfil {
    constructor(clienteApi, interfaceSite, sessaoSite) {
        this.api = clienteApi;
        this.tela = interfaceSite;
        this.sessao = sessaoSite;
    }
    iniciar() {
        this.sessao.iniciar([], async (usuario) => {
            this.tela.campo("nome").value = usuario.nome;
            this.tela.campo("email").value = usuario.email;
            this.tela.campo("email").readOnly = usuario.perfil !== "Aluno";
            this.tela.campo("email-contato").value = usuario.emailContato || usuario.email;
            this.tela.campo("telefone").value = usuario.telefone || "";
            this.tela.campo("sexo").value = usuario.sexo || "";
            this.tela.campo("sexo-outro").value = usuario.sexoOutro || "";
            this.tela.configurarSexo("sexo", "area-sexo-outro", "sexo-outro");
            if (usuario.perfil !== "Administrador") this.tela.campo("modelo-senha").before(this.tela.campo("modelo-senha").content.cloneNode(true)); // Admin não troca senha pelo site.
            this.tela.campo("modelo-senha").remove();
            if (usuario.perfil === "Administrador") this.tela.campo("email-contato").previousElementSibling.textContent = "E-mail pessoal de contato";
            this.tela.campo("perfil").textContent = usuario.perfil;
            // Os mesmos campos servem para os quatro perfis; a API confere o que cada um pode alterar.
            this.tela.enviarFormulario("form-perfil", async () => {
                const nome = this.tela.textoCampo("nome");
                const email = this.tela.textoCampo("email");
                verificarNome(nome);
                verificarEmail(email);
                const resposta = await this.api.requisicao("/api/usuarios/perfil", "PUT", {
                    nome: nome, email: email, emailContato: this.tela.textoCampo("email-contato"),
                    telefone: this.tela.textoCampo("telefone"), sexo: this.tela.valor("sexo"), sexoOutro: this.tela.textoCampo("sexo-outro")
                });
                this.tela.campo("nome-usuario").textContent = nome + " · " + usuario.perfil;
                this.tela.aviso(resposta.mensagem, "sucesso");
            });
            if (usuario.perfil !== "Administrador") this.tela.enviarFormulario("form-senha", async (formulario) => {
                verificarSenha(this.tela.valor("senha"), this.tela.valor("confirmar-senha"));
                const resposta = await this.api.requisicao("/api/usuarios/trocar-senha", "POST", {
                    senhaAtual: this.tela.valor("senha-atual"), senha: this.tela.valor("senha"), confirmarSenha: this.tela.valor("confirmar-senha")
                });
                formulario.reset();
                this.tela.aviso(resposta.mensagem, "sucesso");
            });
        });


    }
}

new PaginaPerfil(api, tela, sessao).iniciar();
