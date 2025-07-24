// App.tsx
// This is the main entry point for the React Admin application.
// It sets up the core <Admin> component, defines the data and auth providers,
// and lists all the resources (Games, Genres, etc.) that will be managed.

import React from 'react';
import { Admin, Resource } from 'react-admin';
import { dataProvider } from './providers/dataProvider';
import { authProvider } from './providers/authProvider';
import { GameList, GameEdit, GameCreate } from './resources/games';
import { GenreList, GenreEdit, GenreCreate } from './resources/genres';
import { PlatformList, PlatformEdit, PlatformCreate } from './resources/platforms';
import { CompanyList, CompanyEdit, CompanyCreate } from './resources/companies';
import { OrderEdit, OrderList, OrderShow } from './resources/orders';

// Importing icons for the sidebar menu to improve UX
import GameIcon from '@mui/icons-material/SportsEsports';
import GenreIcon from '@mui/icons-material/Category';
import PlatformIcon from '@mui/icons-material/Computer';
import CompanyIcon from '@mui/icons-material/Business';
import OrderIcon from '@mui/icons-material/ShoppingCart';

const App = () => (
  <Admin dataProvider={dataProvider} authProvider={authProvider}>
    {/* Each <Resource> component maps to an API endpoint (e.g., name="games" maps to /api/games).
      - `list`: The component to display a list of records.
      - `edit`: The component for editing a single record.
      - `create`: The component for creating a new record.
      - `icon`: The icon to display in the sidebar menu.
    */}
    <Resource 
      name="games" 
      list={GameList} 
      edit={GameEdit} 
      create={GameCreate}
      icon={GameIcon} 
      recordRepresentation="name" // Shows the game name in reference fields
    />
    <Resource 
      name="genres" 
      list={GenreList} 
      edit={GenreEdit} 
      create={GenreCreate}
      icon={GenreIcon} 
      recordRepresentation="name"
    />
    <Resource 
      name="platforms" 
      list={PlatformList} 
      edit={PlatformEdit} 
      create={PlatformCreate}
      icon={PlatformIcon}
      recordRepresentation="name"
    />
    <Resource 
      name="companies" 
      list={CompanyList} 
      edit={CompanyEdit} 
      create={CompanyCreate}
      icon={CompanyIcon}
      recordRepresentation="name"
    />
    <Resource
      name="orders"
      list={OrderList}
      edit={OrderEdit}
      show={OrderShow} // Orders are often read-only or have specific status updates
      icon={OrderIcon}
      options={{ label: 'All Orders' }}
    />
  </Admin>
);

export default App;

