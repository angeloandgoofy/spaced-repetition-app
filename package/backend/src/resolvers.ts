import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Context } from './types';
import { calculateSM2, isDue } from './sm2';

const typeDefs = `
  type User {
    id: ID!
    email: String!
    name: String
    createdAt: String!
    decks: [Deck!]!
  }

  type Deck {
    id: ID!
    title: String!
    cards: [Card!]!
    cardCount: Int!
    dueCardCount: Int!
  }

  type Card {
    id: ID!
    front: String!
    back: String!
    easiness: Float!
    interval: Int!
    repetitions: Int!
    dueDate: String!
    isDue: Boolean!
    createdAt: String!
    updatedAt: String!
    deck: Deck!
  }

  type Review {
    id: ID!
    quality: Int!
    createdAt: String!
    card: Card!
  }

  type StudySession {
    card: Card!
    totalDue: Int!
    remaining: Int!
  }

  type Query {
    decks: [Deck!]!
    deck(id: ID!): Deck
    cards(deckId: ID): [Card!]!
    dueCards(deckId: ID): [Card!]!
    nextCardToReview(deckId: ID): StudySession
  }

  type Mutation {
    signup(email: String!, Password: String!): String!
    login(email: String!, Password: String!): String!
    createDeck(title: String!): Deck!
    updateDeck(id: ID!, title: String): Deck!
    deleteDeck(id: ID!): Boolean!
    
    createCard(deckId: ID!, front: String!, back: String!): Card!
    updateCard(id: ID!, front: String, back: String): Card!
    deleteCard(id: ID!): Boolean!
    
    reviewCard(cardId: ID!, quality: Int!): Card!
  }
`;

const resolvers = {
  Query: {
    decks: async(parent: any, args: any, {prisma, userId}: Context) =>{
      if(!userId) return [];

      return prisma.deck.findMany({
        where: {userId},
        include: {cards: true},
        orderBy: {updatedAt: 'desc'} 
      });
    },
    deck: async(_: any, {id} : {id: string}, {prisma} : Context) =>{
      return prisma.deck.findUnique({
        where:{id},
        include:{cards: true}
      });
    },
    cards: async(_: any, {deckId} : {deckId?:string}, {prisma, userId}: Context) =>{
      const where: any = {userId};
      if(deckId) where.deckId = deckId;

      return prisma.card.findMany({
        where,
        include: {deck : true},
        orderBy: {createdAt: 'desc'}
      });
    }, 
    dueCards: async(_: any, {deckId} : {deckId?:string}, {prisma, userId}: Context) => {
      const where: any = {
        userId,
        dueDate: {lte: new Date()}
      };
      if(deckId) where.deckId = deckId;
      return prisma.card.findMany({
        where, 
        include: {deck: true},
        orderBy: {dueDate: 'asc'},
      });
    },
    nextCardToReview: async(_: any, {deckId} : {deckId?: String}, {prisma, userId}: Context) =>{
      const where: any = {
        userId, 
        dueDate: { lte: new Date()}
      };
      if(deckId) where.deckId = deckId;

      const dueCards = await prisma.card.findMany({
        where, 
        include: {deck : true}, 
        orderBy: {dueDate: 'asc'}
      });

      if(dueCards.length === 0) return null;

      return {
        card: dueCards[0],
        totalDue: dueCards.length,
        remaining: dueCards.length,
      };
    },
  },

  Mutation: {
    signup: async(_: any, {email, Password, name}: any, {prisma}: Context) =>{
      const hash = await bcrypt.hash(Password, 10);
      const user = await prisma.user.create({
        data: {email, password: hash, name},
      });

      return jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    }, 
    login: async(_: any, {email, password}: any, {prisma}: Context) =>{

      const user = await prisma.user.findUnique({where: {email}});

      if (!user || !user.password) {
        throw new Error('Invalid email or password');
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      return jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
    },
    createDeck: async(_: any, {title}: {title: string} , {prisma, userId} : Context) =>{
      if(!userId) throw new Error('Not aunthenticated');

      return prisma.deck.create({
        data: {
          title,
          userId
        }, 
        include: {cards: true}
      });
    }, 
    updateDeck: async(_: any, {id, title}: {id: string, title?: string}, {prisma, userId}: Context) =>{
      if(!userId) throw new Error('Not authenticated');
      const deck = await prisma.deck.findUnique({where: {id}});
      if(!deck || deck.userId !== userId) throw new Error('Deck not found');
      if(!title) throw new Error('Deck title cannot be empty');
      return await prisma.deck.update({
        where: {id}, 
        data: {title}, 
        include: {cards: true},
      });
    }, 
    deleteDeck: async(_: any, {id}: {id:string}, {prisma, userId}: Context) =>{
      try {
        if (!userId) throw new Error('Not authenticated');

        const deck = await prisma.deck.findUnique({ where: { id } });
        if (!deck || deck.userId !== userId) throw new Error('Deck not found');

        await prisma.deck.delete({ where: { id } });
        return true;
      } catch (error) {
        console.error('Failed to delete deck:', error);
        throw new Error('Failed to delete deck');
      }
    },
    createCard: async(_: any, {deckId, front,  back}: {deckId: string, front: string, back:string}, {prisma, userId}: Context) => {
      if(!userId) throw new Error('Cannot authenticate');

      return prisma.card.create({
        data:{
          front,
          back, 
          deckId,
          userId,
        },
        include: {deck: true},
      });
    },
    updateCard: async(_: any, {id, front, back}: {id:string, front:string, back:string}, {prisma, userId}: Context) => {
      if(!userId) throw new Error('Not authenticated');
      if(!front || !back) throw new Error('Cannot be empty');
      const card = await prisma.card.findUnique({where: {id}});
      return prisma.card.update({
        where: {id},
        data: {front, back},
        include: {deck: true}
      });
    },
    deleteCard: async(_:any, {id}: {id:string}, {prisma, userId}: Context) => {

      if(!userId) throw new Error('Cannot authenticate');
      const card = await prisma.card.findUnique({where: {id}});
      if(!card || card.userId !== userId) throw new Error('Card not found');

      try{
        await prisma.card.delete({
          where: {id}
        });
        return true;
      }catch(err){
        console.log('Failed to delete card: ', err);
        throw new Error('Failed to delete card');
      }
    }, 
    reviewCard: async(_: any, {cardId, quality} : {cardId: string, quality: number}, {prisma, userId}: Context) => {
      if(!userId) throw new Error('Not authenticated');
      const card = await prisma.card.findUnique({
        where: {id: cardId}, 
        include: {deck: true}
      });
      if(!card) throw new Error('Card not found');

      const sm2result =  calculateSM2({
        quality,
        easiness: card.easiness,
        interval: card.interval,
        repetitions: card.repetitions,
      });

      await prisma.review.create({
        data: {
          quality,
          cardId,
          userId,
        },
      });

      return prisma.card.update({
        where: {id: cardId},
        data: {
          easiness: sm2result.easiness,
          interval: sm2result.interval,
          repetitions: sm2result.repetitions,
          dueDate: sm2result.dueDate,
        },
        include: {deck: true},
      })
    }, 
  }, 
  Deck: {
    cardCount: async (deck: any, _: any, { prisma }: Context) => {
      return prisma.card.count({
        where: { deckId: deck.id },
      });
    },
    
    dueCardCount: async (deck: any, _: any, { prisma }: Context) => {
      return prisma.card.count({
        where: { 
          deckId: deck.id,
          dueDate: { lte: new Date() }
        },
      });
    },
  },

  Card: {
    isDue: (card: any) => isDue(new Date(card.dueDate)),
  },
};

export { typeDefs, resolvers };