import { describe,expect,test } from "vitest";


//variables global



function calculPrice(panier){
    let prixFinal = 0;

    const article =  panier.articles

    for (const element of article) {
        prixFinal += element.prix
    }
    return prixFinal
}

describe('course reservation', ()=>{

    test('should calculate price without bound', ()=>{

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

