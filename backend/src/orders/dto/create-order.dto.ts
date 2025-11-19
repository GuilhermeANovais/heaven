// src/orders/dto/create-order.dto.ts
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsInt,
  IsOptional,
  IsString,
  IsDateString
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto'; // (Esta importação está correta aqui)

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  // --- CAMPOS QUE FALTAVAM ---
  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;
}
