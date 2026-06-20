/**
 * Desconto
 * --------
 * Representa uma regra de desconto que pode ser aplicada na compra de
 * passagens.
 *
 * REGRAS DE NEGÓCIO (aplicadas no DescontoService / ReservaService):
 * - Apenas ADMIN pode criar ou remover descontos.
 * - Usuários VIP recebem descontos ativos automaticamente ao comprar
 *   passagens (não precisam de cupom ou ação manual).
 * - Cada desconto é específico para um TipoVoo (NACIONAL ou
 *   INTERNACIONAL) - um desconto não se aplica indiscriminadamente a
 *   todos os voos.
 *
 * Esta entidade não tem relacionamento direto (FK) com Usuario ou Voo:
 * ela é consultada por TIPO de voo no momento do cálculo do valor da
 * reserva, e não vinculada a um voo específico.
 */

import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { TipoVoo } from "../enums/TipoVoo";

@Entity("desconto")
export class Desconto {
  /** Identificador único do desconto. */
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  /** Nome descritivo do desconto (ex: "Promoção de Verão VIP"). */
  @Column({ type: "varchar", length: 150 })
  nome!: string;

  /** Percentual de desconto, de 0 a 100 (ex: 15 representa 15%). */
  @Column({ type: "float" })
  percentual!: number;

  /** Tipo de voo ao qual este desconto se aplica (NACIONAL ou INTERNACIONAL). */
  @Column({ type: "varchar", length: 20 })
  tipoVooAplicavel!: TipoVoo;

  /** Indica se o desconto está atualmente ativo (pode ser desativado pelo ADM sem excluir o registro). */
  @Column({ type: "boolean", default: true })
  ativo!: boolean;

  /**
   * Calcula o valor do desconto a ser subtraído de um preço base.
   * Mantém a regra de cálculo encapsulada na própria entidade, evitando
   * duplicar a fórmula "preco * (percentual / 100)" em vários services.
   */
  public calcularValorDesconto(precoBase: number): number {
    return precoBase * (this.percentual / 100);
  }

  /** Aplica o desconto a um preço base, retornando o preço final. */
  public aplicarDesconto(precoBase: number): number {
    if (!this.ativo) return precoBase;
    return precoBase - this.calcularValorDesconto(precoBase);
  }

  /** Desativa o desconto (usado pelo ADM ao "remover" um desconto, sem perder o histórico). */
  public desativar(): void {
    this.ativo = false;
  }

  /** Reativa um desconto previamente desativado. */
  public ativar(): void {
    this.ativo = true;
  }
}
