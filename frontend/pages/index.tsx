import Head from 'next/head'
import Image from 'next/image'

import NavBar from '@/components/NavBar'
import {Box} from '@mui/material'
import styles from '../styles/Home.module.css'


export default function Home() {
  return (<div className={styles.container}>
    <NavBar />
    <Box sx={{
      width: '50%',
      height: 300,
      backgroundColor: 'lightgray'
    }}>

    </Box>
  </div> 
  )
}
