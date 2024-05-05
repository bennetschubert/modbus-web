import { ref, computed } from 'vue'

import Serialport from '../lib/serialport.js'
import * as Modbus from 'jsmodbus'

function useDiscreteInputs({ modbus }) {
  const data = ref([])

  async function update() {
    for (let register of data.value) {
      try {
        register.updating = true
        const result = await modbus.value.readDiscreteInputs(register.address, 1)
        register.error = null
        register.errorMessage = null
        register.value = !!result.response.body.valuesAsArray[0]
      } catch (err) {
        register.error = err
        if (err?.response?.body?.message) {
          register.errorMessage = err?.response?.body?.message
        } else {
          register.errorMessage = err.message
        }
      } finally {
        register.lastUpdate = new Date()
        register.updating = false
      }
    }
  }

  for (let i = 0; i < 16; i++) {
    data.value.push({
      address: i,
      value: null,
      lastUpdate: null,
      updating: false,
      error: null,
      errorMessage: null
    })
  }

  return {
    data,
    update
  }
}

function useCoils({ modbus }) {
  const data = ref([])

  async function update() {
    for (let register of data.value) {
      try {
        register.updating = true
        const result = await modbus.value.readCoils(register.address, 1)
        register.error = null
        register.errorMessage = null
        register.value = !!result.response.body.valuesAsArray[0]
      } catch (err) {
        register.error = err
        if (err?.response?.body?.message) {
          register.errorMessage = err?.response?.body?.message
        } else {
          register.errorMessage = err.message
        }
      } finally {
        register.lastUpdate = new Date()
        register.updating = false
      }
    }
  }

  for (let i = 0; i < 16; i++) {
    data.value.push({
      address: i,
      value: null,
      lastUpdate: null,
      updating: false,
      error: null,
      errorMessage: null
    })
  }

  return {
    data,
    update
  }
}

export function useInterval({ callback, intervalMS = 1000 }) {
  const _intervalId = ref(null)
  const _intervalMS = ref(intervalMS)

  function enable() {
    _intervalId.value = setInterval(callback, _intervalMS.value)
  }

  function disable() {
    clearInterval(_intervalId.value)
    _intervalId.value = null
  }

  function changeInterval(miliseconds) {
    if (isEnabled.value) {
      disable()
      _intervalMS.value = miliseconds
      enable()
    } else {
      _intervalMS.value = miliseconds
    }
  }

  const isEnabled = computed(() => {
    return !!_intervalId.value
  })

  return {
    enable,
    disable,
    isEnabled,
    changeInterval,
    intervalMS: _intervalMS
  }
}

export function useModbus() {
  const MESSAGE_TIMEOUT_MS = 50

  const serialport = ref(null)
  const modbus = ref(null)
  const isConnecting = ref(false)
  const isConnected = ref(false)
  const isBusy = ref(false)

  const slaveId = ref(1)
  const cycle = ref(0)

  const autoUpdate = useInterval({ callback: () => update() })
  const discreteInputs = useDiscreteInputs({ modbus })
  const coils = useCoils({ modbus })

  function setSlaveId(id) {
    slaveId.value = Number.parseInt(id)
    modbus.value = new Modbus.client.RTU(serialport.value, slaveId.value, MESSAGE_TIMEOUT_MS)
  }

  async function connect(webPort, configuration) {
    serialport.value = new Serialport(webPort)
    serialport.value.on('open', async () => {
      isConnected.value = true
      isConnecting.value = false
      setSlaveId(slaveId.value)
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

  async function update() {
    await discreteInputs.update()
    await coils.update()
    cycle.value += 1
  }

  return {
    serialport,
    modbus,
    slaveId,
    setSlaveId,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    blinkLed,
    isBusy,
    discreteInputs,
    coils,
    update,
    cycle,
    autoUpdate
  }
}
