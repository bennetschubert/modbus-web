<script setup>
import { watch, ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

import { storeToRefs } from 'pinia'
import { useSerialStore } from '../stores/serial.js'

const serialStore = useSerialStore()
const { modbus } = serialStore
const { update, io } = modbus
const { cycle } = storeToRefs(modbus)
const { coils } = storeToRefs(io)

const api = ref(null)

const gridOptions = {
  columnDefs: [
    {
      field: 'address',
      headerName: 'Adresse'
    },
    {
      field: 'value',
      headerName: 'Wert',
      cellDataType: 'boolean'
    },
    {
      field: 'forceValue',
      headerName: 'Schreiben',
      cellDataType: 'boolean',
      editable: true
    },
    {
      field: 'errorMessage',
      headerName: 'Meldung',
      flex: 1
    },
    {
      field: 'lastUpdate',
      headerName: 'Letzte Aktualisierung',
      flex: 1,
      valueGetter({ data }) {
        if (!data.lastUpdate) return ''
        return new Intl.DateTimeFormat('de-DE', {
          dateStyle: 'full',
          timeStyle: 'long',
          timeZone: 'Europe/Berlin'
        }).format(data.lastUpdate)
      }
    }
  ],
  rowSelection: 'multiple',
  suppressCellFocus: true,
  onGridReady: (event) => (api.value = event.api),
  suppressDragLeaveHidesColumns: true
}

watch(
  () => cycle.value,
  () => api.value.refreshCells()
)
</script>

<template>
  <div class="h-100 d-flex flex-column position-relative">
    <ix-content-header
      variant="secondary"
      header-title="Coils"
      header-subtitle="Lese-/Schreibzugriff"
      class="my-2 px-2"
    >
      <ix-icon-button icon="refresh" ghost="true" variant="primary" @click="update"
        >Aktualisieren</ix-icon-button
      >
    </ix-content-header>
    <div class="flex-grow-1 position-relative h-100 w-100">
      <AgGridVue
        :gridOptions="gridOptions"
        :rowData="coils"
        class="ag-theme-alpine-dark ag-theme-ix h-100"
      ></AgGridVue>
    </div>
  </div>
</template>
