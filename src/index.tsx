import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.scss';
import reportWebVitals from './reportWebVitals';
import { client } from './services/graphql';
import CustomThemeProvider from './modules/root/components/Themes/CustomThemeProvider';
import CssBaseline from '@material-ui/core/CssBaseline';

ReactDOM.render(
  <CustomThemeProvider>
    <CssBaseline />
  {/* <React.StrictMode> */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  {/* </React.StrictMode> */}
  </CustomThemeProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
