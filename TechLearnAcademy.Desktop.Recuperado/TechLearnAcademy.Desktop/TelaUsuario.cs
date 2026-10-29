using System;
using System.Drawing;
using System.Net.Http;
using System.Windows.Forms;

namespace TechLearnAcademy.Desktop;

public class TelaUsuario : Form
{
	private readonly ApiCliente api;

	private readonly Usuario? usuario;

	private readonly bool proprioPerfil;

	private readonly TextBox nome;

	private readonly TextBox contato;

	private readonly TextBox email;

	private readonly TextBox telefone;

	private readonly ComboBox sexo = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList };

	private readonly TextBox sexoOutro;

	private readonly Label rotuloSexoOutro;

	private readonly TextBox senha;

	private readonly TextBox confirmacao;

	private readonly ComboBox perfil = new ComboBox
	{
		DropDownStyle = ComboBoxStyle.DropDownList
	};

	private readonly CheckBox ativo = new CheckBox
	{
		Text = "Conta ativa",
		AutoSize = true
	};

	private readonly Button salvar;

	private readonly Label mensagem;

	private bool salvando;

	public bool Alterou { get; private set; }

	public TelaUsuario(ApiCliente api, Usuario? usuario = null, bool proprioPerfil = false)
	{
		this.api = api;
		this.usuario = usuario;
		this.proprioPerfil = proprioPerfil;
		string text = ((usuario == null) ? "Cadastrar usuário" : (proprioPerfil ? "Meu perfil" : "Editar usuário"));
		Estilo.Preparar(this, text, 565, 840);
		MinimumSize = new Size(581, 879);
		Estilo.Texto(this, text, 28, 20, 490, 30, negrito: true);
		Estilo.Texto(this, (usuario == null) ? "O e-mail institucional será gerado pela API.\nInforme o primeiro e o segundo nome." : "O perfil e o e-mail institucional permanecem fixos.", 28, 55, 490, 45);
		nome = Estilo.Campo(this, "Nome completo", 108);
		contato = Estilo.Campo(this, proprioPerfil ? "E-mail pessoal de contato" : "E-mail pessoal para recuperação", 174);
		email = Estilo.Campo(this, "E-mail de acesso", 240, senha: false, usuario != null);
		Estilo.Texto(this, "Perfil", 28, 240, 490, 24, negrito: true).Visible = usuario == null;
		perfil.SetBounds(28, 266, 490, 28);
		perfil.AccessibleName = "Perfil da conta";
		perfil.Items.AddRange("Mentor", "Gestor");
		perfil.SelectedIndex = 0;
		Controls.Add(perfil);
		telefone = Estilo.Campo(this, "Telefone com DDD", 306);
		Estilo.Texto(this, "Sexo", 28, 372, 490, 24, negrito: true);
		sexo.SetBounds(28, 398, 490, 28);
		sexo.AccessibleName = "Sexo";
		sexo.Items.AddRange("Masculino", "Feminino", "Outro");
		Controls.Add(sexo);
		rotuloSexoOutro = Estilo.Texto(this, "Como descreve seu sexo?", 28, 438, 490, 24, negrito: true);
		sexoOutro = new TextBox { Location = new Point(28, 464), Width = 490, MaxLength = 60, AccessibleName = "Descrição de Outro" };
		Controls.Add(sexoOutro);
		sexo.SelectedIndexChanged += (object? _, EventArgs _) =>
		{
			bool outro = sexo.Text == "Outro";
			rotuloSexoOutro.Visible = outro;
			sexoOutro.Visible = outro;
			if (!outro) sexoOutro.Clear();
		};
		rotuloSexoOutro.Visible = false;
		sexoOutro.Visible = false;
		senha = Estilo.Campo(this, "Senha inicial", 504, senha: true, usuario == null);
		confirmacao = Estilo.Campo(this, "Confirmar senha", 570, senha: true, usuario == null);
		ativo.Location = new Point(28, 609);
		ativo.Checked = usuario?.Ativo ?? true;
		Controls.Add(ativo);
		Estilo.Texto(this, (usuario == null) ? "Mínimo de 8 caracteres, uma letra maiúscula, um número e um caractere especial. Sem espaços." : "As alterações serão conferidas pela API e gravadas no mesmo banco do site.", 28, 640, 490, 46);
		mensagem = Estilo.Texto(this, "", 28, 700, 490, 58);
		salvar = Estilo.Botao(this, (usuario == null) ? "Cadastrar conta" : "Salvar alterações", 28, 774, 240);
		Button button = Estilo.Botao(this, "Cancelar", 285, 774, 233, secundario: true);
		foreach (Control control in Controls)
		{
			if (control is TextBox || control is Label || control is ComboBox)
			{
				control.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
			}
		}
		salvar.Anchor = AnchorStyles.Bottom | AnchorStyles.Left;
		button.Anchor = AnchorStyles.Bottom | AnchorStyles.Right;
		mensagem.Anchor = AnchorStyles.Bottom | AnchorStyles.Left | AnchorStyles.Right;
		button.Click += (object? _, EventArgs _) =>
		{
			Close();
		};
		CancelButton = button;
		AcceptButton = salvar;
		perfil.Visible = usuario == null;
		ativo.Visible = usuario != null && !proprioPerfil;
		if (usuario != null)
		{
			nome.Text = usuario.Nome;
			contato.Text = usuario.EmailContato ?? usuario.Email;
			email.Text = usuario.Email;
			telefone.Text = usuario.Telefone ?? "";
			sexo.SelectedItem = usuario.Sexo;
			sexoOutro.Text = usuario.SexoOutro ?? "";
			email.ReadOnly = proprioPerfil || usuario.Perfil != "Aluno";
			Estilo.Texto(this, "Perfil: " + usuario.Perfil, 28, 504, 490, 28, negrito: true);
		}
		salvar.Click += Salvar;
		FormClosing += (object? _, FormClosingEventArgs e) =>
		{
			if (salvando)
			{
				e.Cancel = true;
			}
		};
		Shown += (object? _, EventArgs _) =>
		{
			nome.Focus();
		};
	}

	private async void Salvar(object? sender, EventArgs e)
	{
		if (salvando)
		{
			return;
		}
		try
		{
			string text = nome.Text.Trim();
			string emailContato = contato.Text.Trim();
			Validacao.Nome(text);
			Validacao.Email(emailContato);
			string numeroTelefone = Validacao.Telefone(telefone.Text.Trim());
			Validacao.Sexo(sexo.Text, sexoOutro.Text);
			if (usuario == null)
			{
				if (text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length < 2)
				{
					throw new InvalidOperationException("Informe o primeiro e o segundo nome.");
				}
				Validacao.Senha(senha.Text, confirmacao.Text);
			}
			else
			{
				Validacao.Email(email.Text.Trim());
			}
			if (usuario == null || proprioPerfil || ativo.Checked == usuario.Ativo || MessageBox.Show((ativo.Checked ? "Ativar" : "Desativar") + " a conta de " + usuario.Nome + "?", "Situação da conta", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.Yes)
			{
				salvando = true;
				salvar.Enabled = false;
				salvar.Text = "Salvando...";
				Estilo.Aviso(mensagem, "Salvando...");
				if (usuario == null)
				{
					RespostaApi respostaApi = await api.Enviar<RespostaApi>("api/administracao/usuarios", HttpMethod.Post, new
					{
						nome = text,
						emailContato = emailContato,
						telefone = numeroTelefone,
						sexo = sexo.Text,
						sexoOutro = sexo.Text == "Outro" ? sexoOutro.Text.Trim() : "",
						perfil = perfil.Text,
						senha = senha.Text,
						confirmarSenha = confirmacao.Text
					});
					senha.Clear();
					confirmacao.Clear();
					MessageBox.Show(respostaApi.Mensagem + "\n\nInforme ao usuário o e-mail de acesso e a senha inicial que você definiu.", "Conta cadastrada", MessageBoxButtons.OK, MessageBoxIcon.Asterisk);
				}
				else
				{
					string caminho = (proprioPerfil ? "api/usuarios/perfil" : ("api/administracao/usuarios/" + usuario.Id));
					await api.Enviar<RespostaApi>(caminho, HttpMethod.Put, new
					{
						nome = text,
						email = email.Text.Trim(),
						emailContato = emailContato,
						telefone = numeroTelefone,
						sexo = sexo.Text,
						sexoOutro = sexo.Text == "Outro" ? sexoOutro.Text.Trim() : "",
						ativo = ativo.Checked
					});
				}
				Alterou = true;
				salvando = false;
				DialogResult = DialogResult.OK;
			}
		}
		catch (Exception ex)
		{
			Estilo.Aviso(mensagem, ex.Message, erro: true);
			if (ex is ErroApi { Status: 401 })
			{
				salvando = false;
				DialogResult = DialogResult.Abort;
			}
		}
		finally
		{
			salvando = false;
			salvar.Enabled = true;
			salvar.Text = ((usuario == null) ? "Cadastrar conta" : "Salvar alterações");
		}
	}
}
