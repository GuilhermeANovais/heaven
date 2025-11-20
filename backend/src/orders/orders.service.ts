// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria um novo Pedido com itens, cliente opcional e data de entrega
   */
  async create(createOrderDto: CreateOrderDto, userId: number) {
    // 1. Desestruture todos os campos, incluindo a nova data de entrega
    const { items, clientId, observations, deliveryDate } = createOrderDto;

    // --- Validação (Itens e Produtos) ---
    const productIds = items.map((item) => item.productId);
    const productsInDb = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Verifica se todos os produtos existem
    if (productsInDb.length !== productIds.length) {
      throw new NotFoundException('Um ou mais produtos não foram encontrados.');
    }

    // --- Validação (Cliente) ---
    if (clientId) {
      const clientExists = await this.prisma.client.findUnique({
        where: { id: clientId },
      });
      if (!clientExists) {
        throw new NotFoundException(`Cliente com ID ${clientId} não encontrado.`);
      }
    }

    // --- Cálculo (Total e Preparação dos Itens) ---
    let total = 0;
    const orderItemsData = items.map((item) => {
      const product = productsInDb.find((p) => p.id === item.productId);
      
      // Segurança extra caso o find falhe (embora verificado acima)
      if (!product) {
        throw new BadRequestException(`Produto com ID ${item.productId} não encontrado.`);
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Salva o preço exato do momento da compra
      };
    });

    // --- Transação (Criação Atômica) ---
    // Garante que o Pedido e os Itens sejam criados juntos ou nenhum deles
    return this.prisma.$transaction(async (tx) => {
      // 1. Cria o Pedido "pai"
      const order = await tx.order.create({
        data: {
          userId: userId,
          total: total,
          status: 'PENDENTE',
          observations: observations,
          clientId: clientId,
          deliveryDate: deliveryDate, // Salva a data de entrega
        },
      });

      // 2. Cria os Itens do Pedido "filhos"
      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      });

      // 3. Retorna o pedido completo com as relações carregadas
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          client: true, // Retorna os dados do cliente para o frontend
        },
      });
    });
  }

  /**
   * Lista todos os pedidos
   */
  findAll() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc', // Mais recentes primeiro
      },
      include: {
        user: {
          select: { name: true, email: true } // Dados do funcionário
        },
        client: {
          select: { name: true, phone: true } // Dados do cliente
        },
        items: {
          include: {
            product: {
              select: { name: true } // Nome do produto em cada item
            }
          }
        }
      }
    });
  }

  /**
   * Busca um pedido específico pelo ID
   */
  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        client: {
          select: { name: true, phone: true, address: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, price: true }
            }
          }
        }
      }
    });
  }

  /**
   * Atualiza um pedido (ex: Status)
   */
  update(id: number, updateOrderDto: UpdateOrderDto) {
    const { status, clientId, deliveryDate, observations } = updateOrderDto;

    return this.prisma.order.update({
      where: { id: id },
      data: {
        status: status,
        clientId: clientId,
        deliveryDate: deliveryDate,
        observations: observations,
      },
    });
  }

  /**
   * Deleta um pedido e seus itens (Transação)
   */
  remove(id: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Primeiro deleta os itens (filhos)
      await tx.orderItem.deleteMany({
        where: {
          orderId: id,
        },
      });

      // 2. Depois deleta o pedido (pai)
      const deletedOrder = await tx.order.delete({
        where: {
          id: id,
        },
      });

      return deletedOrder;
    });
  }
}