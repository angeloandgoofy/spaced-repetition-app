import { gql } from '@apollo/client';

export const SIGNUP = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name)
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const CREATE_DECK = gql`
  mutation CreateDeck($title: String!) {
    createDeck(title: $title) {
      id
      title
      cards {
        id
        front
        back
      }
    }
  }
`;

export const UPDATE_DECK = gql`
  mutation UpdateDeck($id: ID!, $title: String!) {
    updateDeck(id: $id, title: $title) {
      id
      title
      cards {
        id
        front
        back
      }
    }
  }
`;

export const DELETE_DECK = gql`
  mutation DeleteDeck($id: ID!){
      deleteDeck(id : $id)
  }
`;


export const DELETE_CARD = gql`
    mutation DeleteCard($id: ID!){
        deleteCard(id : $id)
    }
`;

export const CREATE_CARD = gql`
  mutation CreateCard($deckId: ID!, $front: String!, $back: String!) {
    createCard(deckId: $deckId, front: $front, back: $back) {
      id
      front
      back
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($id: ID!, $front: String!, $back: String!){
    updateCard(id: $id, front: $front, back: $back){
      front
      back
    }
  }
`;
export const REVIEW_CARD = gql`
  mutation ReviewCard($cardId: ID!, $quality: Int!) {
    reviewCard(cardId: $cardId, quality: $quality) {
      id
      dueDate
      easiness
      interval
      repetitions
      isDue
    }
  }
`;