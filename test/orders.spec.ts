
import { log } from "console";
import { describe,expect,test } from "vitest";


//variables global



function calculPrice(panier){
    const articles = panier.articles
    const prixFinal =  articles.reduce((acc,element)=> acc + element.prix , 0)
    if(!panier.discounts ){
        return prixFinal
    }

    const fixeDiscounts = panier.discounts.filter(d => d.type === 'fixed');
    const fixeDiscountCalculate = fixeDiscounts.reduce((prixG,discount)=> prixG + discount.amount,0)
    const freeItemDiscount = panier.discounts.filter(d => d.type === 'freeItem');
    
    

    const percentageDiscounts = panier.discounts.filter(d => d.type === 'percentage')
    const discount = (prixFinal * percentageDiscounts.reduce((acc,discount)=> acc + discount.amount, 0 )) / 100

    
    if(fixeDiscounts.length > 0 ){
        const result = prixFinal - fixeDiscountCalculate
        
        if(percentageDiscounts.length > 0){
            const calculBothdDiscount = (result * percentageDiscounts.reduce((acc,discount)=> acc + discount.amount, 0 )) / 100
            
            return result - calculBothdDiscount
        }
        
        return result
    }

    if(freeItemDiscount.length > 0){
        const freeItemTotal = freeItemDiscount.reduce((acc, discount) => {
            const article = articles.find(a => a.type === discount.articleType)
            return acc + (article ? article.prix : 0)
        }, 0)
        return prixFinal - freeItemTotal  
    }

    const blackFridayDiscount = panier.discounts.filter(d => d.type === 'blackfriday')
    if(blackFridayDiscount.length > 0){
        const date = new Date(panier.date)
        const start = new Date('2025-11-28')
        const end = new Date('2025-11-30')
        if(date >= start && date <= end){
            return Math.max(1, prixFinal * 0.5)
        }
    }
    
    
    return prixFinal - discount
     
}

describe('orders without discount', ()=>{

    /*
    * test 1 : implémentation pour faire passer le test au vert
    * commit: "test: Test 1 - calculer le prix sans remise"
    *
    * calculPrice(panier) {
    *   return 20 + 30 + 2  // valeur codée en dur
    * }
    *
    * test 1 : après refactorisation du code
    * calculPrice(panier) {
    *   const articles = panier.articles
    *   return articles.reduce((acc, element) => acc + element.prix, 0)
    * }
    */

    test('should calculate price without discount', ()=>{

        const panier = {
            articles:[
                {
                    type: 'tishirt',
                    prix : 20
                },
                {
                    type: 'pantalon',
                    prix: 30
                },
                                {
                    type: 'pantalon',
                    prix: 2
                }

            ]
        }
 
        const result = calculPrice(panier)

        expect(result).toBe(52)

    })
})

describe('with percentage discount', ()=>{
    /*
    * test 2 : implémentation pour faire passer le test au vert
    * commit: "test: Test 2 - remise en pourcentage"
    *
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)
    *   return prixFinal - (prixFinal * 35) / 100  // valeur codée en dur
    * }
    *
    * test 2 : après refactorisation du code
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)
    *   const percentageDiscounts = panier.discounts.filter(d => d.type === 'percentage')
    *   const discount = (prixFinal * percentageDiscounts.reduce((acc, d) => acc + d.amount, 0)) / 100
    *   return prixFinal - discount
    * }
    */

    test('should calculate price with -10% discount', ()=>{
        const panier = {
            articles:[
                {
                    type: 'tishirt',
                    prix : 20
                },
            ],
            discounts :[
                {
                    type : 'percentage',
                    amount: 10
                },
                {
                    type : 'percentage',
                    amount: 25
                },
                
            ]
        }
        const result = calculPrice(panier)

        expect(result).toBe(13)
    })
})

describe('should calculate price with fix discount', ()=>{

    /*
    * test 3 : implémentation pour faire passer le test au vert
    * commit: "test: Tests 3 & 4 - remise fixe et ordre d'application fixe → pourcentage"
    *
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)
    *   return prixFinal - 50  // valeur codée en dur
    * }
    *
    * test 3 : après refactorisation du code
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)
    *   const fixeDiscounts = panier.discounts.filter(d => d.type === 'fixed')
    *   const fixeDiscountCalculate = fixeDiscounts.reduce((prixG, d) => prixG + d.amount, 0)
    *   if (fixeDiscounts.length > 0) return prixFinal - fixeDiscountCalculate
    * }
    */


    test('should calculate price with fixed discount', ()=>{
        const panier ={
            articles:[
                {
                    type :'veste',
                    prix: 156
                },
                {
                    type :'veste en cuire',
                    prix: 200
                }
            ],
            discounts:[
                {
                    type : 'fixed',
                    amount: 30
                },
                {
                    type : 'fixed',
                    amount: 20
                }
            ]
        }

        const result = calculPrice(panier)

        expect(result).toBe(306)
    })
})

