import axios from 'axios';

import getAppConfig from '@/config/global';
import logger from '@/logger';

const { covizu } = getAppConfig();

const sendSlackNotification = async ({
  dataVersion,
  message,
}: {
  dataVersion?: string;
  message: string;
}) => {
  if (covizu.slackUrl) {
    logger.debug('Attempting to send Slack notification...');
    await axios
      .post(covizu.slackUrl, {
        text: `${message}\n${`*Covizu version:* ${covizu.version}`}${
          dataVersion ? ` *Data version:* ${dataVersion}` : ''
        }`,
      })
      .then(() => {
        logger.debug('Slack notification sent successfully.');
      })
      .catch((err) => {
        logger.error(`Error sending slack notification: ${err}.`);
      });
  }
};

export default sendSlackNotification;
