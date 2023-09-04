import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'


// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#26292C',
      light: 'rgb(81, 91, 95)',
      dark: 'rgb(26, 35, 39)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFB74D',
      light: 'rgb(255, 197, 112)',
      dark: 'rgb(200, 147, 89)',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    // Tell Material-UI what the font-size on the html element is.
    htmlFontSize: 10,
    fontFamily: ["Poppins", 'sans-serif'].join(','),
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
        // width: '30rem',
        //padding: '1rem 1.5rem',
      },
    },
    MuiSelect: {
      selectMenu: {
        fontSize: '1.3rem',
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
        fontSize: '1.3rem',
        color: '#1f1f1f',
      },
    },
  },
})

export default theme