describe('should be calculate price with fix and percentage', ()=>{
    /*
    * test 4 : implémentation pour faire passer le test au vert
    * commit: "test: Tests 3 & 4 - remise fixe et ordre d'application fixe → pourcentage"
    *
    * L'ordre est crucial : la remise fixe s'applique AVANT le pourcentage.
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)
    *   const result = prixFinal - 5       // fixed en dur
    *   return result - result * 10 / 100  // pourcentage sur le prix réduit → 225
    * }
    *
    * test 4 : après refactorisation du code
    * calculPrice(panier) {
    *   const result = prixFinal - fixeDiscountCalculate
    *   if (percentageDiscounts.length > 0) {
    *     const calculBothdDiscount = (result * percentageDiscounts.reduce(...)) / 100
    *     return result - calculBothdDiscount
    *   }
    *   return result
    * }
    */

    test('should calculate with fix and percentage', ()=>{
        const panier ={
            articles:[
                {
                    type : 'bouteille',
                    prix: 255
                }
            ],
            discounts :[
                {
                    type : 'fixed',
                    amount: 5
                },
                {
                    type : 'percentage',
                    amount: 10
                }
            ]
        }
        const result = calculPrice(panier);

        expect(result).toBe(225)
    })
})

describe('should Buy one item and get one free', ()=>{
    /*
    * test 5 : implémentation pour faire passer le test au vert
    * commit: "test: Test 5 - produit acheté, produit offert (freeItem)"
    *
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)  // 54
    *   return prixFinal - 12 - 15              // stylo et rad offerts en dur → 27
    * }
    *
    * test 5 : après refactorisation du code
    * calculPrice(panier) {
    *   const freeItemDiscount = panier.discounts.filter(d => d.type === 'freeItem')
    *   if (freeItemDiscount.length > 0) {
    *     const freeItemTotal = freeItemDiscount.reduce((acc, discount) => {
    *       const article = articles.find(a => a.type === discount.articleType)
    *       return acc + (article ? article.prix : 0)
    *     }, 0)
    *     return prixFinal - freeItemTotal  // soustrait le prix de chaque article offert
    *   }
    * }
    */

    test('by one item get one free', ()=>{
        const panier ={
            articles:[
                {
                    type : 'stylo',
                    prix: 12
                },
                {
                    type : 'stylo',
                    prix :12
                },
                {
                    type : 'rad',
                    prix : 15
                },
                {
                    type : 'rad',
                    prix: 15
                }
            ],

        discounts: [
            {
                type: 'freeItem',
                articleType: 'stylo'
            },
            {
                type: 'freeItem',
                articleType: 'rad'
            }
        ]
        }

        const result = calculPrice(panier)

        expect(result).toBe(27)
    })
})

describe('Black friday',()=>{

    /*
    * test 6 : implémentation pour faire passer le test au vert
    * commit: "test: Test 6 - remise Black Friday (50% du 28 au 30 novembre)"
    *
    * calculPrice(panier) {
    *   const prixFinal = articles.reduce(...)
    *   return prixFinal * 0.5  // 50% codé en dur
    * }
    *
    * test 6 : après refactorisation du code
    * calculPrice(panier) {
    *   const blackFridayDiscount = panier.discounts.filter(d => d.type === 'blackfriday')
    *   if (blackFridayDiscount.length > 0) {
    *     const date = new Date(panier.date)
    *     const start = new Date('2025-11-28')
    *     const end   = new Date('2025-11-30')
    *     if (date >= start && date <= end) {
    *       return Math.max(1, prixFinal * 0.5)  // plancher à 1€ minimum
    *     }
    *   }
    * }
    */

    test('black friday', ()=>{
        const panier ={
            date : '2025-11-28',
            articles : [
                {
                    type : 'pantalon',
                    prix : 50
                }
            ],
            discounts:[
                {
                    type : 'blackfriday',
                    amount : 50
                }
            ]
        }

        const result = calculPrice(panier)

        expect(result).toBe(25)
    })
})
