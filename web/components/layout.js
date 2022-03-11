import Head from 'next/head';
import { Box, Flex } from '@chakra-ui/react';

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <title>Asterios Raidboss Notifier</title>
      </Head>
      <Flex
        height="100vh"
        gap={2}
        flexWrap="wrap"
        flexDirection="column"
        flex="1 1 0"
      >
        <Flex as="nav" borderBottom="1px solid black">
          Navigation
        </Flex>
        <Box as="main" flexGrow="1" padding={3}>
          {children}
        </Box>
        <Flex as="footer" justifyContent="center" borderTop="1px solid red">
          Footer
        </Flex>
      </Flex>
    </>
  );
}
