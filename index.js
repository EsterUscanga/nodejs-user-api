const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


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

function move() {
    if (usuarios.length != 0)
        for (let index = 0; index < usuarios.length; index++) {
            usuarios[index].id = index
        }
}

function deleteUser(index) {
    usuarios.splice(index, 1)
}

function getIndexById(id) {
    let i
    for (let index = 0; index < usuarios.length; index++) {
        if (id == usuarios[index].id)
            i = index
    }
    return i
}

function getIdByName(name, lastname) {
    let id
    for (let index = 0; index < usuarios.length; index++) {
        if (name == usuarios[index].nombre && lastname == usuarios[index].apellido)
            id = index
    }
    return id
}

function wichMethod(body) {
    if (body.id != undefined)
        return 'id'
    else if (body.nombre != undefined && body.apellido != undefined)
        return 'nombre'
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

    usuarios.forEach(usuario => {
        if (usuario.nombre == req.body.nombre && usuario.apellido == req.body.apellido) {
            conditions["just_once"] = false
        }
    })

    if (validateCharacters(req.body.nombre, ranges[0], ranges[1]) || validateCharacters(req.body.apellido, ranges[0], ranges[1]))
        conditions["just_letters"] = false

    if (conditions["just_letters"] && conditions["just_once"]) {
        usuario = {
            id: usuarios.length,
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

/* Get usuario
 * Poder buscar por apellido
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
        let method = wichMethod(req.body)
        switch (method) {
            case 'id':
                if (req.body.id != undefined) {
                    deleteUser(getIndexById(req.body.id))
                    move()
                    flag = true
                } else {
                    flag = false
                }
                break

            case 'nombre':
                if (getIdByName(req.body.nombre, req.body.apellido) != undefined) {
                    deleteUser(getIndexById(getIdByName(req.body.nombre, req.body.apellido)))
                    move()
                    flag = true
                }
                else {
                    flag = false
                }
                break

        }
    }
    if (flag)
        res.send('Usuario ha sido eliminado')
    else
        res.send('No se ha encontrado ese usuario')

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


