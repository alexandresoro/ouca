import { Box, createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { cyan, grey, pink } from '@mui/material/colors';
import React, { ReactElement, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import TempPage from './components/TempPage';
import { UserProvider } from './contexts/UserContext';

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
          secondary: {
            main: pink["A200"]
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
        },
        components: {
          MuiCard: {
            defaultProps: {
              elevation: 0
            },
            styleOverrides: {
              root: {
                borderStyle: "solid",
                borderWidth: "2px",
                borderColor: cyan[800]
              }
            }
          }
        }
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <Box sx={{
          backgroundColor: theme?.palette?.background?.default
        }}>
          <Routes>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/" element={<Layout />}>
              <Route index element={<TempPage />}></Route>
            </Route>
          </Routes>
        </Box>
      </UserProvider>
    </ThemeProvider>
  );
}
