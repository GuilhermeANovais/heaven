// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards, // 1. Importar o UseGuards
  Request,   // 2. Importar o Request (para aceder ao req.user)
  ParseIntPipe, // 3. Importar o ParseIntPipe (para validar IDs)
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; // 4. Importar o nosso "Guarda"

@UseGuards(JwtAuthGuard) // 5. Proteger TODAS as rotas deste controlador
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Endpoint: POST /orders
   * Cria um novo pedido
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    // 6. O req.user é injetado pelo JwtAuthGuard (da nossa JwtStrategy)
    // A nossa JwtStrategy retorna { userId: payload.sub, email: payload.email }
    const userId = req.user.userId;
    
    // 7. Passamos os itens E o ID do utilizador para o serviço
    return this.ordersService.create(createOrderDto, userId);
  }

  /**
   * Endpoint: GET /orders
   * Lista todos os pedidos (já implementámos isto no service)
   */
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  /**
   * Endpoint: GET /orders/:id
   * Busca um pedido específico (já implementámos isto no service)
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  /**
   * Endpoint: PATCH /orders/:id
   * Atualiza um pedido (ex: status)
   */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
    // A lógica disto ainda não foi implementada no service
    return this.ordersService.update(id, updateOrderDto);
  }

  /**
   * Endpoint: DELETE /orders/:id
   * Deleta um pedido
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    // A lógica disto ainda não foi implementada no service
    return this.ordersService.remove(id);
  }
}
