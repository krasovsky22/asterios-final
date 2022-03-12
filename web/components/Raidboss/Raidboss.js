import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useToast } from '@chakra-ui/react';
import { Text, Heading, Box, Flex } from '@chakra-ui/react';
import { useState, useEffect, useMemo, useCallback } from 'react';

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

const Raidboss = ({ boss, isMobileView = false }) => {
  const [seconds, setSeconds] = useState(0);
  const [titleIndex, setTitleIndex] = useState(0);
  const [secondsTillMaxSpawn, setSecondsTillMaxSpawn] = useState(0);

  const { getBossKill } = useStore();
  const toast = useToast();

  const kill = getBossKill(boss.id);

  const bossImageUrl = useMemo(() => {
    const key = Object.keys(BossInfoMap).find((bossKey) =>
      boss.name.includes(bossKey)
    );

    return BossInfoMap[key].image;
  }, [boss.name]);

  // Calculate seconds till check is max visible
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

  // calculate max respawn seconds
  useEffect(() => {
    let interval = setInterval(() => {
      if (kill?.isSpawning) {
        const now = new Date();
        const seconds = Math.floor(
          (new Date(kill?.respawnEndTime).getTime() - now.getTime()) / 1000
        );

        setSecondsTillMaxSpawn(seconds);
      } else {
        setSecondsTillMaxSpawn(0);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [kill?.isSpawning, kill?.respawnEndTime]);

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

  const hoursTillMaxSpawn = Math.floor(secondsTillMaxSpawn / 3600);
  let totalSeconds = (secondsTillMaxSpawn %= 3600);
  const minutesTillMaxSpawn = Math.floor(totalSeconds / 60);
  totalSeconds = totalSeconds % 60;

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
      {!isMobileView && (
        <Flex
          width="30%"
          height="100%"
          minWidth="30%"
          alignItems="center"
          flexDirection="column"
          backgroundSize="cover"
          justifyContent="flex-end"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundClip="padding-box"
          backgroundImage={`url('${bossImageUrl}')`}
        >
          {boss?.floor && (
            <Text fontWeight="bold" color="white">
              Floor: {boss?.floor}
            </Text>
          )}
        </Flex>
      )}

      <Flex flexDirection="column" flexGrow={1} alignItems="center">
        <Heading noOfLines={1} size="md" textAlign="center">
          {boss.name}
        </Heading>
        {kill && (
          <>
            <Flex gap={1}>
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
            {kill.isSpawning && (
              <Flex justifyContent="center" gap={1}>
                <Text fontWeight="bold">Max Spawn Left:</Text>
                <Text textColor="blue.500">
                  {hoursTillMaxSpawn < 10
                    ? `0${hoursTillMaxSpawn}`
                    : hoursTillMaxSpawn}
                  :
                  {minutesTillMaxSpawn < 10
                    ? `0${minutesTillMaxSpawn}`
                    : minutesTillMaxSpawn}
                  :{totalSeconds < 10 ? `0${totalSeconds}` : totalSeconds}
                </Text>
              </Flex>
            )}

            <Flex
              mb={3}
              width="100%"
              alignItems="center"
              justifyContent="space-evenly"
              flexDirection={isMobileView ? 'column' : 'row'}
            >
              <Flex gap={1}>
                <Text fontWeight="bold">Start Time:</Text>
                <Text textColor="red.500">{kill.respawnStartTime}</Text>
              </Flex>
              <Flex gap={1}>
                <Text fontWeight="bold">End Time:</Text>
                <Text textColor="red.500">{kill.respawnEndTime}</Text>
              </Flex>
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default observer(Raidboss);
