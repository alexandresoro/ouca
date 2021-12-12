import { Box, createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { cyan, grey } from '@mui/material/colors';
import React, { ReactElement, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';

export default function App(): ReactElement {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: cyan[800]
          },
          ...(prefersDarkMode
            ? {
            }
            : {
              background: {
                default: grey[50]
              }
            })
        },
        typography: {
          fontFamily: "Lato"
        }
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        backgroundColor: theme?.palette?.background?.default
      }}>
        <Routes>
          <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
      </Box>
    </ThemeProvider>
  );
}
