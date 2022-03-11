import { observer } from 'mobx-react-lite';
import { Text, Heading, Box, Flex } from '@chakra-ui/react';

import { useStore } from '@stores/appStore';

const Raidboss = ({ boss }) => {
  const { getBossKill } = useStore();

  const kill = getBossKill(boss.id);

  return (
    <Flex
      marginX="auto"
      padding={2}
      width="100%"
      border="1px solid black"
      gap={2}
    >
      <Box
        width="30%"
        height="100%"
        backgroundImage="url('/images/bosses/Cabrio.jpg')"
        backgroundRepeat="no-repeat"
        backgroundOrigin="content-box"
        backgroundPosition="center"
        backgroundSize="cover"
        backgroundClip="padding-box"
      ></Box>
      <Flex flexDirection="column" flexGrow={1}>
        <Heading noOfLines={1} size="md" textAlign="center">
          {boss.name}
        </Heading>
        {kill && (
          <>
            <Flex>
              <Text>Killed at:</Text>
              <Text>{kill.killedAt}</Text>
            </Flex>
            <Text>{kill.content}</Text>
            <Flex>
              <Text>Start Time:</Text>
              <Text>{kill.respawnStartTime}</Text>
            </Flex>
            <Flex>
              <Text>End Time:</Text>
              <Text>{kill.respawnEndTime}</Text>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default observer(Raidboss);
