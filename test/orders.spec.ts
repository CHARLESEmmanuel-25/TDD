import { describe, expect, test } from 'vitest';
import { Cart, CalculatePriceUseCase, NotificationService } from '@/orders';

// Stub : remplace le service de notification sans vérifier les appels.
// Utilisé dans les tests qui ne s'intéressent pas au comportement de notification.
class StubNotificationService implements NotificationService {
  notifyPriceFinal(_price: number): void {}
}

const stub = new StubNotificationService();

// ---------------------------------------------------------------------------
// Test 1 : Calcul du prix sans remise
// ---------------------------------------------------------------------------


/*
 * Test 1 : implémentation pour faire passer le test au vert
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     return 20 + 30 + 2  // valeur codée en dur
 *   }
 * }
 *
 * Test 1 : après refactorisation du code
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     return panier.articles.reduce((acc, article) => acc + article.prix, 0)
 *   }
 * }
 */
// ---------------------------------------------------------------------------
// Test 2 : Remise en pourcentage
// ---------------------------------------------------------------------------

/*
 * Test 2 : implémentation pour faire passer le test au vert
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     let price = articles.reduce(...)
 *     return price - (price * 35) / 100  // valeur codée en dur
 *   }
 * }
 *
 * Test 2 : après refactorisation du code
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     let price = articles.reduce(...)
 *     const totalPercent = percentageDiscounts.reduce((acc, d) => acc + d.amount, 0)
 *     if (totalPercent > 0) price -= (price * totalPercent) / 100
 *     return price
 *   }
 * }
 */
describe('with percentage discount', () => {
  test('should calculate price with cumulative percentage discounts', () => {
    const useCase = new CalculatePriceUseCase(stub);
    const panier: Cart = {
      articles: [{ type: 'tshirt', prix: 20 }],
      discounts: [
        { type: 'percentage', amount: 10 },
        { type: 'percentage', amount: 25 },
      ],
    };
    // 20 - (20 * 35%) = 20 - 7 = 13
    expect(useCase.execute(panier)).toBe(13);
  });
});

describe('orders without discount', () => {
  test('should calculate price without discount', () => {
    const useCase = new CalculatePriceUseCase(stub);
    const panier: Cart = {
      articles: [
        { type: 'tshirt', prix: 20 },
        { type: 'pantalon', prix: 30 },
        { type: 'pantalon', prix: 2 },
      ],
    };
    expect(useCase.execute(panier)).toBe(52);
  });
});
