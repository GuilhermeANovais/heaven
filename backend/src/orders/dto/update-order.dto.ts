// src/orders/dto/update-order.dto.ts
import { IsString, IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';

const validStatus = [
  'PENDENTE',
  'EM_PREPARO',
  'PRONTO',
  'CONCLUÍDO',
  'CANCELADO',
  'SINAL_PAGO',
];

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  @IsIn(validStatus, { message: 'Status inválido.' })
  status?: string;

  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}
