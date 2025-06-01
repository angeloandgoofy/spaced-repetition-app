import { useMutation, useQuery } from "@apollo/client";
import { GET_DECKS } from "../graphql/queries";
import { DELETE_DECK, CREATE_DECK, CREATE_CARD } from "../graphql/mutations";
import { useState } from "react";

function Dashboard() {
  const { data, error, loading, refetch } = useQuery(GET_DECKS);
  const [deleteMutation] = useMutation(DELETE_DECK);
  const [createDeck] = useMutation(CREATE_DECK);
  const [createCard] = useMutation(CREATE_CARD);

  const [cDeck, setDeck] = useState({ title: "" });
  const [cCard, setCard] = useState({ deckId: "", front: "", back: "" });

  const handleCreateD = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeck({ ...cDeck, [e.target.name]: e.target.value });
  };

  const handleCreateC = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard({ ...cCard, [e.target.name]: e.target.value });
  };

  const handleDelete = async (deckId: string) => {
    try {
      await deleteMutation({ variables: { id: deckId } });
      await refetch();
    } catch (err) {
      console.error("ERROR Dashboard: ", err);
    }
  };

  const handleCreateDeck = async () => {
    if (!cDeck.title.trim()) return;
    try {
      await createDeck({ variables: { title: cDeck.title } });
      setDeck({ title: "" });
      await refetch();
    } catch (err) {
      console.error("ERROR creating deck: ", err);
    }
  };

  const handleCreateCard = async () => {
    const { deckId, front, back } = cCard;
    if (!deckId || !front.trim() || !back.trim()) return;
    try {
      await createCard({ variables: { deckId, front, back } });
      setCard({ deckId: "", front: "", back: "" });
      await refetch();
    } catch (err) {
      console.error("ERROR creating card: ", err);
    }
  };

  if (loading) return <p>Loading decks...</p>;
  if (error) return <p>Error fetching decks</p>;

  return (
    <div className="Dashboard-container">
      <h1>Dashboard</h1>

      {/* Create Deck Section */}
      <div>
        <h2>Create a New Deck</h2>
        <input
          type="text"
          name="title"
          value={cDeck.title}
          placeholder="Deck Title"
          onChange={handleCreateD}
        />
        <button onClick={handleCreateDeck}>Create Deck</button>
      </div>

      {/* Create Card Section */}
      <div>
        <h2>Create a Card</h2>
        <input
          type="text"
          name="deckId"
          value={cCard.deckId}
          placeholder="Deck ID"
          onChange={handleCreateC}
        />
        <input
          type="text"
          name="front"
          value={cCard.front}
          placeholder="Front"
          onChange={handleCreateC}
        />
        <input
          type="text"
          name="back"
          value={cCard.back}
          placeholder="Back"
          onChange={handleCreateC}
        />
        <button onClick={handleCreateCard}>Create Card</button>
      </div>

      {/* Display Decks */}
      <div className="Deck-Display">
        <h2>Your Decks</h2>
        <ul>
          {data?.decks.map((deck: any) => (
            <li key={deck.id}>
              <strong> {deck.id} </strong><strong>{deck.title}</strong> — {deck.cardCount} cards
              <button onClick={() => handleDelete(deck.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
