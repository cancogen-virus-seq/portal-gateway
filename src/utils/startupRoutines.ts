import getAppConfig from '@/config/global';
import { updateData, UpdateDataArg } from '@/routes/covizu/custom/fetchData';

const { covizu } = getAppConfig();

const startupRoutines = () => {
	// update CoVizu data
	covizu.version && updateData(UpdateDataArg.SERVER_START);
};

export default startupRoutines;
