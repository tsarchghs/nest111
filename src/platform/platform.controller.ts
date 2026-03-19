import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AllowedAreas } from '../auth/areas.decorator';
import type { AuthSessionUser } from '../auth/access.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { PlatformService } from './platform.service';

@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @AllowedAreas('erp')
  @Get('erp/overview')
  getErpOverview(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getErpOverview(user);
  }

  @AllowedAreas('erp', 'pos')
  @Get('catalog')
  getCatalog(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getCatalog(user);
  }

  @AllowedAreas('erp')
  @Post('erp/products')
  saveProduct(@CurrentUser() user: AuthSessionUser, @Body() body: Record<string, unknown>) {
    return this.platformService.saveProduct(user, body as never);
  }

  @AllowedAreas('erp')
  @Get('erp/sales')
  getSales(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getSales(user);
  }

  @AllowedAreas('erp')
  @Post('erp/sales')
  createInvoice(@CurrentUser() user: AuthSessionUser, @Body() body: Record<string, unknown>) {
    return this.platformService.createInvoice(user, body as never);
  }

  @AllowedAreas('erp')
  @Get('erp/reports')
  getReports(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getReports(user);
  }

  @AllowedAreas('admin')
  @Get('admin/branches')
  getBranches(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getBranches(user);
  }

  @AllowedAreas('admin')
  @Put('admin/branches/:branchId')
  updateBranch(
    @CurrentUser() user: AuthSessionUser,
    @Param('branchId') branchId: string,
    @Body() body: { status: string; manager_name: string },
  ) {
    return this.platformService.updateBranch(user, branchId, body);
  }

  @AllowedAreas('admin')
  @Get('admin/bank-accounts')
  getBankAccounts(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getBankAccounts(user);
  }

  @AllowedAreas('admin')
  @Put('admin/bank-accounts/:accountId')
  updateBankAccount(
    @CurrentUser() user: AuthSessionUser,
    @Param('accountId') accountId: string,
    @Body() body: { status: string; account_name: string },
  ) {
    return this.platformService.updateBankAccount(user, accountId, body);
  }

  @AllowedAreas('admin')
  @Get('admin/settings')
  getBusinessSettings(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getBusinessSettings(user);
  }

  @AllowedAreas('admin')
  @Put('admin/settings')
  updateBusinessSettings(
    @CurrentUser() user: AuthSessionUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.platformService.updateBusinessSettings(user, body);
  }

  @AllowedAreas('pos')
  @Get('pos/floor')
  getPosFloor(@CurrentUser() user: AuthSessionUser) {
    return this.platformService.getPosFloor(user);
  }

  @AllowedAreas('pos')
  @Get('pos/tables/:tableId/session')
  getPosTableSession(
    @CurrentUser() user: AuthSessionUser,
    @Param('tableId') tableId: string,
  ) {
    return this.platformService.getPosTableSession(user, tableId);
  }

  @AllowedAreas('pos')
  @Post('pos/orders/:orderId/items')
  addPosItem(
    @CurrentUser() user: AuthSessionUser,
    @Param('orderId') orderId: string,
    @Body() body: { product_id: string; quantity: number; notes?: string },
  ) {
    return this.platformService.addPosItem(user, orderId, body);
  }

  @AllowedAreas('pos')
  @Put('pos/order-items/:itemId')
  updatePosItem(
    @CurrentUser() user: AuthSessionUser,
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
  ) {
    return this.platformService.updatePosItem(user, itemId, body);
  }

  @AllowedAreas('pos')
  @Delete('pos/order-items/:itemId')
  removePosItem(
    @CurrentUser() user: AuthSessionUser,
    @Param('itemId') itemId: string,
  ) {
    return this.platformService.removePosItem(user, itemId);
  }

  @AllowedAreas('pos')
  @Post('pos/orders/:orderId/checkout')
  checkoutPosOrder(
    @CurrentUser() user: AuthSessionUser,
    @Param('orderId') orderId: string,
    @Body()
    body: {
      tip: number;
      payment_method: string;
      amount: number;
      split_info?: Record<string, unknown>;
    },
  ) {
    return this.platformService.checkoutPosOrder(user, orderId, body);
  }
}
