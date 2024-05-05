import { ref } from 'vue'

import Serialport from '../lib/serialport.js'
import * as Modbus from 'jsmodbus'

export function useModbus() {
  const MESSAGE_TIMEOUT_MS = 50

  const serialport = ref(null)
  const modbus = ref(null)
  const isConnecting = ref(false)
  const isConnected = ref(false)
  const isBusy = ref(false)

  const slaveId = ref(10)

  async function connect(webPort, configuration) {
    serialport.value = new Serialport(webPort)
    modbus.value = new Modbus.client.RTU(serialport.value, slaveId.value, MESSAGE_TIMEOUT_MS)
    serialport.value.on('open', async () => {
      isConnected.value = true
      isConnecting.value = false
    })
    serialport.value.on('close', async () => {
      modbus.value = null
      isConnected.value = false
      isConnecting.value = false
    })
    serialport.value.open(configuration)
    isConnecting.value = true
  }

  async function disconnect() {
    await serialport.value.close()
    isConnected.value = false
    isConnecting.value = false
  }

  async function blinkLed() {
    try {
      isBusy.value = true
      for (let i = 0; i < 99; i++) {
        await modbus.value.writeMultipleCoils(1, [i % 2])
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      isBusy.value = false
    }
  }

  return {
    serialport,
    modbus,
    slaveId,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    blinkLed,
    isBusy
  }
}
