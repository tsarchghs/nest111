import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import type {
  CreateOrderDto,
  AddOrderItemDto,
  UpdateOrderDto,
} from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Query('tableId') tableId?: string) {
    if (tableId) {
      return this.ordersService.findByTable(tableId);
    }
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Get(':id/items')
  getOrderItems(@Param('id') id: string) {
    return this.ordersService.getOrderItems(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() addItemDto: AddOrderItemDto) {
    return this.ordersService.addItem(id, addItemDto);
  }

  @Put('items/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() body: { quantity: number }) {
    return this.ordersService.updateItem(itemId, body.quantity);
  }

  @Delete('items/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.ordersService.removeItem(itemId);
  }
}
