import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import './index.css';
import App from './App.tsx';

const token = localStorage.getItem("token"); 

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql',
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  }),
  cache: new InMemoryCache(),
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);


