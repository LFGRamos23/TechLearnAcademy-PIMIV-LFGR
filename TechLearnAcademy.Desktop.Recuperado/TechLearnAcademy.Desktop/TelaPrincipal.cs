using System;
using System.Collections.Generic;
using System.Drawing;
using System.Net.Http;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace TechLearnAcademy.Desktop;

public class TelaPrincipal : Form
{
	private readonly ApiCliente api;

	private Usuario administrador;

	private readonly TabControl abas = new TabControl
	{
		Dock = DockStyle.Fill
	};

	private readonly Label mensagem = new Label
	{
		Dock = DockStyle.Fill,
		Padding = new Padding(20, 12, 20, 0)
	};

	private readonly Label nomeAdmin;

	private readonly Label totais;

	private readonly Label dadosPerfil;

	private readonly Label paginaTexto;

	private readonly DataGridView perfis;

	private readonly DataGridView usuarios;

	private readonly DataGridView chamados;

	private readonly TextBox busca;

	private readonly ComboBox filtroChamados;

	private readonly Button anterior;

	private readonly Button proxima;

	private readonly Button sair;

	private readonly Timer atualizacao = new Timer
	{
		Interval = 5000
	};

	private int pagina = 1;

	private string buscaAtual = "";

	private bool ocupado;

	private bool fechamentoPronto;

	public bool VoltarAoLogin { get; private set; }

