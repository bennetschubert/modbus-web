import { ref } from 'vue'
export function useSerialPortSelection() {
  const available = ref([])
  const selected = ref(null)

  async function request() {
    await navigator.serial.requestPort()
    await update()
  }

  async function update() {
    const iPorts = []
    let countUsb = 0
    let countNative = 0
    for (let p of await navigator.serial.getPorts()) {
      const { usbVendorId, usbProductId } = await p.getInfo()
      let id
      if (usbVendorId) {
        id = `USB Serial ${countUsb++} (${usbVendorId}:${usbProductId})`
      } else {
        id = `Serial ${countNative++}`
      }
      iPorts.push({
        id: id,
        ref: p
      })
    }
    available.value = iPorts
    if (iPorts.length > 0) selected.value = iPorts[0]
  }

  function getSelectedPort() {
    return selected.value?.ref
  }

  return {
    available,
    selected,
    update,
    request,
    getSelectedPort
  }
}
