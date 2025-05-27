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
    query Deck($id: ID!){
        deck(id:$id) {
            id
            title
            cards {
                id
                front
                back
                isDue
            }
        }
    }
`;

