import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useToast } from '@chakra-ui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Text, Heading, Box, Flex } from '@chakra-ui/react';

import { useStore } from '@stores/appStore';
import styles from './Raidboss.module.css';

const BossInfoMap = {
  Cabrio: {
    image: '/images/bosses/Cabrio.jpg',
    command: '/target ',
  },
  Hallate: {
    image: '/images/bosses/Hallate.jpg',
  },
  Kernon: {
    image: '/images/bosses/Kernon.jpg',
  },
  Golkonda: {
    image: '/images/bosses/Golkonda.jpg',
  },
};

const DEFAULT_TITLE = 'Asterios Raidboss Notifier';
const TITLE_MESSAGES = ['ATTENTION!', 'BOSS IS SPAWNED!'];

const Raidboss = ({ boss }) => {
  const [seconds, setSeconds] = useState(0);
  const [titleIndex, setTitleIndex] = useState(0);
  const { getBossKill } = useStore();
  const toast = useToast();

  const kill = getBossKill(boss.id);

  const bossImageUrl = useMemo(() => {
    const key = Object.keys(BossInfoMap).find((bossKey) =>
      boss.name.includes(bossKey)
    );

    return BossInfoMap[key].image;
  }, [boss.name]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (kill?.isChestVisible) {
        const now = new Date();
        const seconds = Math.floor(
          (kill?.checkIsVisibleUntil.getTime() - now.getTime()) / 1000
        );

        setSeconds(seconds);

        setTitleIndex((prevIndex) => {
          const newIndex =
            prevIndex === TITLE_MESSAGES.length - 1 ? 0 : prevIndex + 1;
          document.title = TITLE_MESSAGES[newIndex];

          return newIndex;
        });
      } else {
        clearInterval(interval);
        document.title = DEFAULT_TITLE;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [kill?.checkIsVisibleUntil, kill?.isChestVisible]);

  const copyChestCommand = useCallback(() => {
    const tempInput = document.createElement('input');
    tempInput.value = boss.command;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    toast({
      status: 'success',
      position: 'top-right',
      description: boss.command,
      title: 'Copied to clipboard',
    });
  }, [boss.command, toast]);

  const bgColor = kill?.isSpawning
    ? 'yellow.300'
    : kill?.isSpawned
    ? 'green.300'
    : 'inherit';

  return (
    <Flex
      gap={2}
      width="100%"
      color="black"
      marginX="auto"
      cursor="pointer"
      border="1px solid black"
      backgroundColor={bgColor}
      className={classNames({ [styles.blinking]: kill?.isChestVisible })}
      onClick={copyChestCommand}
    >
      <Box
        width="30%"
        height="100%"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        backgroundClip="padding-box"
        backgroundImage={`url('${bossImageUrl}')`}
      ></Box>
      <Flex flexDirection="column" flexGrow={1} alignItems="center">
        <Heading noOfLines={1} size="md" textAlign="center">
          {boss.name}
        </Heading>
        {kill && (
          <>
            <Flex>
              <Text>Killed at:</Text>
              <Text>{kill.killedAt}</Text>
            </Flex>
            <Text flexGrow={1}>{kill.content}</Text>
            {kill.isChestVisible && (
              <Flex gap={1}>
                <Text>Chest is visible for next</Text>
                <Text>{seconds} seconds.</Text>
              </Flex>
            )}
            <Flex justifyContent="space-evenly" width="100%">
              <Flex>
                <Text>Start Time:</Text>
                <Text>{kill.respawnStartTime}</Text>
              </Flex>
              <Flex>
                <Text>End Time:</Text>
                <Text>{kill.respawnEndTime}</Text>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default observer(Raidboss);
