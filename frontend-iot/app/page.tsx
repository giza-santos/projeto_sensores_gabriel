"use client"

import { useEffect, useState } from "react"

type Device = {
  id: string
  status: string
  rele: boolean
  sensores: {
    temperatura: number
    pressao: number
    umidade: number
    presenca: boolean
  }
}

export default function Page() {
  const [device, setDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  // Estado temporário para os inputs de edição
  const [tempSensores, setTempSensores] = useState({
    temperatura: 0,
    pressao: 0,
    umidade: 0,
    presenca: false
  })

  const API = "http://localhost:8080"

  const buscarDados = async () => {
    try {
      const res = await fetch(`${API}/dispositivo`)
      const data = await res.json()
      setDevice(data)
      if (!editMode) setTempSensores(data.sensores)
    } catch (err) {
      console.error("Erro ao buscar dados")
    }
  }

  const salvarSensores = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/sensores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempSensores)
      })
      if (res.ok) {
        setEditMode(false)
        buscarDados()
      }
    } catch (err) {
      alert("Erro ao atualizar sensores")
    } finally {
      setLoading(false)
    }
  }

  const alternarRele = async () => {
    if (!device) return
    const comando = device.rele ? "travar" : "liberar"
    await fetch(`${API}/rele`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comando })
    })
    buscarDados()
  }

  const alternarConexao = async () => {
    const rota = device?.status === "online" ? "desconectar" : "conectar"
    await fetch(`${API}/${rota}`, { method: "POST" })
    buscarDados()
  }

  useEffect(() => {
    buscarDados()
    const interval = setInterval(() => {
      if (!editMode) buscarDados()
    }, 3000)
    return () => clearInterval(interval)
  }, [editMode])

  if (!device) return <div style={containerStyle}><p style={{color: "white"}}>Carregando...</p></div>

  return (
    <main style={containerStyle}>
      <div style={cardStyle}>
        
        {/* Cabeçalho */}
        <div style={headerStyle}>
          <div>
            <h1 style={{ fontSize: "18px", margin: 0 }}>Central IoT</h1>
            <span style={{ fontSize: "12px", opacity: 0.6 }}>ID: {device.id}</span>
          </div>
          <button onClick={alternarConexao} style={statusButtonStyle(device.status === "online")}>
            {device.status === "online" ? "ON-LINE" : "OFF-LINE"}
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          
          {/* Controle do Relé */}
          <section style={{ marginBottom: "24px" }}>
            <h3 style={sectionTitle}>Atuador (Relé)</h3>
            <button onClick={alternarRele} style={releButtonStyle(device.rele)}>
              {device.rele ? "DESATIVAR DISPOSITIVO" : "ATIVAR DISPOSITIVO"}
            </button>
          </section>

          {/* Telemetria e Edição */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={sectionTitle}>Monitoramento</h3>
              {!editMode ? (
                <button onClick={() => setEditMode(true)} style={editBtnStyle}>✏️ EDITAR</button>
              ) : (
                <div style={{ display: "flex", gap: "5px" }}>
                  <button onClick={salvarSensores} style={saveBtnStyle}>{loading ? "..." : "SALVAR"}</button>
                  <button onClick={() => setEditMode(false)} style={cancelBtnStyle}>CANCELAR</button>
                </div>
              )}
            </div>

            <div style={gridStyle}>
              {/* Temperatura */}
              <div style={sensorCardStyle}>
                <span style={miniLabel}>TEMPERATURA</span>
                {editMode ? (
                  <input 
                    type="number" 
                    value={tempSensores.temperatura} 
                    onChange={(e) => setTempSensores({...tempSensores, temperatura: Number(e.target.value)})}
                    style={inputStyle}
                  />
                ) : (
                  <span style={valueStyle}>{device.sensores.temperatura}°C</span>
                )}
              </div>

              {/* Umidade */}
              <div style={sensorCardStyle}>
                <span style={miniLabel}>UMIDADE</span>
                {editMode ? (
                  <input 
                    type="number" 
                    value={tempSensores.umidade} 
                    onChange={(e) => setTempSensores({...tempSensores, umidade: Number(e.target.value)})}
                    style={inputStyle}
                  />
                ) : (
                  <span style={valueStyle}>{device.sensores.umidade}%</span>
                )}
              </div>

              {/* Pressão */}
              <div style={sensorCardStyle}>
                <span style={miniLabel}>PRESSÃO</span>
                {editMode ? (
                  <input 
                    type="number" 
                    step="0.1"
                    value={tempSensores.pressao} 
                    onChange={(e) => setTempSensores({...tempSensores, pressao: Number(e.target.value)})}
                    style={inputStyle}
                  />
                ) : (
                  <span style={valueStyle}>{device.sensores.pressao} hPa</span>
                )}
              </div>

              {/* Presença */}
              <div style={sensorCardStyle}>
                <span style={miniLabel}>PRESENÇA</span>
                {editMode ? (
                  <select 
                    value={tempSensores.presenca ? "true" : "false"}
                    onChange={(e) => setTempSensores({...tempSensores, presenca: e.target.value === "true"})}
                    style={inputStyle}
                  >
                    <option value="true">SIM</option>
                    <option value="false">NÃO</option>
                  </select>
                ) : (
                  <span style={valueStyle}>{device.sensores.presenca ? "DETECTADA" : "AUSENTE"}</span>
                )}
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}

// --- ESTILOS (MANTIDOS) ---

const containerStyle: React.CSSProperties = {
  minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
  backgroundColor: "#0f172a", fontFamily: "sans-serif"
}

const cardStyle: React.CSSProperties = {
  width: "380px", backgroundColor: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
}

const headerStyle: React.CSSProperties = {
  padding: "20px", backgroundColor: "#1e293b", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center"
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "bold", color: "#1e293b"
}

const sensorCardStyle: React.CSSProperties = {
  padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column"
}

const valueStyle: React.CSSProperties = { fontSize: "16px", fontWeight: "bold", color: "#334155" }
const miniLabel: React.CSSProperties = { fontSize: "9px", fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }
const sectionTitle: React.CSSProperties = { fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }
const gridStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }

const editBtnStyle: React.CSSProperties = { background: "#f1f5f9", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }
const saveBtnStyle: React.CSSProperties = { background: "#22c55e", color: "white", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", cursor: "pointer", fontWeight: "bold" }
const cancelBtnStyle: React.CSSProperties = { background: "#ef4444", color: "white", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", cursor: "pointer" }

const statusButtonStyle = (online: boolean): React.CSSProperties => ({
  background: online ? "#22c55e" : "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: "bold", cursor: "pointer"
})

const releButtonStyle = (active: boolean): React.CSSProperties => ({
  width: "100%", padding: "12px", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer",
  background: active ? "#fee2e2" : "#dcfce7", color: active ? "#ef4444" : "#16a34a"
})