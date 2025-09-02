import Cookies from 'js-cookie'

export function setCookie(key: string, value: string, expires: number) {
  return Cookies.set(key, value, { expires: expires })
}

export function getCookie(key: string) {
  return Cookies.get(key)
}

export function removeCookie(key: string) {
  Cookies.remove(key)
}
