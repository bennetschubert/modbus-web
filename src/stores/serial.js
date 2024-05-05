import { defineStore } from 'pinia'
import { computed } from 'vue'

import { useSerialPortSelection } from '@/composable/serial-selection.js'
import { useSerialPortConfiguration } from '@/composable/serial-configuration.js'
import { useModbus } from '@/composable/modbus.js'

export const useSerialStore = defineStore('serial-store', () => {
  const portSelection = useSerialPortSelection()
  const portConfiguration = useSerialPortConfiguration()
  const modbus = useModbus()

  const canOpen = computed(() => {
    return (
      !!portSelection.getSelectedPort() && !modbus.isConnected.value && !modbus.isConnecting.value
    )
  })

  const canClose = computed(() => {
    return !!modbus.isConnected.value && !modbus.isConnecting.value
  })

  async function open() {
    modbus.connect(portSelection.getSelectedPort(), portConfiguration.getObject())
  }

  async function close() {
    modbus.disconnect()
  }

  portSelection.update()

  return {
    portSelection,
    portConfiguration,
    modbus,
    canOpen,
    open,
    canClose,
    close
  }
})
