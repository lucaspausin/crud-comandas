import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentPlansService } from './payment-plans.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';

@Controller('payment-plans')
export class PaymentPlansController {
  constructor(private readonly paymentPlansService: PaymentPlansService) {}

  @Post()
  async create(@Body() createPaymentPlanDto: CreatePaymentPlanDto) {
    try {
      return await this.paymentPlansService.create(createPaymentPlanDto);
    } catch (error) {
      throw new BadRequestException(
        'Error creating payment plan: ' + error.message,
      );
    }
  }

  @Get()
  async findAll() {
    return await this.paymentPlansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const plan = await this.paymentPlansService.findOne(id);
    if (!plan) {
      throw new NotFoundException(`Payment plan with ID ${id} not found`);
    }
    return plan;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentPlanDto: UpdatePaymentPlanDto,
  ) {
    try {
      return await this.paymentPlansService.update(id, updatePaymentPlanDto);
    } catch (error) {
      throw new BadRequestException(
        'Error updating payment plan: ' + error.message,
      );
    }
  }

  @Patch(':id/position')
  async updatePosition(
    @Param('id', ParseIntPipe) id: number,
    @Body('position') position: number,
  ) {
    try {
      return await this.paymentPlansService.updatePosition(id, position);
    } catch (error) {
      throw new BadRequestException(
        'Error updating payment plan position: ' + error.message,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.paymentPlansService.remove(id);
      return { message: 'Payment plan deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        'Error deleting payment plan: ' + error.message,
      );
    }
  }
}