	public TelaPrincipal(ApiCliente api, Usuario administrador)
	{
		this.api = api;
		this.administrador = administrador;
		Estilo.Preparar(this, "Administração", 1100, 730);
		MinimumSize = new Size(960, 650);
		TableLayoutPanel tableLayoutPanel = new TableLayoutPanel
		{
			Dock = DockStyle.Fill,
			RowCount = 3,
			ColumnCount = 1
		};
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 88f));
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Percent, 100f));
		tableLayoutPanel.RowStyles.Add(new RowStyle(SizeType.Absolute, 78f));
		Panel panel = new Panel
		{
			Size = new Size(ClientSize.Width, 88),
			Dock = DockStyle.Fill,
			BackColor = Estilo.Azul,
			Margin = Padding.Empty
		};
		Estilo.Texto(panel, "TechLearn Academy", 22, 18, 300, 28, negrito: true).ForeColor = Color.White;
		nomeAdmin = Estilo.Texto(panel, administrador.Nome + " · Administrador", 22, 50, 850, 25);
		nomeAdmin.ForeColor = Color.White;
		nomeAdmin.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right;
		nomeAdmin.AutoEllipsis = true;
		sair = Estilo.Botao(panel, "Sair", 940, 23, 120, secundario: true);
		sair.Anchor = AnchorStyles.Top | AnchorStyles.Right;
		tableLayoutPanel.Controls.Add(panel, 0, 0);
		tableLayoutPanel.Controls.Add(abas, 0, 1);
		tableLayoutPanel.Controls.Add(mensagem, 0, 2);
		Controls.Add(tableLayoutPanel);
		TabPage pai = NovaAba("Visão geral");
		Panel pai2 = Barra(pai, 115, DockStyle.Top);
		Estilo.Texto(pai2, "Painel do administrador", 10, 10, 700, 30, negrito: true);
		totais = Estilo.Texto(pai2, "Carregando os dados reais...", 10, 55, 880, 45);
		Panel pai3 = Barra(pai, 65, DockStyle.Bottom);
		Estilo.Botao(pai3, "Atualizar painel", 10, 12).Click += (object? _, EventArgs _) =>
		{
			Executar(CarregarPainel);
		};
		Estilo.Botao(pai3, "Verificar banco", 185, 12).Click += (object? _, EventArgs _) =>
		{
			Executar(VerificarBanco);
		};
		perfis = Estilo.Tabela(pai, "Perfil", "Quantidade de usuários");
		perfis.BringToFront();
		TabPage pai4 = NovaAba("Usuários");
		Panel panel2 = Barra(pai4, 100, DockStyle.Top);
		Estilo.Texto(panel2, "Buscar por nome ou e-mail", 10, 8, 500, 24, negrito: true);
		busca = new TextBox
		{
			Location = new Point(10, 38),
			Width = 430,
			AccessibleName = "Buscar por nome ou e-mail"
		};
		Estilo.HabilitarColagem(busca);
		panel2.Controls.Add(busca);
		Estilo.Botao(panel2, "Buscar", 455, 32, 110).Click += (object? _, EventArgs _) =>
		{
			BuscarUsuarios();
		};
		busca.KeyDown += (object? _, KeyEventArgs e) =>
		{
			if (e.KeyCode == Keys.Return)
			{
				e.SuppressKeyPress = true;
				BuscarUsuarios();
			}
		};
		Estilo.Botao(panel2, "Cadastrar usuário", 580, 32, 190).Click += (object? _, EventArgs _) =>
		{
			Executar(CadastrarUsuario);
		};
		Panel pai5 = Barra(pai4, 65, DockStyle.Bottom);
		Estilo.Botao(pai5, "Editar dados", 10, 12, 145).Click += (object? _, EventArgs _) =>
		{
			Executar(EditarUsuario);
		};
		Estilo.Botao(pai5, "Ativar / desativar", 165, 12, 180).Click += (object? _, EventArgs _) =>
		{
			Executar(AlterarSituacao);
		};
		anterior = Estilo.Botao(pai5, "Anterior", 365, 12, 105, secundario: true);
		proxima = Estilo.Botao(pai5, "Próxima", 480, 12, 105, secundario: true);
		paginaTexto = Estilo.Texto(pai5, "", 600, 22, 300);
		anterior.Click += (object? _, EventArgs _) =>
		{
			pagina--;
			Executar(CarregarUsuarios);
		};
		proxima.Click += (object? _, EventArgs _) =>
		{
			pagina++;
			Executar(CarregarUsuarios);
		};
		usuarios = Estilo.Tabela(pai4, "ID", "Nome", "E-mail", "Perfil", "Situação");
		usuarios.Columns[0].FillWeight = 25f;
		usuarios.Columns[1].FillWeight = 110f;
		usuarios.Columns[2].FillWeight = 160f;
		usuarios.Columns[3].FillWeight = 65f;
		usuarios.Columns[4].FillWeight = 55f;
		usuarios.CellDoubleClick += (object? _, DataGridViewCellEventArgs e) =>
		{
			if (e.RowIndex >= 0)
			{
				Executar(EditarUsuario);
			}
		};
		usuarios.BringToFront();
		TabPage pai6 = NovaAba("Chamados");
		Panel panel3 = Barra(pai6, 105, DockStyle.Top);
		Estilo.Texto(panel3, "Receba e responda às solicitações dos gestores.", 10, 8, 850, 28, negrito: true);
		filtroChamados = new ComboBox
		{
			Location = new Point(10, 50),
			Width = 230,
			DropDownStyle = ComboBoxStyle.DropDownList,
			AccessibleName = "Filtro de chamados"
		};
		filtroChamados.Items.AddRange("Todos", "Em aberto", "Meus atendimentos", "Disponíveis para atender");
		filtroChamados.SelectedIndex = 0;
		panel3.Controls.Add(filtroChamados);
		Estilo.Botao(panel3, "Atualizar lista", 260, 44, 170).Click += (object? _, EventArgs _) =>
		{
			Executar(CarregarChamados);
		};
		Estilo.Botao(Barra(pai6, 65, DockStyle.Bottom), "Abrir conversa", 10, 12, 180).Click += (object? _, EventArgs _) =>
		{
			Executar(AbrirChamado);
		};
		chamados = Estilo.Tabela(pai6, "ID", "Assunto", "Solicitante", "Responsável", "Situação");
		chamados.Columns[0].FillWeight = 25f;
		chamados.Columns[1].FillWeight = 150f;
		chamados.CellDoubleClick += (object? _, DataGridViewCellEventArgs e) =>
		{
			if (e.RowIndex >= 0)
			{
				Executar(AbrirChamado);
			}
		};
		chamados.BringToFront();
		filtroChamados.SelectedIndexChanged += (object? _, EventArgs _) =>
		{
			Executar(CarregarChamados);
		};
		TabPage pai7 = NovaAba("Meu perfil");
		Estilo.Texto(pai7, "Dados da conta", 25, 25, 700, 35, negrito: true);
		dadosPerfil = Estilo.Texto(pai7, "", 25, 80, 850, 165);
		Estilo.Botao(pai7, "Editar meus dados", 25, 265, 230).Click += (object? _, EventArgs _) =>
		{
			Executar(EditarPerfil);
		};
		Estilo.Texto(pai7, "O Administrador edita seus dados de contato. A troca de senha não está disponível para este perfil no site.", 25, 330, 800, 65);
		Shown += (object? _, EventArgs _) =>
		{
			Executar(CarregarPainel);
			atualizacao.Start();
		};
		abas.SelectedIndexChanged += (object? _, EventArgs _) =>
		{
			Executar(CarregarAba);
		};
		atualizacao.Tick += (object? _, EventArgs _) =>
		{
			if (abas.SelectedIndex == 2 && ContainsFocus && !ocupado)
			{
				Executar(CarregarChamados);
			}
		};
		sair.Click += (object? _, EventArgs _) =>
		{
			if (!ocupado)
			{
				VoltarAoLogin = true;
				Close();
			}
		};
		FormClosing += Fechar;
		FormClosed += (object? _, FormClosedEventArgs _) =>
		{
			atualizacao.Dispose();
		};
	}

	private TabPage NovaAba(string titulo)
	{
		TabPage tabPage = new TabPage(titulo)
		{
			BackColor = Estilo.Fundo,
			Padding = new Padding(15)
		};
		abas.TabPages.Add(tabPage);
		return tabPage;
	}

	private static Panel Barra(Control pai, int altura, DockStyle lado)
	{
		Panel panel = new Panel
		{
			Dock = lado,
			Height = altura
		};
		pai.Controls.Add(panel);
		return panel;
	}

	private async void Executar(Func<Task> tarefa)
	{
		if (ocupado)
		{
			return;
		}
		ocupado = true;
		TabControl tabControl = abas;
		bool enabled = (sair.Enabled = false);
		tabControl.Enabled = enabled;
		Estilo.Aviso(mensagem, "Carregando...");
		bool voltar = false;
		try
		{
			await tarefa();
			if (mensagem.Text == "Carregando...")
			{
				Estilo.Aviso(mensagem, "Dados atualizados pela API da plataforma.");
			}
		}
		catch (Exception ex)
		{
			Estilo.Aviso(mensagem, ex.Message, erro: true);
			voltar = ex is ErroApi erroApi && erroApi.Status == 401;
		}
		finally
		{
			ocupado = false;
			TabControl tabControl2 = abas;
			enabled = (sair.Enabled = true);
			tabControl2.Enabled = enabled;
		}
		if (voltar)
		{
			VoltarAoLogin = true;
			Close();
		}
	}

	private Task CarregarAba()
	{
		if (abas.SelectedIndex == 0)
		{
			return CarregarPainel();
		}
		if (abas.SelectedIndex == 1)
		{
			return CarregarUsuarios();
		}
		if (abas.SelectedIndex == 2)
		{
			return CarregarChamados();
		}
		return CarregarPerfil();
	}

	private async Task CarregarPainel()
	{
		ResumoAdmin resumoAdmin = await api.Enviar<ResumoAdmin>("api/administracao/painel", HttpMethod.Get);
		totais.Text = "Usuários ativos: " + resumoAdmin.Ativos + "     |     Usuários inativos: " + resumoAdmin.Inativos;
		perfis.Rows.Clear();
		foreach (ContagemPerfil perfi in resumoAdmin.Perfis)
		{
			perfis.Rows.Add(perfi.Perfil, perfi.Quantidade);
		}
	}

	private async Task VerificarBanco()
	{
		RespostaApi respostaApi = await api.Enviar<RespostaApi>("api/status/banco", HttpMethod.Get);
		Estilo.Aviso(mensagem, respostaApi.Mensagem);
	}

	private void BuscarUsuarios()
	{
		pagina = 1;
		buscaAtual = busca.Text.Trim();
		Executar(CarregarUsuarios);
	}

	private async Task CarregarUsuarios()
	{
		PaginaUsuarios paginaUsuarios = await api.Enviar<PaginaUsuarios>("api/administracao/usuarios?busca=" + Uri.EscapeDataString(buscaAtual) + "&pagina=" + pagina, HttpMethod.Get);
		pagina = paginaUsuarios.Pagina;
		usuarios.Rows.Clear();
		foreach (Usuario iten in paginaUsuarios.Itens)
		{
			int index = usuarios.Rows.Add(iten.Id, iten.Nome, iten.Email, iten.Perfil, iten.Ativo ? "Ativo" : "Inativo");
			usuarios.Rows[index].Tag = iten;
		}
		anterior.Enabled = pagina > 1;
		proxima.Enabled = pagina < paginaUsuarios.TotalPaginas;
		paginaTexto.Text = "Página " + pagina + " de " + paginaUsuarios.TotalPaginas + " · " + paginaUsuarios.Total + " usuário(s)";
		if (paginaUsuarios.Itens.Count == 0)
		{
			Estilo.Aviso(mensagem, "Nenhum usuário encontrado.");
		}
	}

	private Usuario SelecionarUsuario()
	{
		return (usuarios.CurrentRow?.Tag as Usuario) ?? throw new InvalidOperationException("Selecione um usuário na lista.");
	}

	private void ConferirDialogo(DialogResult resultado)
	{
		if (resultado == DialogResult.Abort)
		{
			throw new ErroApi(401, "Sua sessão expirou. Entre novamente.");
		}
	}

	private async Task CadastrarUsuario()
	{
		using TelaUsuario tela = new TelaUsuario(api);
		ConferirDialogo(tela.ShowDialog(this));
		if (tela.Alterou)
		{
			pagina = 1;
			await CarregarUsuarios();
			Estilo.Aviso(mensagem, "Conta cadastrada pela API.");
		}
	}

	private async Task EditarUsuario()
	{
		Usuario usuario = SelecionarUsuario();
		Usuario usuario2 = await api.Enviar<Usuario>("api/administracao/usuarios/" + usuario.Id, HttpMethod.Get);
		using TelaUsuario tela = new TelaUsuario(api, usuario2);
		ConferirDialogo(tela.ShowDialog(this));
		if (tela.Alterou)
		{
			if (usuario2.Id == administrador.Id)
			{
				throw new ErroApi(401, "Sua conta foi alterada. Entre novamente.");
			}
			await CarregarUsuarios();
			Estilo.Aviso(mensagem, "Dados atualizados. O perfil permanece o mesmo.");
		}
	}

	private async Task AlterarSituacao()
	{
		Usuario usuario = SelecionarUsuario();
		if (MessageBox.Show((usuario.Ativo ? "Desativar" : "Ativar") + " a conta de " + usuario.Nome + "?", "Situação da conta", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.Yes)
		{
			RespostaApi resposta = await api.Enviar<RespostaApi>("api/administracao/usuarios/" + usuario.Id, HttpMethod.Put, new
			{
				ativo = !usuario.Ativo
			});
			if (usuario.Id == administrador.Id)
			{
				throw new ErroApi(401, "Sua conta foi alterada. Entre novamente.");
			}
			await CarregarUsuarios();
			Estilo.Aviso(mensagem, resposta.Mensagem);
		}
	}

	private async Task CarregarChamados()
	{
		int selecionado = (chamados.CurrentRow?.Tag as Chamado)?.Id ?? 0;
		List<Chamado> list = await api.Enviar<List<Chamado>>("api/chamados", HttpMethod.Get);
		chamados.Rows.Clear();
		foreach (Chamado item in list)
		{
			if ((filtroChamados.SelectedIndex != 1 || !(item.Status == "Encerrado")) && (filtroChamados.SelectedIndex != 2 || item.ResponsavelId == administrador.Id || item.SolicitanteId == administrador.Id) && (filtroChamados.SelectedIndex != 3 || item.PodeAtender))
			{
				int index = chamados.Rows.Add(item.Id, item.Assunto, item.Solicitante, item.Responsavel ?? "Aguardando", item.Status);
				chamados.Rows[index].Tag = item;
				if (item.Id == selecionado)
				{
					chamados.CurrentCell = chamados.Rows[index].Cells[0];
				}
			}
		}
		if (chamados.Rows.Count == 0)
		{
			Estilo.Aviso(mensagem, "Nenhum chamado neste filtro.");
		}
	}

	private async Task AbrirChamado()
	{
		Chamado chamado = (chamados.CurrentRow?.Tag as Chamado) ?? throw new InvalidOperationException("Selecione um chamado na lista.");
		using TelaChamado tela = new TelaChamado(api, chamado.Id);
		ConferirDialogo(tela.ShowDialog(this));
		await CarregarChamados();
	}

	private async Task CarregarPerfil()
	{
		administrador = await api.Enviar<Usuario>("api/usuarios/perfil", HttpMethod.Get);
		nomeAdmin.Text = administrador.Nome + " · " + administrador.Perfil;
		dadosPerfil.Text = "Nome: " + administrador.Nome + "\n\nE-mail de acesso: " + administrador.Email + "\n\nE-mail pessoal: " + (administrador.EmailContato ?? administrador.Email) + "\n\nPerfil: " + administrador.Perfil;
	}

	private async Task EditarPerfil()
	{
		await CarregarPerfil();
		using TelaUsuario tela = new TelaUsuario(api, administrador, proprioPerfil: true);
		ConferirDialogo(tela.ShowDialog(this));
		if (tela.Alterou)
		{
			await CarregarPerfil();
			Estilo.Aviso(mensagem, "Seus dados foram atualizados.");
		}
	}

	private async void Fechar(object? sender, FormClosingEventArgs e)
	{
		if (fechamentoPronto)
		{
			return;
		}
		e.Cancel = true;
		if (!ocupado)
		{
			atualizacao.Stop();
			ocupado = true;
			TabControl tabControl = abas;
			bool enabled = (sair.Enabled = false);
			tabControl.Enabled = enabled;
			Estilo.Aviso(mensagem, "Encerrando a sessão...");
			try
			{
				await api.Sair();
			}
			catch (ErroApi)
			{
			}
			fechamentoPronto = true;
			Close();
		}
	}
}
