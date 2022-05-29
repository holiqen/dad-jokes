import React, { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import Joke from "../Joke";
import { v4 } from "uuid";

const JokesList = () => {
  const [jokes, setJokes] = useState(JSON.parse(window.localStorage.getItem("jokes") || "[]"));
  const [loading, setLoading] = useState(false);
  const seenJokes = new Set(jokes.map((joke) => joke.text));

  useEffect(() => {
    if (jokes.length === 0) {
      setLoading(true);
      getJoke();
    }
  }, []);

  const getJoke = async () => {
    try {
      const jokes = [];

      while (jokes.length < 5) {
        const res = await axios.get("https://icanhazdadjoke.com/", {
          headers: {
            Accept: "application/json",
          },
        });

        const joke = res.data.joke;
        if (!seenJokes.has(joke)) {
          jokes.push({ id: v4(), text: joke, votes: 0 });
        }
      }
      setJokes((prevState) => {
        const result = [...prevState, ...jokes];
        window.localStorage.setItem("jokes", JSON.stringify(result));
        return result;
      });
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  const handleVote = (id, delta) => {
    setJokes((prevState) => {
      const result = prevState.map((joke) => (joke.id === id ? { ...joke, votes: joke.votes + delta } : joke));
      window.localStorage.setItem("jokes", JSON.stringify(result));
      return result;
    });
  };

  const handleClick = () => {
    setLoading(true);
    getJoke();
  };

  if (loading) {
    return (
      <div className="JokeList-spinner">
        <i className="far fa-8x fa-laugh fa-spin" />
        <h1 className="JokeList-title">Loading...</h1>
      </div>
    );
  }

  const sortJokes = jokes.sort((a, b) => b.votes - a.votes);

  console.log("jokes", jokes);
  return (
    <div className="JokeList">
      <div className="JokeList-sidebar">
        <h1 className="JokeList-title">
          <span>Dad</span> Jokes
        </h1>
        <img
          src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
          alt="Smile"
        />
        <button className="JokeList-getmore" onClick={handleClick}>
          Fetch Jokes
        </button>
      </div>
      <div className="JokeList-jokes">
        {sortJokes.map((joke) => {
          return (
            <Joke
              key={joke.id}
              votes={joke.votes}
              text={joke.text}
              upVote={() => handleVote(joke.id, 1)}
              downVote={() => handleVote(joke.id, -1)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default JokesList;
