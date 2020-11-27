import React from 'react';
import Board from './Board.js'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Container, Row, Col } from 'react-bootstrap';

function App() {
    return (
        <Container fluid className="wrapper">

            <Board />

        </Container>
    );
}

export default App;
