import { useSelect } from '@/composable/select.js'

export function useSerialPortConfiguration() {
  const baudRateSelect = useSelect({
    options: [75, 300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
    defaultValue: 57600
  })
  const dataBitsSelect = useSelect({
    options: [7, 8],
    defaultValue: 8
  })
  const stopBitsSelect = useSelect({
    options: [1, 2],
    defaultValue: 1
  })
  const paritiySelect = useSelect({
    options: ['none', 'even', 'odd'],
    defaultValue: 'even'
  })
  const flowControlSelect = useSelect({
    options: ['none', 'hardware'],
    defaultValue: 'none'
  })

  function getObject() {
    return {
      baudRate: baudRateSelect.value.value,
      dataBits: dataBitsSelect.value.value,
      stopBits: stopBitsSelect.value.value,
      parity: paritiySelect.value.value,
      flowControl: flowControlSelect.value.value
    }
  }

  return {
    baudRateSelect,
    dataBitsSelect,
    stopBitsSelect,
    paritiySelect,
    flowControlSelect,
    getObject
  }
}
