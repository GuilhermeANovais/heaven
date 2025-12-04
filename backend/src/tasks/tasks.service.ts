// src/tasks/tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfService } from 'src/pdf/pdf.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  // Roda no dia 1 de cada mês à meia-noite (00:00:00)
  @Cron('0 0 1 * *') 
  async handleMonthlyClosing() {
    this.logger.log('Iniciando fechamento mensal automático...');

    // 1. Determinar o mês anterior (o mês que acabou de fechar)
    const now = new Date();
    // Se hoje é 01/12, queremos o relatório de 01/11 a 30/11
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Dia 0 do mês atual = último do anterior

    const month = startOfLastMonth.getMonth() + 1; // JS conta meses de 0-11
    const year = startOfLastMonth.getFullYear();

    this.logger.log(`Gerando relatório para: ${month}/${year}`);

    // 2. Buscar Vendas do mês passado
    const salesAgg = await this.prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { not: 'CANCELADO' } // Importante: ignorar cancelados
      }
    });

    // 3. Buscar Despesas do mês passado
    const expensesAgg = await this.prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        date: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    });

    // CORREÇÃO: Converter para Number
    const revenue = Number(salesAgg._sum.total || 0);
    const expenses = Number(expensesAgg._sum.amount || 0);
    const profit = revenue - expenses;

    // 4. Gerar o HTML do Relatório (Você precisará criar esse método no PdfService)
    // Vou simplificar aqui, mas a ideia é igual ao do Pedido
    const htmlContent = `
      <h1>Fechamento Mensal - ${month}/${year}</h1>
      <p><b>Faturamento:</b> R$ ${revenue.toFixed(2)}</p>
      <p><b>Despesas:</b> R$ ${expenses.toFixed(2)}</p>
      <hr/>
      <h2><b>Lucro Líquido:</b> R$ ${profit.toFixed(2)}</h2>
    `;

    const pdfBuffer = await this.pdfService.generatePdfFromHtml(htmlContent);

    // 5. Salvar no Banco de Dados
    await this.prisma.monthlyReport.create({
      data: {
        month,
        year,
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: profit,
        pdfData: Buffer.from(pdfBuffer), // Salva o arquivo
      },
    });

    this.logger.log('Relatório mensal gerado e salvo com sucesso!');
  }
}
