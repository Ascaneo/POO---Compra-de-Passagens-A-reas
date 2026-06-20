/**
 * DescontoService
 * ---------------
 * Responsável pelo gerenciamento de descontos do sistema.
 *
 * REGRAS DE NEGÓCIO:
 * - Apenas ADMIN pode criar ou remover (desativar) descontos
 *   (validação feita aqui através do método isAdmin() do Usuario,
 *   reaproveitando o polimorfismo definido em Usuario.ts).
 * - Usuários VIP recebem descontos ativos automaticamente, sem
 *   precisar de nenhuma ação manual (ver método buscarMelhorDesconto,
 *   usado pelo ReservaService no Bloco 7 - Parte 2).
 * - Cada desconto se aplica a um TipoVoo específico.
 */

import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { Desconto } from "../models/Desconto";
import { TipoVoo } from "../enums/TipoVoo";
import { Usuario } from "../models/Usuario";

export class DescontoService {
  private repository: Repository<Desconto>;

  constructor() {
    this.repository = AppDataSource.getRepository(Desconto);
  }

  /**
   * Cria um novo desconto no sistema.
   * Lança erro se o usuário solicitante não for ADMIN, reaproveitando
   * o método polimórfico isAdmin() (POLIMORFISMO: funciona para
   * qualquer subclasse de Usuario, sem precisar de "instanceof").
   */
  public async criar(
    solicitante: Usuario,
    nome: string,
    percentual: number,
    tipoVooAplicavel: TipoVoo
  ): Promise<Desconto> {
    if (!solicitante.isAdmin()) {
      throw new Error("Apenas administradores podem criar descontos.");
    }

    if (percentual <= 0 || percentual > 100) {
      throw new Error("O percentual de desconto deve estar entre 1 e 100.");
    }

    const desconto = new Desconto();
    desconto.nome = nome;
    desconto.percentual = percentual;
    desconto.tipoVooAplicavel = tipoVooAplicavel;
    desconto.ativo = true;

    return this.repository.save(desconto);
  }

  /**
   * Remove (na prática, desativa) um desconto.
   * Mantemos o registro no banco por questões de histórico/relatórios,
   * mas ele deixa de ser aplicado em novas compras.
   */
  public async remover(solicitante: Usuario, descontoId: string): Promise<Desconto> {
    if (!solicitante.isAdmin()) {
      throw new Error("Apenas administradores podem remover descontos.");
    }

    const desconto = await this.repository.findOne({
      where: { id: descontoId },
    });

    if (!desconto) {
      throw new Error("Desconto não encontrado.");
    }

    desconto.desativar();
    return this.repository.save(desconto);
  }

  /** Lista todos os descontos cadastrados (ativos e inativos), útil para relatórios do ADM. */
  public async listarTodos(): Promise<Desconto[]> {
    return this.repository.find();
  }

  /** Lista apenas os descontos atualmente ativos. */
  public async listarAtivos(): Promise<Desconto[]> {
    return this.repository.find({ where: { ativo: true } });
  }

  /**
   * Busca o melhor desconto ativo aplicável a um determinado tipo de
   * voo (o de maior percentual, caso existam vários cadastrados para
   * o mesmo tipo). Retorna null se não houver nenhum desconto ativo
   * para aquele tipo de voo.
   *
   * Este método é o ponto de integração com o ReservaService: ao
   * comprar uma passagem, se o usuário for VIP (ou Admin), o
   * ReservaService chama este método para aplicar o desconto
   * automaticamente, sem que o usuário precise inserir nenhum cupom.
   */
  public async buscarMelhorDesconto(
    tipoVoo: TipoVoo
  ): Promise<Desconto | null> {
    const descontosAtivos = await this.repository.find({
      where: { tipoVooAplicavel: tipoVoo, ativo: true },
    });

    if (descontosAtivos.length === 0) return null;

    return descontosAtivos.reduce((melhor, atual) =>
      atual.percentual > melhor.percentual ? atual : melhor
    );
  }
}
