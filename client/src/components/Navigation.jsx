import React from 'react'
import '../App.css'
import '../css/Navigation.css'

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li><h1>Bolt Bucket 🏎️</h1></li>
            </ul>

            <ul>
                <li><a href='/' role='button' className="btn btn-primary btn-sm">Customize</a></li>
                <li><a href='/customcars' role='button' className="btn btn-primary btn-sm">View Cars</a></li>
            </ul>
            
        </nav>
    )
}

export default Navigation