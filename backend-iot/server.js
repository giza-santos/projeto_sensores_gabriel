const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

let dispositivo = {
  id: "DEV-0001",
  status: "online",
  rele: false,
  sensores: {
    temperatura: 25,
    pressao: 1.2,
    umidade: 60,
    presenca: true
  }
}

// ======================
// GET DISPOSITIVO
// ======================
app.get("/dispositivo", (req, res) => {
  res.json(dispositivo)
})

// ======================
// CONECTAR
// ======================
app.post("/conectar", (req, res) => {
  dispositivo.status = "online"

  res.json({
    msg: "Dispositivo conectado",
    status: dispositivo.status
  })
})

// ======================
// DESCONECTAR
// ======================
app.post("/desconectar", (req, res) => {
  dispositivo.status = "offline"

  res.json({
    msg: "Dispositivo desconectado",
    status: dispositivo.status
  })
})

// ======================
// CONTROLAR RELÉ
// ======================
app.post("/rele", (req, res) => {
  const { comando } = req.body

  if (comando === "liberar") {
    dispositivo.rele = true

    return res.json({
      msg: "Relé liberado",
      rele: true
    })
  }

  if (comando === "travar") {
    dispositivo.rele = false

    return res.json({
      msg: "Relé travado",
      rele: false
    })
  }

  res.status(400).json({
    msg: "Comando inválido"
  })
})

// ======================
// ATUALIZAR SENSORES
// ======================
app.put("/sensores", (req, res) => {
  const {
    temperatura,
    pressao,
    umidade,
    presenca
  } = req.body

  dispositivo.sensores = {
    temperatura,
    pressao,
    umidade,
    presenca
  }

  res.json({
    msg: "Sensores atualizados",
    sensores: dispositivo.sensores
  })
})

// ======================
// RESETAR SENSORES
// ======================
app.delete("/sensores", (req, res) => {
  dispositivo.sensores = {
    temperatura: 0,
    pressao: 0,
    umidade: 0,
    presenca: false
  }

  res.json({
    msg: "Sensores resetados"
  })
})

app.listen(8080, () => {
  console.log("Servidor rodando na porta 8080")
})