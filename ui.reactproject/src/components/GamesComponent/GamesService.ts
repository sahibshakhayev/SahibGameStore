import { Game } from './game.model';
import axios from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import React from 'react';


export class GamesService {
    currentGame: React.RefObject<Game>;

    

    constructor() {
        this.currentGame = React.createRef();
    }

    getAllGames = (): Observable<Game[]> => {
        return new Observable((observer: { next: (arg0: any) => void; complete: () => void; }) => {
            axios.get<Game[]>(`${"https://localhost:7017"}/api/games`).then((response: { data: any; }) => {
                const game = response.data;

                game.map((g) => {
                    g.imagePath =
                        g.imageRelativePath !== null
                            ? `${"https://localhost:7017" + g.imageRelativePath}`
                            : g.imageRelativePath;
                    g.coverImagePath = `${"https://localhost:7017" + g.coverImageRelativePath}`;
                });

                observer.next(game);
                observer.complete();
            });
        });
    };

    bestSellerGames = (): Promise<Game[]> => {
        return firstValueFrom(new Observable((observer) => {
            axios.get<Game[]>(`${"https://localhost:7017"}/api/Games/bestsellers`).then((response) => {
                const game = response.data;

                game.map((g) => {
                    g.imagePath =
                        g.imageRelativePath !== null
                            ? `${"https://localhost:7017" + g.imageRelativePath}`
                            : g.imageRelativePath;
                    g.coverImagePath = `${"https://localhost:7017" + g.coverImageRelativePath}`;
                });

                observer.next(game);
                observer.complete();
            });
        }));
    };

    bestRatedGames = (): Observable<Game[]> => {
        return new Observable((observer: { next: (arg0: any) => void; complete: () => void; }) => {
            axios.get<Game[]>(`${"https://localhost:7017"}/api/games/bestrated`).then((response) => {
                const game = response.data;

                game.map((g) => {
                    g.imagePath =
                        g.imageRelativePath !== null
                            ? `${"https://localhost:7017" + g.imageRelativePath}`
                            : g.imageRelativePath;
                    g.coverImagePath = `${"https://localhost:7017" + g.coverImageRelativePath}`;
                });

                observer.next(game);
                observer.complete();
            });
        });
    };

    gameById = (id: string): Observable<Game> => {
        return new Observable((observer) => {
            axios.get<Game>(`${"https://localhost:7017"}/api/games/${id}`).then((response) => {
                const game = response.data;

                game.coverImagePath = `${"https://localhost:7017" + game.coverImageRelativePath}`;
                this.currentGame.current = game;

                observer.next(game);
                observer.complete();
            });
        });
    };
}


