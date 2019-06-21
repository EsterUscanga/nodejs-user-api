const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let contador = 0

let usuarios = []

let usuario = {
    id: 0,
    nombre: '',
    apellido: ''
}

function validateCharacters(string, firstRange, secondRange) {
    let flag = false
    for (let index = 0; index < string.length; index++) {
        if ((string.charCodeAt(index) < firstRange.begin || string.charCodeAt(index) > firstRange.end) && (string.charCodeAt(index) < secondRange.begin || string.charCodeAt(index) > secondRange.end))
            flag = true
    }
    return flag
}

function areThereMany() {
    if (usuarios.length != 0)
        return true
    else
        return false
}
function deleteUser() {

}
function getUserByName() {

}
/* Post usuario
 * No poder agregar un usuario repetido
 * Nombres sin números ni signos solo letras
 */
app.post('/usuario', function (req, res) {
    let conditions = {
        "just_once": true,
        "just_letters": true
    }

    let ranges = [{ "begin": "65", "end": "90" }, { "begin": "97", "end": "172" }]

    usuarios.forEach(usr => {
        if (usr.nombre == req.body.nombre && usr.apellido == req.body.apellido) {
            conditions["just_once"] = false
        }
    })

    if (validateCharacters(req.body.nombre, ranges[0], ranges[1]) || validateCharacters(req.body.apellido, ranges[0], ranges[1]))
        conditions["just_letters"] = false

    if (conditions["just_letters"] && conditions["just_once"]) {
        usuario = {
            id: contador++,
            nombre: req.body.nombre,
            apellido: req.body.apellido
        }
        usuarios.push(usuario)

        res.send('Usuario Creado')
    }
    else {
        if (!conditions["just_letters"])
            res.send("El nombre y apellido solo puede contener letras")
        else if (!conditions["just_once"])
            res.send("El usuario ya ha sido creado")

    }

})

/* Get usuario
 * Tener la opción de mostrar todos los usuarios
 */
app.get('/usuario', function (req, res) {
    if (areThereMany())
        res.send(usuarios)
    else
        res.send('No hay usuarios creados')
})
/* Get usuario
 * Poder buscar por ID
 */

app.get('/usuario/id/:id', function (req, res) {
    let user
    if (areThereMany()) {
        usuarios.forEach(usr => {
            if (usr.id == req.params.id) {
                user = usr
            }
        })
        if (user)
            res.send(user)
        else
            res.send('No hay ningun usuario con ese id')
    }
    else
        res.send('No hay usuarios creados')

})
/*Get usuario
 *Poder buscar por nombre 
 */
app.get('/usuario/nombre/:nombre', function (req, res) {
    if (areThereMany()) {
        let users = []
        usuarios.forEach(usr => {
            if (usr.nombre == req.params.nombre) {
                users.push(usr)
            }
        })
        if (users.length != 0)
            res.send(users)
        else
            res.send('No hay ningun usuario con ese nombre')
    }
    else
        res.send('No hay usuarios creados')
})
/*Get usuario
 *Poder buscar por apellido
 */
app.get('/usuario/apellido/:apellido', function (req, res) {
    if (areThereMany()) {
        let users = []
        usuarios.forEach(usr => {
            if (usr.apellido == req.params.apellido) {
                users.push(usr)
            }
        })
        if (users.length != 0)
            res.send(users)
        else
            res.send('No hay ningun usuario con ese apellido')
    }
    else
        res.send('No hay usuarios creados')
})

/*
 * Delete usuario
 * borrar buscando por ID o por nombre y apellido
 * al borrar un usuario hacer reset de ID por ejemplo
 */

app.delete('/usuario', function (req, res) {
    let flag = false
    if (!areThereMany())
        res.send('No hay usuarios creados')
    else {
        if (req.body.nombre !== undefined && req.body.apellido !== undefined) {
            for (let i = 0; i <= usuarios.length; i++) {
                if (req.body.nombre == usuarios[i].nombre && req.body.apellido == usuarios[i].apellido) {
                    usuarios.splice(i, 1)
                    flag = true
                } else {
                    flag = false
                }
            }
        } else if (req.body.id != undefined) {
            for (let i = 0; i <= usuarios.length; i++) {
                if (req.body.id == usuarios[i].id) {
                    usuarios.splice(i, 1)
                    flag = true

                } else {
                    flag = false
                }
            }

        } else {
            flag = false
        }
        if (flag) {
            if (usuarios.length != 0)
                for (let index = 0; index < usuarios.length; index++) {
                    usuarios[index].id = index
                }
            res.send('Usuario eliminado')
        }
        else
            res.send('El usuario no se ha encontrado')

    }

})
/*
 * Put usuario
 * Actualizar nombre y apellido 
 * Axgregar un tercer campo al request llamado "method" donde se podrá elegir actualizar por ID por nombre o por apellido
 */
app.put('/usuario', function (req, res) {
    if (areThereMany())
        res.send('No hay usuarios creados')
    else {
        if (req.body.id != undefined) {
            let aux = false
            let i = 0
            while (aux == false) {
                if (req.body.id == usuarios[i].id) {
                    console.log(req.body.id)
                    console.log(usuarios[i].id)
                    aux = true
                    if (req.body.nombre !== undefined && req.body.apellido !== undefined) {
                        usuarios[i].nombre = req.body.nombre
                        usuarios[i].apellido = req.body.apellido
                        res.send('El usario ha sido actualizado')
                    }
                    else if (req.body.nombre !== undefined) {
                        usuarios[i].nombre = req.body.nombre
                        res.send('El usario ha sido actualizado')
                    } else if (req.body.apellido !== undefined) {
                        usuarios[i].apellido = req.body.apellido
                        res.send('El usario ha sido actualizado')
                    }
                }
                i++
                if (usuarios.length < i)
                    aux = false
                else {
                    aux = true
                    res.send('El id proporcionado es incorrecto')
                }

            }
        }
        else {
            res.send('Se necesita el id del usuario para poder modificarlo')
        }

    }

})

app.listen(3000, () => {
    console.log('Servidor Corriendo at localhost:3000/')
})


