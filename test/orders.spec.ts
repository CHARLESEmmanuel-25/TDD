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

// ---------------------------------------------------------------------------
// Test 3 : Remise fixe
// ---------------------------------------------------------------------------

/*
 * Test 3 : implémentation pour faire passer le test au vert
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     let price = articles.reduce(...)
 *     price -= 50  // valeur codée en dur
 *     return price
 *   }
 * }
 *
 * Test 3 : après refactorisation du code
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     let price = articles.reduce(...)
 *     const totalFixed = fixedDiscounts.reduce((acc, d) => acc + d.amount, 0)
 *     price -= totalFixed
 *     // ...percentage ensuite
 *     return price
 *   }
 * }
 */
describe('with fixed discount', () => {
  test('should calculate price with multiple fixed discounts', () => {
    const useCase = new CalculatePriceUseCase(stub);
    const panier: Cart = {
      articles: [
        { type: 'veste', prix: 156 },
        { type: 'veste en cuire', prix: 200 },
      ],
      discounts: [
        { type: 'fixed', amount: 30 },
        { type: 'fixed', amount: 20 },
      ],
    };
    // 356 - 30 - 20 = 306
    expect(useCase.execute(panier)).toBe(306);
  });
});


// Test 4 : Remise fixe + pourcentage (vérification de l'ordre d'application)


/*
 * Test 4 : implémentation pour faire passer le test au vert
 * L'ordre est crucial : la remise fixe doit s'appliquer AVANT le pourcentage.
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     let price = 255
 *     price -= 5       // fixed d'abord
 *     price -= price * 10 / 100  // pourcentage sur le prix réduit
 *     return price     // 250 - 25 = 225
 *   }
 * }
 *
 * Test 4 : après refactorisation du code
 * Même logique, déjà générique grâce aux étapes précédentes.
 */
describe('with fixed and percentage discount', () => {
  test('should apply fixed discount before percentage', () => {
    const useCase = new CalculatePriceUseCase(stub);
    const panier: Cart = {
      articles: [{ type: 'bouteille', prix: 255 }],
      discounts: [
        { type: 'fixed', amount: 5 },
        { type: 'percentage', amount: 10 },
      ],
    };
    // 255 - 5 = 250, puis 250 - 10% = 225
    expect(useCase.execute(panier)).toBe(225);
  });
});

// ---------------------------------------------------------------------------
// Test 5 : Produit acheté = produit offert (freeItem)
// ---------------------------------------------------------------------------

/*
 * Test 5 : implémentation pour faire passer le test au vert
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     let price = 54
 *     price -= 12  // un stylo offert (codé en dur)
 *     price -= 15  // un rad offert (codé en dur)
 *     return price // 27
 *   }
 * }
 *
 * Test 5 : après refactorisation du code
 * CalculatePriceUseCase {
 *   execute(panier) {
 *     // 1. freeItem en premier (règle métier : promos "produit" avant fixed/%)
 *     for (const discount of freeItemDiscounts) {
 *       const article = articles.find(a => a.type === discount.articleType)
 *       if (article) price = Math.max(0, price - article.prix)
 *     }
 *     // 2. fixed, 3. percentage...
 *   }
 * }
 */
describe('with freeItem discount', () => {
  test('should offer one item free per freeItem discount', () => {
    const useCase = new CalculatePriceUseCase(stub);
    const panier: Cart = {
      articles: [
        { type: 'stylo', prix: 12 },
        { type: 'stylo', prix: 12 },
        { type: 'rad', prix: 15 },
        { type: 'rad', prix: 15 },
      ],
      discounts: [
        { type: 'freeItem', articleType: 'stylo' },
        { type: 'freeItem', articleType: 'rad' },
      ],
    };
    // 54 - 12 (stylo offert) - 15 (rad offert) = 27
    expect(useCase.execute(panier)).toBe(27);
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
