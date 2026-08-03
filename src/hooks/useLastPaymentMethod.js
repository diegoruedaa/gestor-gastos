import { useState } from 'react'

const STORAGE_KEY = 'gastos-app-last-payment-method'
const DEFAULT_METHOD = 'card'

export function useLastPaymentMethod() {
  const [paymentMethod, setPaymentMethodState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_METHOD,
  )

  function setPaymentMethod(value) {
    setPaymentMethodState(value)
    localStorage.setItem(STORAGE_KEY, value)
  }

  return [paymentMethod, setPaymentMethod]
}
