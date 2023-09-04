import React, { useContext, useState, useEffect, ReactElement } from "react";
import { Card, CardContent, makeStyles, CardHeader } from "@material-ui/core";
import "./TwitterCard.scss";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import Skeleton from "@material-ui/lab/Skeleton";
import { axiosApiInstance } from "src/services/api";
import flip from "../../../../../../assets/images/flip.png";

const useStyles = makeStyles({
  headerTitle: {
    fontSize: "1.4rem",
    fontWeight: "bolder",
  },
});

interface Props {
  setFlipBack: any;
  flipBack: any;
  height: number;
  className: string;
}

const TwitterCard = (props: Props): ReactElement => {
  const classes = useStyles();
  const { innerHeight: height } = window;
  const { state }: any = useContext(stateContext);
  const [isLoading, setIsLoading] = useState(true);
  const [tweetIds, setTweetIds] = useState([]);

  useEffect(() => {
    getTweetIds();
    return () => {
      setTweetIds([]);
    };
  }, [state.selectedPreference]);

  const action = () => {
    setIsLoading(false);
  };

  const getTweetIds = async () => {
    setIsLoading(true);
    try {
      const response: any = await axiosApiInstance.post(
        `${process.env.REACT_APP_SCHEDULER_URL}V1/twitter/tweets`,
        {
          twitterScreenNames: state?.selectedPreference?.twitter,
        },
        {
          headers: {
            token: "exchange",
          },
        }
      );
      if (response && response.status === 200) {
        const data = response.data.map((tweet: any) => tweet.id);
        setTweetIds(data);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`${props.className}`}
      style={{ backgroundColor: "transparent" }}
    >
      <div className={`${props.className}__flip-icon-container`}>
        <img
          src={flip}
          className={`${props.className}__flip-icon-container__flip-icon`}
          onClick={() => {
            props.setFlipBack(!props.flipBack);
          }}
        />
      </div>
      <CardHeader
        title="News & Noteworthy"
        className={`${props.className}__header`}
        classes={{
          title: classes.headerTitle,
        }}
      />
      <CardContent
        className={`twitter-container`}
        style={{
          height: height * props.height,
        }}
      >
        {isLoading &&
          [1, 2, 3, 4, 5, 6].map((item: any, index: any) => (
            <div className={`skeleton-text`} key={index}>
              <div className={`left`}>
                <Skeleton variant="circle" width={40} height={40} />
              </div>
              <div className={`right`}>
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={"90%"} />
                <Skeleton variant="text" width={"90%"} />
                <Skeleton variant="text" width={"90%"} />
                <Skeleton variant="rect" width={"90%"} height={118} />
              </div>
            </div>
          ))}
        {tweetIds?.map((item: any, index: any) => (
          <TwitterTweetEmbed
            tweetId={item}
            key={index}
            onLoad={action}
            options={{
              maxWidth: 800,
              width: 359,
            }}
          />
        ))}
        {state?.selectedPreference?.twitter?.length === 0 && (
          <div>
            <h6>No feeds found.</h6>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TwitterCard;
