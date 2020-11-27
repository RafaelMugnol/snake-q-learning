import React, { Component } from 'react';
import SnakeDot from './SnakeDot.js';
import Food from './Food.js';
import { genCoords, delay, manhattanDist, createQTable, createVisited, createQTableTreinada } from './helper.js'
import { Form, Row, Col, Button, Card } from 'react-bootstrap';

var Q_table = createQTable();
var visited = createVisited();

const dirs = [[-5, 0], [0, -5], [5, 0], [0, 5]];

const startState = {

    // Environment params:
    dots: [
        genCoords()
    ],
    food: genCoords(),
    direction: 2,
    speed: 100,
    score: 0,
    justAte: false,
    max_score: 0,

    // Q learning hyperparams:
    ep: 0,
    start_epsilon: 0.9,
    end_epsilon: 0,
    epsilon: 0.9,
    episodes: 200,
    discount_factor: 1.0,
    agent_state: 2 // 0 teinando, 1 testando, 2 parado
}

const checkBounds = (head) => {
    return (head[0] < 0) || (head[0] > 95) || (head[1] < 0) || (head[1] > 95);
}


class Board extends Component {

    state = startState

    componentDidMount() {
        //this.qlearning();
        //setInterval(this.moveSnake, this.state.speed);
        //document.onkeydown = this.onKeyDown;
    }

    setDir(val) {
        if (this.state.dots.length === 2 && Math.abs(this.state.direction - (val - 37)) === 2) {
            this.setState({ direction: val - 37 });
            return true;
        }
        else if (val >= 37 && val <= 40) {
            this.setState({ direction: val - 37 });
            return false;
        }
    }

    onKeyDown = (e) => {
        e = e || window.event();

        if (this.setDir(parseInt(e.keyCode))) {
            this.gameOver();
        }
    }

    moveSnake = () => {
        var state = this.state;
        var newx = state.dots[state.dots.length - 1][0];
        var newy = state.dots[state.dots.length - 1][1];
        var foodFound = false;
        var valid = true;

        newx += dirs[state.direction][0];
        newy += dirs[state.direction][1];

        if (newx === state.food[0] && newy === state.food[1]) {
            while (true) {
                valid = true;
                state.food = genCoords();

                state.dots.forEach((dot, i) => {
                    if (dot[0] === state.food[0] && dot[1] === state.food[1]) {
                        valid = false;
                    }
                })
                if (valid) break;
            }
            state.score++;
            //if(state.speed > 20) state.speed -= 10;
            foodFound = true;
        }
        state.justAte = foodFound;
        state.dots.push([newx, newy]);
        if (this.checkBorders() || this.checkCollapsed()) {
            this.gameOver();
            return true;
        }
        else {
            if (!foodFound)
                state.dots.shift();
            this.setState(state);
            return false;
        }
    }

    checkBorders = () => {
        var head = this.state.dots[this.state.dots.length - 1];
        if (checkBounds(head)) {
            return true;
        }
        return false;
    }

    checkCollapsed = () => {
        var lost = false;
        var head = this.state.dots[this.state.dots.length - 1];
        this.state.dots.forEach((dot, i) => {
            if (i !== 0 && i !== this.state.dots.length - 1 && head[0] === dot[0] && head[1] === dot[1]) {
                lost = true;
            }
        })
        return lost;
    }

    gameOver = () => {
        this.setState({
            ...this.state,
            dots: [
                genCoords()
            ],
            food: genCoords(),
            direction: 2,
            score: 0,
            justAte: false,
        });
    }

    action = (eps, dir, v1) => {
        if (Math.random() < eps) {
            return Math.floor(Math.random() * 4);
        }
        else {
            var mx = -100000, ind = 0;
            for (var i = 0; i < 4; i++) {
                if (Q_table[dir][v1][i] > mx) {
                    mx = Q_table[dir][v1][i];
                    ind = i;
                }
            }
            return parseInt(ind);
        }
    }

    reset = async () => {
        Q_table = createQTable();
        visited = createVisited();

        this.setState({
            ...this.state,
            score: 0,
            max_score: 0,
            ep: 0,
        });
    }

