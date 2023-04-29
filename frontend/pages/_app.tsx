import '@/styles/globals.css'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import type { AppProps } from 'next/app'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [startDate, setStartDate] = useState("2020-10-20");
  const [endDate, setEndDate] = useState("2022-07-29");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Component {...pageProps} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}/>
    </LocalizationProvider>
  )
}
