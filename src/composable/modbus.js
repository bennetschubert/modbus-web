import { ref, computed } from 'vue'

import Serialport from '../lib/serialport.js'
import * as Modbus from 'jsmodbus'

const ModbusIOType = {
  Coil: 1,
  DiscreteInput: 2,
  InputRegister: 3,
  OutputRegister: 4
}

class ModbusIO {
  constructor(address) {
    this.address = address
    this.lastUpdate = null
    this.updating = false
    this.error = null
    this.errorMessage = null
  }

  async _wrapError(handler) {
    try {
      this.isUpdating = true
      this.error = null
      this.errorMessage = null
      this.value = await handler()
    } catch (err) {
      this.value = null
      this.error = err
      if (err?.response?.body?.message) {
        this.errorMessage = err?.response?.body?.message
      } else {
        this.errorMessage = err.message
      }
    } finally {
      this.lastUpdate = new Date()
      this.isUpdating = false
    }
  }
}

class Coil extends ModbusIO {
  constructor(address) {
    super(address)
    this.type = ModbusIOType.Coil
    this.readable = true
    this.writable = true
    this.value = null
    this.forceValue = null
  }

  async write(modbus) {
    if (this.forceValue === null) return
    const valueToWrite = this.forceValue
    this.forceValue = null
    await modbus.writeMultipleCoils(this.address, [valueToWrite])
  }

  async read(modbus) {
    return await this._wrapError(async () => {
      const result = await modbus.readCoils(this.address, 1)
      return !!result.response.body.valuesAsArray[0]
    })
  }
}

class DiscreteInput extends ModbusIO {
  constructor(address) {
    super(address)
    this.type = ModbusIOType.DiscreteInput
    this.readable = true
    this.writable = false
    this.value = null
    this.forceValue = null
  }

  async write() {
    throw new Error('DiscreteInput is not writable')
  }

  async read(modbus) {
    return await this._wrapError(async () => {
      const result = await modbus.readDiscreteInputs(this.address, 1)
      return !!result.response.body.valuesAsArray[0]
    })
  }
}

class InputRegister extends ModbusIO {
  constructor(address) {
    super(address)
    this.type = ModbusIOType.InputRegister
    this.readable = true
    this.writable = false
    this.value = null
    this.forceValue = null
  }

  async write() {
    throw new Error('InputRegister is not writable')
  }

  async read(modbus) {
    return await this._wrapError(async () => {
      const result = await modbus.readInputRegisters(this.address, 1)
      return result.response.body.values[0]
    })
  }
}

class OutputRegister extends ModbusIO {
  constructor(address) {
    super(address)
    this.type = ModbusIOType.OutputRegister
    this.readable = true
    this.writable = true
    this.value = null
    this.forceValue = null
  }

  async write(modbus) {
    if (this.forceValue === null) return
    const valueToWrite = this.forceValue
    this.forceValue = null
    await modbus.writeSingleRegister(this.address, valueToWrite)
  }

  async read(modbus) {
    return await this._wrapError(async () => {
      const result = await modbus.readHoldingRegisters(this.address, 1)
      return result.response.body.values[0]
    })
  }
}
function useModbusIO({ modbus }) {
  const data = ref([])

  function getIOByType(type) {
    return data.value.filter((io) => io.type === type)
  }

  const coils = computed(() => getIOByType(ModbusIOType.Coil))
  const discreteInputs = computed(() => getIOByType(ModbusIOType.DiscreteInput))
  const inputRegisters = computed(() => getIOByType(ModbusIOType.InputRegister))
  const outputRegisters = computed(() => getIOByType(ModbusIOType.OutputRegister))
  const writables = computed(() => data.value.filter((io) => io.writable))

  function addCoil(address) {
    data.value.push(new Coil(address))
  }

  function addDiscreteInput(address) {
    data.value.push(new DiscreteInput(address))
  }

  function addInputRegister(address) {
    data.value.push(new InputRegister(address))
  }

  function addOutputRegister(address) {
    data.value.push(new OutputRegister(address))
  }

  async function update() {
    const mb = modbus.value
    for (let io of writables.value) await io.write(mb)
    for (let io of data.value) await io.read(mb)
  }

  return {
    coils,
    discreteInputs,
    inputRegisters,
    outputRegisters,
    addCoil,
    addDiscreteInput,
    addInputRegister,
    addOutputRegister,
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

  const io = useModbusIO({ modbus })
  const autoUpdate = useInterval({ callback: () => update() })

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

  function init() {
    for (let i = 0; i < 16; i++) {
      io.addCoil(i)
      io.addDiscreteInput(i)
      io.addInputRegister(i)
      io.addOutputRegister(i)
    }
  }

  async function update() {
    await io.update()
    cycle.value += 1
  }

  init()

  return {
    serialport,
    modbus,
    slaveId,
    setSlaveId,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    isBusy,
    update,
    cycle,
    autoUpdate,
    io
  }
}
