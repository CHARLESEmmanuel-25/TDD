
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
    * CalculatePriceUseCase {
    *   execute(panier) {
    *     return 20 + 30 + 2  // valeur codée en dur
    *   }
    * }
    *
    * test 1 : après refactorisation du code
    * CalculatePriceUseCase {
    *   execute(panier) {
    *     return panier.articles.reduce((acc, article) => acc + article.prix, 0)
    *   }
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
    * CalculatePriceUseCase {
    *   execute(panier) {
    *     let price = articles.reduce(...)
    *     return price - (price * 35) / 100  // valeur codée en dur
    *   }
    * }
    *
    * test 2 : après refactorisation du code
    * CalculatePriceUseCase {
    *   execute(panier) {
    *     let price = articles.reduce(...)
    *     const totalPercent = percentageDiscounts.reduce((acc, d) => acc + d.amount, 0)
    *     if (totalPercent > 0) price -= (price * totalPercent) / 100
    *     return price
    *   }
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
