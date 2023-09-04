import React from 'react';
import { makeStyles } from "@material-ui/styles";

interface CardProps {
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  width = 300,
  height = 150,
}) => {

  const useStyles = makeStyles({ 
    container:{
      minHeight: `${height}px`,
      minWidth:`${width}px`,
      border: '1px solid black',
      borderRadius: '5px',
      padding: '10px',
      overflow: 'auto',
      margin: '10px',
      color: '#fff',
    },
  });

  const classes = useStyles();

  return (
    <div className={classes.container}>
      {children}
    </div>
  );
};
