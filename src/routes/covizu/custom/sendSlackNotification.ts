import axios from 'axios';
import getAppConfig from '@/config/global';

const config = getAppConfig();

const sendSlackNotification = async ({
  dataVersion,
  message,
}: {
  dataVersion?: string;
  message: string;
}) => {
  if (config.covizu.slackUrl) {
    await axios
      .post(config.covizu.slackUrl, {
        text: `${message}\n${`*Covizu version:* ${config.covizu.version}`}${
          dataVersion ? ` *Data version:* ${dataVersion}` : ''
        }`,
      })
      .catch((e) => {
        console.log('Slack error', e);
      });
  }
};

export default sendSlackNotification;