    qlearning = async () => {
        var mxs = this.state.max_score;
        var mx = 0, done, reward;
        var next_surr, next_dir, next_v1;
        var surr, dir, v1, dist, action, steps;
        var cur_epsilon = this.state.start_epsilon;
        var dec = (this.state.start_epsilon - this.state.end_epsilon) / this.state.episodes;

        for (var ep = this.state.ep; ep < this.state.episodes; ep++) {
            done = false;
            [surr, dir] = this.getState();
            v1 = surr[0] + (2 * surr[1]) + (4 * surr[2]) + (8 * surr[3]);
            steps = 0;

            while (!done) {
                dist = manhattanDist(this.state.food, this.state.dots[this.state.dots.length - 1]);

                // etapa
                action = this.action(cur_epsilon, dir, v1);
                visited[dir][v1] = true;

                if (this.setDir(action + 37)) done = true;
                else await delay(this.state.speed);

                done = done || (steps >= 500) || this.moveSnake();
                if (!done) {
                    [next_surr, next_dir] = this.getState();
                    next_v1 = next_surr[0] + (2 * next_surr[1]) + (4 * next_surr[2]) + (8 * next_surr[3]);
                }

                // pontuação por movimento
                if (done)
                    reward = -100; //morreu
                else if (this.state.justAte)
                    reward = 30; // comeu a maça
                else if (manhattanDist(this.state.food, this.state.dots[this.state.dots.length - 1]) < dist)
                    reward = 1; // moveu para perto da maça
                else
                    reward = -5; // moveu pora longe da maça

                if (!done) {
                    mx = -100000;
                    for (var i = 0; i < 4; i++) {
                        if (Q_table[next_dir][next_v1][i] >= mx) {
                            mx = Q_table[next_dir][next_v1][i];
                        }
                    }
                }
                else mx = 0;

                Q_table[dir][v1][action] += 0.01 * ((reward + (this.state.discount_factor * mx)) - Q_table[dir][v1][action])

                v1 = next_v1;
                dir = next_dir;
                if (this.state.justAte)
                    steps++;
                else
                    steps = 0

                if (this.state.agent_state !== 0)
                    break;
                if (this.state.score > mxs)
                    mxs = this.state.score;
            }
            this.gameOver();
            if ((cur_epsilon - dec) >= this.state.end_epsilon) cur_epsilon -= dec;
            else cur_epsilon = this.state.end_epsilon;

            //cur_epsilon *= 0.994;

            this.setState({ ...this.state, max_score: mxs, ep: ep + 1, epsilon: cur_epsilon })
            if (this.state.agent_state !== 0)
                break;
        }
    }

    getState = () => {
        var surr = [0, 0, 0, 0];
        var dir = 0;
        var head = this.state.dots[this.state.dots.length - 1]
        var relx = head[0] - this.state.food[0];
        var rely = head[1] - this.state.food[1];

        if (relx < 0 && rely < 0) dir = 6;
        else if (relx === 0 && rely < 0) dir = 5;
        else if (relx > 0 && rely < 0) dir = 4;
        else if (relx > 0 && rely === 0) dir = 3;
        else if (relx > 0 && rely > 0) dir = 2;
        else if (relx === 0 && rely > 0) dir = 1;
        else if (relx < 0 && rely > 0) dir = 0;
        else if (relx < 0 && rely === 0) dir = 7;

        for (var index = 0; index < 4; index++) {
            if (checkBounds([head[0] + dirs[index][0], head[1] + dirs[index][1]])) {
                surr[index] = 1;
            }
            else {
                this.state.dots.forEach((dot, i) => {
                    if (i <= this.state.dots.length - 2) {
                        if ((dot[0] === (head[0] + dirs[index][0])) && (dot[1] === (head[1] + dirs[index][1])))
                            surr[index] = 1;
                    }
                })
            }
        }

        return [surr, dir];
    }

    changeSpeed = (event) => {
        this.setState({ ...this.state, speed: parseInt(event.target.value * -1) });
        event.preventDefault();
    }

    iniciaTreino = (event) => {
        if (this.state.ep < this.state.episodes) {
            this.setState({
                ...this.state,
                agent_state: 0,
            }, () => {
                console.log(this.state);
                this.qlearning();
            })
        }
        event.preventDefault();
    }

