// src/reports/reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // Lista o histórico (sem o arquivo pesado)
  async findAll() {
    return this.prisma.monthlyReport.findMany({
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      // Selecionamos apenas os campos leves para a tabela
      select: {
        id: true,
        month: true,
        year: true,
        totalRevenue: true,
        totalExpenses: true,
        netProfit: true,
        createdAt: true,
        // pdfData: false, // Não trazemos o PDF aqui para não pesar
      },
    });
  }

  // Busca o PDF para download
  async getPdf(id: number) {
    const report = await this.prisma.monthlyReport.findUnique({
      where: { id },
      select: {
        month: true,
        year: true,
        pdfData: true, // Aqui sim, trazemos o arquivo
      },
    });

    if (!report) {
      throw new NotFoundException('Relatório não encontrado.');
    }

    return report;
  }
}