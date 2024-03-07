/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useState } from 'react';
import { GamesService } from '../GamesComponent/GamesService';
import { Game } from '../GamesComponent/game.model';
import { Image, Card, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./home.component.css";
import HeroSlider from './hero/HeroSlider';
import Header from '../header/Header';
const HomeComponent: React.FC<{}> = () => {
    const [bestSellerGames, setBestSellerGames] = useState<Game[]>([]);
    const gamesService = new GamesService();
    

    useEffect(() => {
        gamesService.bestSellerGames().then((games: React.SetStateAction<Game[]>) => {
            setBestSellerGames(games);
        });
    }, []);

    return (
        <>
            <Header />
            <HeroSlider />
            <div className="container">

                <div className="section">
                    <h2 className="title">Best Saled Games</h2>
                    <Container className="d-flex p-2">
                        {bestSellerGames.map((game, index) => (
                            <Row className="justify-content-md-center">
                              <Col xs lg="2">
         
                                    <Card style={{ width: '18rem' }}>
                                        <Card.Img variant="top" src={game.imagePath} />
                                        <Card.Body>
                                            <Card.Title>{game.name}</Card.Title>
                                            <Card.Text>
                                                <div className="content">
                                                    {game.shortDescription}
                                                    <br />
                                                    <b>Release Date: </b>
                                                    <time dateTime={game.releaseDate}>
                                                        {new Date(game.releaseDate).toLocaleDateString('en-US', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </time>
                                                </div>
                                            </Card.Text>
                                            
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        ))}
                    </Container>
                </div>
            </div>

        </>
    );
};

export default HomeComponent;