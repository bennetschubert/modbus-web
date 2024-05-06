<script setup>
import DiscreteInputsView from './components/DiscreteInputsView.vue'
import CoilsView from './components/CoilsView.vue'
import InputRegistersView from './components/InputRegistersView.vue'
import OutputRegistersView from './components/OutputRegistersView.vue'

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSerialStore } from './stores/serial'

const serialStore = useSerialStore()
const selectedTab = ref(0)

const { canOpen, canClose } = storeToRefs(serialStore)
const { open, close, portConfiguration, portSelection, modbus } = serialStore
const { autoUpdate } = modbus
</script>

<template>
  <div class="d-flex flex-column w-100 h-100">
    <ix-application-header name="Modbus Web">
      <ix-select
        :disabled="portSelection.available.length === 0"
        :value="portSelection.selectedId"
        @valueChange="(evt) => portSelection.selectById(evt.detail)"
        :hide-list-header="true"
        title="Serieller Port"
        i-1-8n-no-matches="Keine Ports verfügbar. Prüfen Sie die Berechtigungen."
      >
        <ix-select-item
          v-for="port of portSelection.available"
          :key="port.id"
          :value="port.id"
          :label="port.id"
        >
        </ix-select-item>
      </ix-select>
      <ix-icon-button
        title="Port anfordern"
        @click="portSelection.request"
        icon="refresh"
        class="ms-1"
      ></ix-icon-button>

      <ix-select
        :value="String(portConfiguration.baudRateSelect.value)"
        @valueChange="
          (evt) => (portConfiguration.baudRateSelect.value = Number.parseInt(evt.detail))
        "
        style="width: 6rem"
        class="ms-3"
        :hide-list-header="true"
        title="Baudrate"
      >
        <ix-select-item
          v-for="r of portConfiguration.baudRateSelect.options"
          :key="r"
          :value="r"
          :label="r"
        ></ix-select-item>
      </ix-select>

      <ix-select
        :value="String(portConfiguration.dataBitsSelect.value)"
        @valueChange="
          (evt) => (portConfiguration.dataBitsSelect.value = Number.parseInt(evt.detail))
        "
        style="width: 4rem"
        class="ms-1"
        :hide-list-header="true"
        title="Datenbits"
      >
        <ix-select-item
          v-for="r of portConfiguration.dataBitsSelect.options"
          :key="r"
          :value="r"
          :label="r"
        ></ix-select-item>
      </ix-select>

      <ix-select
        :value="String(portConfiguration.stopBitsSelect.value)"
        @valueChange="
          (evt) => (portConfiguration.stopBitsSelect.value = Number.parseInt(evt.detail))
        "
        style="width: 4rem"
        class="ms-1"
        :hide-list-header="true"
        title="Stopbits"
      >
        <ix-select-item
          v-for="r of portConfiguration.stopBitsSelect.options"
          :key="r"
          :value="r"
          :label="r"
        ></ix-select-item>
      </ix-select>

      <ix-select
        :value="portConfiguration.paritySelect.value"
        @valueChange="(evt) => (portConfiguration.paritySelect.value = evt.detail)"
        style="width: 6rem"
        class="ms-1"
        :hide-list-header="true"
        title="Parity"
      >
        <ix-select-item
          v-for="r of portConfiguration.paritySelect.options"
          :key="r"
          :value="r"
          :label="r"
        ></ix-select-item>
      </ix-select>
      <div class="btn-group ms-3">
        <ix-button
          v-if="!modbus.isConnected"
          :disabled="!canOpen"
          @click="open"
          :loading="modbus.isConnecting"
          >Verbinden</ix-button
        >
        <ix-button v-if="modbus.isConnected" :disabled="!canClose" @click="close"
          >Trennen</ix-button
        >
      </div>
    </ix-application-header>
    <div class="h-100 content flex-grow-1" style="width: 100%" v-if="modbus.isConnected">
      <ix-tabs
        layout="stretched"
        :selected="selectedTab"
        @selectedChange="(evt) => (selectedTab = evt.detail)"
      >
        <ix-tab-item data-tab-id="0">Modbus Konfiguration</ix-tab-item>
        <ix-tab-item data-tab-id="1">Eingangs-Bits</ix-tab-item>
        <ix-tab-item data-tab-id="2">Ausgangs-Bits</ix-tab-item>
        <ix-tab-item data-tab-id="3">Eingangs-Register</ix-tab-item>
        <ix-tab-item data-tab-id="4">Ausgangs-Register</ix-tab-item>
      </ix-tabs>
      <div data-tab-content="0" v-if="selectedTab === 0" class="container py-3">
        <ix-input-group style="margin-bottom: 0.5rem; width: 16rem">
          <span slot="input-start">SlaveID:</span>
          <input
            type="number"
            min="1"
            max="254"
            :value="modbus.slaveId"
            step="1"
            @change="(evt) => modbus.setSlaveId(evt.target.value)"
          />
        </ix-input-group>
        <div class="d-flex">
          <ix-input-group style="margin-bottom: 0.5rem; width: 16rem">
            <span slot="input-start">Update Interval:</span>
            <input
              type="number"
              step="100"
              :value="autoUpdate.intervalMS"
              @change="(evt) => autoUpdate.changeInterval(Number.parseInt(evt.target.value))"
            />
            <span slot="input-end">mS</span>
          </ix-input-group>
          <div class="btn-group">
            <ix-button
              v-if="!autoUpdate.isEnabled"
              :disabled="autoUpdate.isEnabled"
              @click="autoUpdate.enable"
              >Aktivieren</ix-button
            >
            <ix-button
              v-if="autoUpdate.isEnabled"
              :disabled="!autoUpdate.isEnabled"
              @click="autoUpdate.disable"
              >Deaktivieren</ix-button
            >
          </div>
        </div>
        <!--
        <div v-if="modbus.isConnected">
          <ix-button :disabled="modbus.isBusy" @click="modbus.blinkLed">LED Test</ix-button>
        </div>
                -->
      </div>
      <div
        data-tab-content="1"
        v-if="selectedTab === 1"
        class="flex-grow-1 h-100 position-relative"
      >
        <DiscreteInputsView />
      </div>
      <div
        data-tab-content="2"
        v-if="selectedTab === 2"
        class="flex-grow-1 h-100 position-relative"
      >
        <CoilsView />
      </div>
      <div
        data-tab-content="3"
        v-if="selectedTab === 3"
        class="flex-grow-1 h-100 position-relative"
      >
        <InputRegistersView />
      </div>
      <div
        data-tab-content="4"
        v-if="selectedTab === 4"
        class="flex-grow-1 h-100 position-relative"
      >
        <OutputRegistersView />
      </div>
    </div>
    <div v-else class="d-flex justify-content-center align-items-center flex-grow-1">
      <ix-message-bar :dismissible="false"
        >Nich verbunden. Stellen Sie eine Verbindung her um die Modbus Funktionen zu
        nutzen.</ix-message-bar
      >
    </div>
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
