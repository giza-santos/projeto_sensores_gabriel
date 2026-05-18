const express = require('express')
const cors = require('cors')
const api = express()

//Middlewares
api.use(express.json())
api.use(cors())

const dados = []
const iot_data = []
const devices = []
let id = 0;



//Rotas
api.get('/usuarios', (req, res)=>{
    let users = dados;

    res.status(200).send(users)
})

//Rota de IOT
api.get('/iot', (req, res) => {

    if(iot_data.length === 0){
        return res.status(200).send({
            id: "ESP32-01",
            status: "offline",
            rele: false,
            sensores: {
                temperatura: 0,
                pressao: 0,
                umidade: 0,
                presenca: false
            }
        })
    }

    const ultimo = iot_data[iot_data.length - 1]

    const resposta = {
        id: ultimo.id,
        status: "online",
        rele: ultimo.trava_seguranca,
        sensores: {
            temperatura: ultimo.temperatura,
            pressao: ultimo.pressao,
            umidade: ultimo.umidade,
            presenca: ultimo.sensor_presenca
        }
    }

    res.status(200).send(resposta)
})
//Rota por sensor
api.get('/sensor/:id', (req, res)=>{
    let sensor_data = iot_data[req.params.id]

    res.status(201).send(sensor_data)
})

api.get('/devices',(req, res)=>{

    res.status(200).send(devices)
})


api.post('/newData', (req, res)=>{
        const { 
            temperatura,
            pressao,
            umidade,
            sensor_presenca,
            trava_seguranca, } = req.body

            id = id+1;

        if(req.body === null){
            return res.status(400).send("Dados não encontrados")
        }
        else{
            const newData = {
            id: id,
            temperatura,
            pressao,
            umidade,
            sensor_presenca,
            trava_seguranca,
        }
        iot_data.push(newData)
        return res.status(201).send({ message: 'Dados recebidos com sucesso!' })
        }
    })

api.put('/sensor/:id', (req,res)=>{
    const id = req.params.id
    const newBody = req.body
    
    const index = iot_data.findIndex(p => p.id=== parseInt(id))
    
    if(index != -1){
        iot_data[index] = {id: parseInt(id), ...newBody}
        return res.status(200).send({
            "msg":"Dados do sensor atualizados!"
        })
    }
    else{
        return res.status(500).send({
            "msg":"Erro ao atualizar o sensor!"
        })
    }
})

api.post('/rele', (req, res) => {
    res.status(200).send({
        msg: "Relé alterado"
    })
})

api.post('/conectar', (req, res) => {
    res.status(200).send({
        status: "online"
    })
})

api.post('/desconectar', (req, res) => {
    res.status(200).send({
        status: "offline"
    })
})

api.put('/sensores', (req, res) => {

    const {
        temperatura,
        pressao,
        umidade,
        presenca
    } = req.body

    if(iot_data.length === 0){
        return res.status(404).send({
            msg: "Nenhum sensor encontrado"
        })
    }

    const ultimo = iot_data[iot_data.length - 1]

    ultimo.temperatura = temperatura
    ultimo.pressao = pressao
    ultimo.umidade = umidade
    ultimo.sensor_presenca = presenca

    res.status(200).send({
        msg: "Sensores atualizados"
    })
})


const porta = 8080;
api.listen(porta, ()=>{
    console.log(`API rodando na porta ${porta}`)
})