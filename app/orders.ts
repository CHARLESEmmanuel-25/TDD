export interface Article {
  type: string;
  prix: number;
}

export interface DiscountCondition {
  productType?: string;
  minOrderAmount?: number;
}

export interface Discount {
  type: 'percentage' | 'fixed' | 'freeItem' | 'blackfriday';
  amount?: number;
  articleType?: string;
  condition?: DiscountCondition;
}

export interface Cart {
  articles: Article[];
  discounts?: Discount[];
  date?: string;
}

export interface NotificationService {
  notifyPriceFinal(price: number): void;
}

export class CalculatePriceUseCase {
  constructor(private readonly notificationService: NotificationService) {}

  execute(panier: Cart): number {
    return panier.articles.reduce((acc, article) => acc + article.prix, 0);
  }
}
