'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBestRated, fetchBestSellers } from '../features/games/gamesAPI';
import GameCard from '../components/ui/GameCard';
import { type GameSummary } from '../features/games/types';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowRight, TrendingUp, Award, GamepadIcon, Sparkles } from 'lucide-react';

const GameSection = ({
  title,
  games,
  loading,
  icon: Icon,
  description,
}: {
  title: string;
  games?: GameSummary[];
  loading: boolean;
  icon: any;
  description: string;
}) => (
  <section className="mb-16">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-cyan-600 rounded-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
            <Skeleton className="h-4 w-1/2 bg-gray-700" />
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {games?.map((game) => (
          <GameCard key={game.id} game={{ ...game, id: game.id,  usersScore: game.usersScore ?? undefined }} />
        ))}
      </div>
    )}
  </section>
);

export default function HomePage() {
  const {
    data: bestRated,
    isLoading: loadingRated
  } = useQuery<GameSummary[]>({
    queryKey: ['games', 'bestrated'],
    queryFn: fetchBestRated
  });

  const {
    data: bestSellers,
    isLoading: loadingBest
  } = useQuery<GameSummary[]>({
    queryKey: ['games', 'bestsellers'],
    queryFn: fetchBestSellers
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-cyan-600/20 rounded-full border border-cyan-400/30">
                <GamepadIcon className="h-16 w-16 text-cyan-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Sahib Game Store
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Discover the ultimate gaming experience with our curated collection of 
              premium games across all platforms. From indie gems to AAA blockbusters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/games">
                <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 text-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Browse All Games
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Featured Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700 hover:border-cyan-400/50 transition-colors">
              <div className="text-4xl font-bold text-cyan-400 mb-2">1000+</div>
              <div className="text-gray-400">Games Available</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700 hover:border-cyan-400/50 transition-colors">
              <div className="text-4xl font-bold text-cyan-400 mb-2">50K+</div>
              <div className="text-gray-400">Happy Gamers</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700 hover:border-cyan-400/50 transition-colors">
              <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
              <div className="text-gray-400">Customer Support</div>
            </div>
          </div>
        </section>

        {/* Best Rated Games */}
        <GameSection
          title="Top Rated Games"
          games={bestRated}
          loading={loadingRated}
          icon={Award}
          description="Highest rated games by our community"
        />

        {/* Best Sellers */}
        <GameSection
          title="Best Sellers"
          games={bestSellers}
          loading={loadingBest}
          icon={TrendingUp}
          description="Most popular games flying off our digital shelves"
        />

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Gaming Journey?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of gamers who trust Sahib Game Store for their gaming needs. 
            Discover new worlds, epic adventures, and unforgettable experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/games">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25">
                Explore Games Now
              </Button>
            </Link>
            <Link href="/register">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 px-8 py-4 transition-all duration-300"
            >
              Sign Up for Deals
            </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
