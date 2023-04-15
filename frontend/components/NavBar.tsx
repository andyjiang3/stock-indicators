import Head from 'next/head'
import Image from 'next/image'

import { AppBar, Box, Container, Toolbar, Typography, Button} from '@mui/material'
import styles from '../styles/Home.module.css'


export default function NavBar() {
    return (
    <div className='App'>
        <Box sx={{flexGrow: 1, marginBottom: 3}}>
            <AppBar position='static'>
                <Toolbar>
                    <Typography variant='h5'>- CIS 550 Project -</Typography>
                    <Button href="/" color='inherit'>Home</Button>
                    <Button href="/stocks" color='inherit'>Stocks</Button>
                    <Button href="/strategies" color='inherit'>Strategies</Button>
                </Toolbar>
            </AppBar>
        </Box>
    </div>
    );
}