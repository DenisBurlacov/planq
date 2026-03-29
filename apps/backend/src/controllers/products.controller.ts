import type { Request, Response, NextFunction } from 'express';
import * as productsService from '@services/products.service.js';
import { ok } from '@utils/response.js';

export async function getProductsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = productsService.ProductsQuerySchema.parse(req.query);
    const result = await productsService.getProducts(query);
    ok(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.getProductById(req.params.id as string);
    ok(res, product);
  } catch (err) {
    next(err);
  }
}

export async function getProductStockHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const stock = await productsService.getProductStock(req.params.id as string);
    ok(res, stock);
  } catch (err) {
    next(err);
  }
}
