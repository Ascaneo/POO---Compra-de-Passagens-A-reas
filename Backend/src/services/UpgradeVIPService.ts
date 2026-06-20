/**
 * UpgradeVIPService
 * -----------------
 * Responsável pelo fluxo de upgrade de um UsuarioPadrao para UsuarioVIP.
 *
 * FLUXO (conforme especificação do projeto):
 *   1. usuário padrão clica em "Tornar-se VIP" (frontend)
 *   2. sistema exibe valor do upgrade (consultarValorUpgrade())
 *   3. usuário clica em "Confirmar Pagamento"
 *   4. sistema converte a conta para VIP (confirmarUpgrade())
 *   5. sistema envia notificação
 *
 * DESAFIO TÉCNICO (Single Table Inheritance no TypeORM):
 * Como UsuarioPadrao e UsuarioVIP são classes diferentes mapeadas pela
 * mesma tabela "usuario" através de uma coluna discriminadora
 * ("tipo_discriminador", ver @ChildEntity em UsuarioPadrao.ts e
 * UsuarioVIP.ts), não é possível simplesmente "mudar o tipo" de uma
 * instância já carregada em memória - o TypeORM não permite trocar a
 * classe de um objeto já instanciado.
 *
 * Por isso, o upgrade é feito assim:
 *   1. criamos uma nova instância UsuarioVIP com o MESMO id, nome,
 *      e-mail, senha e data de cadastro do UsuarioPadrao original;
 *   2. salvamos essa instância - o TypeORM atualiza a linha existente
 *      (mesmo id) e troca o valor da coluna discriminadora para "VIP".
 * Do ponto de vista do usuário final e do restante do sistema, é como
 * se a conta tivesse "evoluído" de Padrao para VIP - o id se mantém
 * o mesmo, preservando o histórico de reservas (que referenciam o
 * usuário pelo id, e não pela classe TypeScript em si).
 */

import { UsuarioRepository } from "../repositories/UsuarioRepository";
import { NotificacaoService } from "./NotificacaoService";
import { Usuario } from "../models/Usuario";
import { UsuarioPadrao } from "../models/UsuarioPadrao";
import { UsuarioVIP } from "../models/UsuarioVIP";
import { TipoUsuario } from "../enums/TipoUsuario";

/** Valor simbólico cobrado para o upgrade de conta para VIP. */
const VALOR_UPGRADE_VIP = 199.9;

export class UpgradeVIPService {
  private usuarioRepository: UsuarioRepository;
  private notificacaoService: NotificacaoService;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.notificacaoService = new NotificacaoService();
  }

  /**
   * Retorna o valor simbólico cobrado pelo upgrade para VIP.
   * Usado pelo frontend para exibir o valor antes da confirmação
   * (passo 2 do fluxo).
   */
  public consultarValorUpgrade(): number {
    return VALOR_UPGRADE_VIP;
  }

  /**
   * Confirma o upgrade de um usuário PADRAO para VIP.
   * Lança erro se o usuário já for VIP/Admin (não faz sentido fazer
   * upgrade de quem já tem benefícios VIP ou mais).
   */
  public async confirmarUpgrade(usuarioId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.buscarPorId(usuarioId);

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    if (!(usuario instanceof UsuarioPadrao)) {
      throw new Error(
        "Apenas usuários padrão podem solicitar upgrade para VIP."
      );
    }

    // Cria a nova instância VIP reaproveitando os dados do usuário
    // padrão original (incluindo o mesmo id, para preservar o
    // histórico de reservas e notificações, e a mesma senha, acessada
    // aqui através do método público validarSenha de forma indireta -
    // como o construtor aceita a senha em texto, reconstituímos o
    // valor a partir do próprio objeto antigo antes de descartá-lo).
    const usuarioVIP = new UsuarioVIP(usuario.nome, usuario.email);
    usuarioVIP.id = usuario.id;
    usuarioVIP.dataCadastro = usuario.dataCadastro;
    usuarioVIP.tipo = TipoUsuario.VIP;
    usuarioVIP.alterarSenha(this.extrairSenha(usuario));

    const usuarioAtualizado = await this.usuarioRepository.salvar(usuarioVIP);

    await this.notificacaoService.notificar(
      usuarioAtualizado,
      "Parabéns! Seu upgrade para VIP foi confirmado. Aproveite seus novos benefícios."
    );

    return usuarioAtualizado;
  }

  /**
   * Método auxiliar privado que acessa o atributo protegido "senha"
   * através de um cast controlado. Necessário apenas neste cenário
   * específico de "migração" de subclasse (Padrao -> VIP), onde
   * precisamos preservar a senha original sem expor o atributo
   * publicamente em toda a hierarquia de Usuario.
   */
  private extrairSenha(usuario: UsuarioPadrao): string {
    return (usuario as unknown as { senha: string }).senha;
  }
}
