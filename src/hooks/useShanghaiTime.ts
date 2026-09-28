import { useEffect, useState } from 'react'

const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Shanghai',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

const read = () => {
  const [hh, mm, ss] = format.format(new Date()).split(':')
  return { hh, mm, ss }
}

/** Live local time in Shanghai, ticking once per second. */
export function useShanghaiTime() {
  const [time, setTime] = useState(read)
  useEffect(() => {
    const id = window.setInterval(() => setTime(read()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return time
}
