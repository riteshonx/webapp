import { createMuiTheme } from '@material-ui/core/styles';
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#808080',
      light: '#fff',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
  typography: {
    // Tell Material-UI what the font-size on the html element is.
    htmlFontSize: 10,
      fontFamily: "'Poppins', sans-serif"
  },
  overrides: {
    MuiFormLabel: {
      root: {
        fontWeight: 600,
        lineHeight: '1.6rem',
        color: '#000000',
      },
    },
    MuiGrid: {
      item: {
        width: '30rem',
        //padding: '1rem 1.5rem',
      },
    },
    MuiSelect: {
      selectMenu: {
        fontSize: '1.2rem',
        color: '#1f1f1f',
      },
    },

    MuiInput: {
      root: {
        width: '100%',
      },
    },

    MuiInputBase: {
      input: {
        fontSize: '1.2rem',
        color: '#1f1f1f',
      },
    },
  },
});
