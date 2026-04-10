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
    const articles = panier.articles;
    const discounts = panier.discounts ?? [];

    let price = articles.reduce((acc, a) => acc + a.prix, 0);

    // 1. Promos "produit" appliquées en premier (règle métier)
    const freeItemDiscounts = discounts.filter(d => d.type === 'freeItem');
    for (const discount of freeItemDiscounts) {
      const article = articles.find(a => a.type === discount.articleType);
      if (article) {
        price = Math.max(0, price - article.prix);
      }
    }

    const fixedDiscounts = discounts.filter(d => d.type === 'fixed');
    const totalFixed = fixedDiscounts.reduce((acc, d) => acc + (d.amount ?? 0), 0);
    price -= totalFixed;

    const percentageDiscounts = discounts.filter(d => d.type === 'percentage');
    const totalPercent = percentageDiscounts.reduce((acc, d) => acc + (d.amount ?? 0), 0);
    if (totalPercent > 0) {
      price -= (price * totalPercent) / 100;
    }

    return price;
  }
}
