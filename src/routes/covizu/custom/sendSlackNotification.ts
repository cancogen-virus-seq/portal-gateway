import axios from 'axios';
import getAppConfig from '@/config/global';

const config = getAppConfig();

const sendSlackNotification = async ({
  message,
  version,
}: {
  message: string;
  version?: string;
}) => {
  if (!config.covizu.slackUrl) return; // local dev
  await axios
    .post(config.covizu.slackUrl, {
      text: `${message}\n${`*Covizu version:* ${config.covizu.version}`}${
        version ? ` *Data version:* ${version}` : ''
      }`,
    })
    .catch((e) => {
      console.log('slack error', e);
    });
};

export default sendSlackNotification;
