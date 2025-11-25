import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request, ParseIntPipe 
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Protege todas as rotas
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  // 1. Injetamos o Request para acessar o usuário logado
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req: any) {
    // 2. Pegamos o ID do usuário do token
    const userId = req.user.userId;
    
    // 3. Passamos o userId como segundo argumento, corrigindo o erro
    return this.expensesService.create(createExpenseDto, userId);
  }

  @Get()
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
