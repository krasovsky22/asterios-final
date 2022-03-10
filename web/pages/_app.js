import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'mobx-react';
import { useStore } from '@stores/appStore';

import '../styles/globals.css';


const MyApp = ({ Component, pageProps }) => {
  const store = useStore(pageProps.initialState);

  return (
    <ChakraProvider>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </ChakraProvider>
  );
};

export default MyApp;
