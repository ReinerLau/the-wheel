import { ref } from 'vue'
import { getCookie, removeCookie, setCookie } from '../utils/cookie'

export const useRememberPassword = () => {
  const ifRememberPassword = ref(false)
  ifRememberPassword.value = Boolean(getCookie('remember_password'))

  function getRememberPassword() {
    if (ifRememberPassword.value) {
      return getCookie('password') || ''
    } else {
      return ''
    }
  }

  function handleRememberPassword() {
    if (ifRememberPassword.value) {
      setCookie('remember_password', 'true', 15)
    } else {
      removeCookie('remember_password')
    }
  }

  return {
    ifRememberPassword,
    handleRememberPassword,
    getRememberPassword,
  }
}
