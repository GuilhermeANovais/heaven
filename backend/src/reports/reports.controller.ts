import { Controller, Get, Post, Body, UseGuards, Res, Param, ParseIntPipe } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Post('generate')
  async generateReport(@Body() body: { month: number; year: number }) {
    return this.reportsService.createManualReport(body.month, body.year);
  }

  @Get(':id/download')
  async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const report = await this.reportsService.findOne(id);

    // Configura os headers para indicar que é um ficheiro PDF para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="relatorio_${report.month}_${report.year}.pdf"`,
    );

    // Envia o buffer do PDF que está na base de dados
    res.send(report.pdfData);
  }
}
