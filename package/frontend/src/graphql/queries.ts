import { gql } from '@apollo/client';

export const GET_DECKS  = gql`
    query Decks {
        decks {
            id
            title
            cardCount
            dueCardCount
        }
    }
`;

export const GET_DECK = gql`
  query GetDeck($id: ID!) {
    deck(id: $id) {
      id
      title
      cardCount
      cards {
        id
        front
        back
        isDue
        dueDate
        repetitions
        reviewPreviews {
          quality
          nextDueDate
          intervalDays
          intervalText
        }
      }
    }
  }
`;


export const GET_NEXT_CARD_IN_DECK  = gql`
    query NextCard($deckId: ID!) {
        nextCardToReview(deckId: $deckId){
            cards{
                id
                front
                back
            }
            totalDue
            remaining
        }
    }
`;

