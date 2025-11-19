// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PdfService } from 'src/pdf/pdf.service';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    const userId = req.user.userId;
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  // --- ENDPOINT DE PDF CORRIGIDO ---
  @Get(':id/pdf')
  async getOrderPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    // 1. CORREÇÃO: Desestruture o retorno do serviço
    const { html, order } = await this.pdfService.generateOrderHtml(id);
    
    // 2. CORREÇÃO: Passe apenas a string 'html' para o gerador
    const pdfBuffer = await this.pdfService.generatePdfFromHtml(html);

    // 3. Lógica para o nome do arquivo (usando o objeto 'order' que recuperamos)
    const date = new Date(order.createdAt);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // Limpa o nome do cliente para usar no arquivo
    const clientName = (order.client?.name || 'Pedido_Interno')
      .replace(/[^a-zA-Z0-9]/g, '_');

    const filename = `pedido_${order.id}_${clientName}_${dateString}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    res.send(pdfBuffer);
  }
  // --------------------------------

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}