    testAgent = async () => {
        var mxs = this.state.max_score;
        var done = 0;
        var next_surr, next_dir, next_v1;
        var surr, dir, v1, action, dist, steps;
        while (this.state.agent_state === 1) {
            done = false;
            [surr, dir] = this.getState();
            v1 = surr[0] + (2 * surr[1]) + (4 * surr[2]) + (8 * surr[3]);
            steps = 0;

            while (!done) {
                dist = manhattanDist(this.state.food, this.state.dots[this.state.dots.length - 1]);

                // etapa
                action = this.action(0, dir, v1);

                if (this.setDir(action + 37)) done = true;
                else await delay(this.state.speed);

                done = done || (steps >= 500) || this.moveSnake();
                if (!done) {
                    [next_surr, next_dir] = this.getState();
                    next_v1 = next_surr[0] + (2 * next_surr[1]) + (4 * next_surr[2]) + (8 * next_surr[3]);
                }

                v1 = next_v1;
                dir = next_dir;
                if (this.state.justAte)
                    steps++;
                else
                    steps = 0

                if (this.state.score > mxs)
                    mxs = this.state.score;

                if (this.state.agent_state !== 1 || steps > 500)
                    break;
            }
            this.gameOver();
            this.setState({ ...this.state, max_score: mxs });
        }
    }

    acaoParar = () => {
        this.setState({ ...this.state, agent_state: 2 });
    }

    rodarTeste = () => {
        if (this.state.agent_state !== 1) {
            this.setState({ ...this.state, agent_state: 1 }, () => {
                console.log("State updated to test.");
                this.testAgent();
            });
        }
    }

    rodarPreTreinado = () => {
        Q_table = createQTableTreinada();
        visited = createVisited(true);

        this.rodarTeste();
    }

    render() {
        return (
            <>
                <Row className="justify-content-center align-content-center">
                    <Col md="auto" lg="auto" sm="auto" xs="auto">
                        <div className='board-area-param'>
                            <Card style={{ 'min-width': '200px', height: '400px' }}>
                                <Card.Body>
                                    <Card.Title><b>Parâmetros</b></Card.Title>
                                    <Card.Text>
                                        <Row className='justify-content-center'>
                                            <Col style={{ 'margin-left': '20px', 'text-align': 'left', 'font-size': '15px' }}>
                                                Temporadas: <br />
                                                Pontos: <br />
                                                Pontuação máxima: <br />
                                            </Col>
                                            <Col style={{ 'font-size': '15px', 'max-width': '110px' }}>
                                                {this.state.ep} / {this.state.episodes} <br />
                                                {this.state.score} <br />
                                                {this.state.max_score} <br />
                                            </Col>
                                        </Row>
                                    </Card.Text>
                                    <Card.Text>
                                        <Form>
                                            <Form.Group style={{ 'text-align': 'center' }}>
                                                <Form.Label>Velocidade: </Form.Label>
                                                <Form.Control type="range" min="-200" max="-10" step="5" onChange={this.changeSpeed} />
                                            </Form.Group>
                                        </Form>
                                    </Card.Text>
                                    <Card.Text>
                                        <Form onSubmit={this.iniciaTreino}>
                                            <Form.Row>
                                                <Form.Group as={Col}>
                                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                                        <Button type="submit" variant="primary">Treinar</Button>
                                                    </div>
                                                </Form.Group>
                                                <Form.Group as={Col}>
                                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                                        <Button type="button" variant="primary" onClick={this.acaoParar}>Parar</Button>
                                                    </div>
                                                </Form.Group>
                                                <Form.Group as={Col}>
                                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                                        <Button variant="primary" onClick={this.rodarTeste}>Testar</Button>
                                                    </div>
                                                </Form.Group>
                                                <Form.Group as={Col}>
                                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                                        <Button variant="primary" onClick={this.reset}>Zerar</Button>
                                                    </div>
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col}>
                                                    <div style={{ display: "flex", justifyContent: "center" }}>
                                                        <Button style={{ width: "100%" }}
                                                            variant="primary" onClick={this.rodarPreTreinado}>
                                                            Rodar/testar pré treinado
                                                        </Button>
                                                    </div>
                                                </Form.Group>
                                            </Form.Row>
                                        </Form>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                    <Col md="auto" lg="auto" sm="auto" xs="auto">
                        <div className='board-area'>
                            <SnakeDot snakeDots={this.state.dots} />
                            <Food food={this.state.food} />
                        </div>
                    </Col>
                </Row>
            </>
        );
    }
}

export default Board;