import { productApi } from "../api";
import type { Product } from "../types";

export async function publishProduct(productId: string): Promise<Product> {
  return productApi.updateProduct(productId, { status: "ACTIVE" });
}
