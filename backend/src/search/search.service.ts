// src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchGlobal(query: string) {
    if (!query || query.length < 2) {
      return { clients: [], orders: [], products: [] };
    }

    // Normaliza para busca case-insensitive (se o banco permitir, ou usamos contains)
    const searchTerm = query.trim();

    // Executa as 3 buscas simultaneamente
    const [clients, orders, products] = await Promise.all([
      
      // 1. Buscar Clientes (Nome ou Telefone)
      this.prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm } },
          ],
        },
        take: 5, // Limita a 5 resultados
      }),

      // 2. Buscar Pedidos (ID ou Nome do Cliente)
      this.prisma.order.findMany({
        where: {
          OR: [
            // Se for número, tenta buscar pelo ID
            ...(!isNaN(Number(searchTerm)) ? [{ id: Number(searchTerm) }] : []),
            // Busca pelo nome do cliente associado
            { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
          ],
        },
        include: { client: { select: { name: true } } },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),

      // 3. Buscar Produtos (Nome)
      this.prisma.product.findMany({
        where: {
          name: { contains: searchTerm, mode: 'insensitive' },
        },
        take: 5,
      }),
    ]);

    return { clients, orders, products };
  }
}
