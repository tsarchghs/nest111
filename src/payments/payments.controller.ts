import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { CreatePaymentDto } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findByOrder(@Query('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }
}
