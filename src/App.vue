<script setup>
import { storeToRefs } from 'pinia'
import { useSerialStore } from './stores/serial'

const serialStore = useSerialStore()

const { canOpen, canClose } = storeToRefs(serialStore)
const { open, close, portConfiguration, portSelection, modbus } = serialStore
</script>

<template>
  <div class="d-flex gap-1">
    <div>
      <label>Port</label>
      <select :disabled="portSelection.available.length === 0" v-model="portSelection.selected">
        <option v-for="port of portSelection.available" :key="port.id" :value="port">
          {{ port.id }}
        </option>
      </select>
    </div>
    <button @click="portSelection.request">Request Ports</button>
  </div>
  <div>
    <select v-model="portConfiguration.baudRateSelect.value">
      <option v-for="r of portConfiguration.baudRateSelect.options" :key="r" :value="r">
        {{ r }}
      </option>
    </select>
    <select v-model="portConfiguration.dataBitsSelect.value">
      <option v-for="r of portConfiguration.dataBitsSelect.options" :key="r" :value="r">
        {{ r }}
      </option>
    </select>
    <select v-model="portConfiguration.stopBitsSelect.value">
      <option v-for="r of portConfiguration.stopBitsSelect.options" :key="r" :value="r">
        {{ r }}
      </option>
    </select>
    <select v-model="portConfiguration.paritiySelect.value">
      <option v-for="r of portConfiguration.paritiySelect.options" :key="r" :value="r">
        {{ r }}
      </option>
    </select>
    <button :disabled="!canOpen" @click="open">Connect</button>
    <button :disabled="!canClose" @click="close">Disconnect</button>
  </div>
  <div v-if="modbus.isConnected">
    <button :disabled="modbus.isBusy" @click="modbus.blinkLed">Blink LEDs</button>
  </div>
</template>

<style>
.d-flex {
  display: flex;
}

.gap-1 {
  gap: 1rem;
}
</style>
