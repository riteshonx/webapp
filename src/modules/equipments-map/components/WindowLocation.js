import { useEffect, useState, useReducer } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Typography } from "@mui/material";

/**
 * @deprecated
 * due to side effect of React Strict.Mode, use `isValidUrl` checking to
 * redirect.
 * @description
 */
export function WindowLocation({ href }) {
  const counterReducer = (counter, action) => {
    const newCounter = counter - 1;
    if (newCounter <= 0) {
      window.location.href = href;
    }

    switch (action.type) {
      case "Decrement":
        return counter - 1;
      default:
        return counter;
    }
  };

  const [ifLoad, setIfLoad] = useState(false);
  const [counter, dispatch] = useReducer(counterReducer, 3);
  const [redirectInterval, setRedirectInterval] = useState();
  const location = useLocation();

  // useEffect(() => {
  //   console.log("locationChange", redirectInterval);
  //   redirectInterval && redirectInterval.clearInterval();
  // }, [location]);

  const createInterval = () => {
    return setInterval(() => {
      dispatch({ type: "Decrement" });
      console.log("counter", counter);

      setIfLoad(true);
    }, 1000);
  };

  useEffect(() => {
    // window.onhashchange = function () {
    //   console.log("onHashChangeEvent");
    //   clearInterval(redirectInterval);
    // };
    // const redirectInterval = setInterval(() => {
    //   const newCounter = counter - 1;
    //   setCounter((prev) => prev - 1);
    //   console.log("counter", newCounter, counter);
    //   if (newCounter <= 0) {
    //     window.location.href = href;
    //   }
    //   setIfLoad(true);
    // }, 1000);

    setRedirectInterval(createInterval);

    return () => {
      console.log("clearInterval");
      clearInterval(redirectInterval);
    };
  }, []);

  return (
    <Container>
      <Typography>
        This page will redirect to {href} in {counter} second(s).
      </Typography>
      <Typography>
        Click{" "}
        <Link
          to="/"
          onClick={() => {
            clearInterval(redirectInterval);
          }}
        >
          Home
        </Link>
        here to home page.
      </Typography>
    </Container>
  );
}
