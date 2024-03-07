import React from 'react';
import { Image } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';



const HeroSlider: React.FC = () => {

    const slides = [
        { gameName: 'Portal 2', gameDescription: 'Portal 2 is a first-person perspective puzzle game. The Player takes the role of Chell in the single-player campaign', imagePath: 'images/portal2.jpg' },
        { gameName: 'Zelda: Breath of the Wild', gameDescription: 'Conversely to previous Legend of Zelda games, Breath of the Wild features a full open world, twelve times larger than the overworld in Twilight Princess', imagePath: 'images/zelda.jpg' },
        { gameName: 'Rise of the Tomb Raider', gameDescription: 'Rise of the Tomb Raider is an action-adventure video game developed by Crystal Dynamics. It is the sequel to the 2013 video game  ', imagePath: 'images/tombraider.jpeg' },
        { gameName: 'Fallout 4', gameDescription: 'Fallout 4 is a post-apocalyptic action role-playing video game developed by Bethesda Game Studios', imagePath: 'images/fallout4.webp' },
    ];


    return (
        <Carousel>
            {slides.map((item) => (

                <Carousel.Item interval={1000}>
                    <Image width="1600px"  max-height="800px" src={item.imagePath} />
                    <Carousel.Caption>
                        <h3>{item.gameName}</h3>
                        <p>{item.gameDescription}</p>
                    </Carousel.Caption>
                </Carousel.Item>



            ))}
        </Carousel>
    );


};

export default HeroSlider;