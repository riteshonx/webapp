import { createMuiTheme } from '@material-ui/core/styles'
import { red } from '@material-ui/core/colors'
// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#cc4444',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f5f5f5',
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