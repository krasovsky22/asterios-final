import { Provider } from 'mobx-react';
import { extendTheme } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';

import { useStore } from '@stores/appStore';

import '../styles/globals.css';

const theme = extendTheme({
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: 'blue.200',
        color: 'white',
      },
    },
  },
});

const MyApp = ({ Component, pageProps }) => {
  const store = useStore(pageProps.initialState);

  return (
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </ChakraProvider>
  );
};

export default MyApp;
