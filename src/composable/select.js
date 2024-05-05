import { ref } from 'vue'

export function useSelect({ options, defaultValue = null }) {
  const _options = ref([...options])
  const _value = ref(defaultValue)
  return {
    options: _options,
    value: _value
  }
}
