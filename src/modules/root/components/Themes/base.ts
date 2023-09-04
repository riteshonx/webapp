import { ReactElement } from 'react';
import normal from './normal'
import dark from './dark'

const themes: any = {
  normal,
  dark,
}

export default function getTheme(theme: string): ReactElement {
  return themes[theme]
}