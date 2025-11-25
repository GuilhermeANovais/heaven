// src/reports/reports.controller.ts
import { Controller, Get, Param, Res, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard) // Protegido: Apenas usuários logados
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // GET /reports -> Lista o histórico
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  // GET /reports/:id/download -> Baixa o PDF
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.getPdf(id);

    // Converte o Buffer do banco para um formato que o navegador entenda
    const buffer = Buffer.from(report.pdfData);

    // Configura os cabeçalhos para download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Relatorio_Mensal_${report.month}_${report.year}.pdf"`,
      'Content-Length': buffer.length,
    });

    // Envia o arquivo
    res.end(buffer);
  }
}