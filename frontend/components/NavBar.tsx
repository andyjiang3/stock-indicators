import { AppBar, Box, Container, Toolbar, Typography, Button} from '@mui/material'


export default function NavBar() {
    return (
    <div className="bg-white flex p-5 justify-start align-center shadow-sm mb-5">
        <h4 className="text-xl text-blue-500"><a href="/" className="font-bold">Stock Prediction</a></h4>
        <div className="flex ms-auto">
            <a href="/stocks" className="text-base ms-10">Stocks</a>
            <a href="/strategies" className="text-base ms-10">Strategies</a>
        </div>
        
    </div>
    );
}