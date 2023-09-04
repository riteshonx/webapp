import React, { useState, ReactElement } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import getTheme from './base'

export const CustomThemeContext = React.createContext<any>(
    {
      currentTheme: 'normal',
      setTheme: null,
    },
  )

interface CustomThemeProviderProps {
    children: React.ReactNode
}

const CustomThemeProvider = (props: CustomThemeProviderProps): ReactElement => {
    const { children } = props

    // Read current theme from localStorage or maybe from an api
    const currentTheme = localStorage.getItem('appTheme') || 'normal'

    // State to hold the selected theme name
    const [themeName, _setThemeName] = useState(currentTheme)

    // Retrieve the theme object by theme name
    const theme = getTheme(themeName)

    // Wrap _setThemeName to store new theme names in localStorage
    const setThemeName = (name: any) => {
        localStorage.setItem('appTheme', name)
        _setThemeName(name)
    }

    const contextValue = {
        currentTheme: themeName,
        setTheme: setThemeName,
    }

    return (
        <CustomThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </CustomThemeContext.Provider>
    )
}

export default CustomThemeProvider;
