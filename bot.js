const TG_BOT = require('node-telegram-bot-api')
const fetch = require('node-fetch');
const token = '1653544018:AAHrVGFv-oie7e1Pd30vzj7OgqHjP5xaMks'

var admin = require('firebase-admin');
var serviceAccount = require("./key/reduxpractics-firebase-adminsdk-wttf1-c9ca92b516.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://reduxpractics-default-rtdb.europe-west1.firebasedatabase.app"
});


const database = admin.database()


const myBot = new TG_BOT(token, {polling: true})

const keyboard = {
    "reply_markup": {
        resize_keyboard: true,
        one_time_keyboard: true,
        "keyboard": [[
            {
                text: 'Случайный коктейль',
            },
            {
                text: 'Избранные коктейли',
            }
        ]]
    }
}

var options = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'Добавить в избранное', callback_data: '1'}],
        ]
    })
};
const getOptions = name => {
    let {type} = JSON.parse(name)
    if (type === 'save') {
        return {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'Добавить в избранное', callback_data: name}],
                ]
            })
        }
    }
    return {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Показать', callback_data: name}],
            ]
        })
    }

}
myBot.on('callback_query', query => {
    let {type, data} = JSON.parse(query.data)
    switch (type) {
        case 'save':
            let name = ''
            console.log(data)
            database.ref(`users/${query.from.username}/favorites/${data.trim()}`).set('+')
            break
        case 'show':
            database.ref(`/users/${query.from.username}/favorites/${data}`).once('value', snp => {
                fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${snp.key.toString()}`)
                    .then(r => r.json())
                    .then(b => {
                        let q = b.drinks[0]
                        let ing = []
                        for (let i = 0; i < 15; i++) {
                            if (q[`strIngredient${i}`]) {
                                ing.push(q[`strIngredient${i}`])
                            }
                        }
                        let img = q.strDrinkThumb
                        let data = `
                            \r\nНазвание: ${q.strDrink}
                            \r\nАлкогольный: ${q.strAlcoholic === "Alcoholic" ? 'Да' : 'Нет'}
                            \r\nРецепт: ${b.drinks[0].strInstructions}
                            ${ing.map((i, index) => `\r\nИнгредиент ${index + 1}: ${i}`)}
                            `
                        myBot.sendPhoto(query.message.chat.id, img)
                            .then(() => myBot.sendMessage(query.message.chat.id, data))

                    })
            })
            break
    }


})
const commandList = `
/start
/get name - вместо [NAME] введите название коктейля на английском
/random - получите случайный коктейль 
`
const getExample = `
\r\n/get margarita😏
\r\n/get vodka🥴
\r\n/get lime😷
\r\n/get black russian😈

`

const a = ['./vendors//cats/dwoilp3BVjlE.jpg', './vendors//cats/f4d2961b652880be432fb9580891ed62.png', './vendors//cats/base_87716f252d.jpg']
myBot.onText(/\/start/, (msg) => {
    myBot.sendMessage(msg.chat.id, `
    \r\nБот, который поможет вам определиться с напитком!
   \r\nПишите /get name , где виесто [name] название коктейля или ингредиента на английском
   \r\nПример /get margarita /get lime
    `, keyboard)
})

myBot.onText(/\/menu/, (msg) => {

    myBot.sendMessage(msg.chat.id, 'Меню открыто', keyboard)

});

function rand() {
    return Math.floor(Math.random() * a.length)
}


function randomCocktail(msg) {
    return fetch('https://www.thecocktaildb.com/api/json/v1/1/random.php')
        .then(a => a.json())
        .then(b => {
            let q = b.drinks[0]
            let ing = []
            for (let i = 0; i < 15; i++) {
                if (q[`strIngredient${i}`]) {
                    ing.push(q[`strIngredient${i}`])
                }
            }
            let img = q.strDrinkThumb
            let data = `
            \r\nНазвание: ${q.strDrink}
            \r\nАлкгольный: ${q.strAlcoholic === "Alcoholic" ? 'Да' : 'Нет'}
            \r\nРецепт: ${b.drinks[0].strInstructions}
            ${ing.map((i, index) => `\r\nИнгридиент ${index + 1}: ${i}`)}
            `
            myBot.sendPhoto(msg.chat.id, img)
                .then(() => myBot.sendMessage(msg.chat.id, data, getOptions(JSON.stringify({
                        type: 'save',
                        data: q.strDrink,
                    })
                )))

        })
}

myBot.onText(/\/help/, (msg) => {

    myBot.sendMessage(msg.chat.id, commandList)

});
myBot.onText(/\/get (.+)/, (msg, match) => {
    let coctailName = match[1]
    if (coctailName) {
        try {
            fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${coctailName.toString()}`)
                .then(a => {
                    return a.json()
                })
                .then(b => {
                    let q = b.drinks[0]
                    let ing = []
                    for (let i = 0; i < 15; i++) {
                        if (q[`strIngredient${i}`]) {
                            ing.push(q[`strIngredient${i}`])
                        }
                    }
                    let img = q.strDrinkThumb
                    let data = `
            \r\nНазвание: ${q.strDrink}
            \r\nАлкогольный: ${q.strAlcoholic === "Alcoholic" ? 'Да' : 'Нет'}
            \r\nРецепт: ${b.drinks[0].strInstructions}
            ${ing.map((i, index) => `\r\nИнгредиент ${index + 1}: ${i}`)}
            `
                    myBot.sendPhoto(msg.chat.id, img)
                        .then(() => myBot.sendMessage(msg.chat.id, data, getOptions(JSON.stringify({
                                type: 'save',
                                data: q.strDrink,
                            })
                        )))

                })
            return
        } catch (e) {
            return
        }
    }
});


myBot.onText(/\/getex/, msg => {

    myBot.sendMessage(msg.chat.id, getExample)
})

myBot.onText(/\/random/, (msg, match) => {
    randomCocktail(msg)
})

myBot.on('message', (msg) => {
    switch (msg.text) {
        case '/hi':
            myBot.sendMessage(msg.chat.id, `И тебе привет, ${msg.from.username}`)
            break
        case 'Избранные коктейли':
            let userName = msg.from.username
            let userId = msg.chat.id
            database.ref(`users/${userName}/favorites`).on('value', snp => {
                let data = snp.val()
                for (let key in data) {
                    myBot.sendMessage(userId, key, getOptions(JSON.stringify({
                            text: 'Показать',
                            type: 'show',
                            data: key,
                        }))
                    )
                }
                /*myBot.sendMessage(userId, snp.val())*/
            })
            break
        case 'Случайный коктейль':
            randomCocktail(msg)
    }

});