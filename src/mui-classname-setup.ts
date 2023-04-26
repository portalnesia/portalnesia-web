import { unstable_ClassNameGenerator as ClassNameGenerator } from '@mui/material/className';
import { buildId, buildIdPostfix } from './build-id';

// ClassNameGenerator.configure(
//     // Do something with the componentName
//     (componentName) => {
//         const compName = componentName.replaceAll('Mui', '').toLowerCase();
//         if (process.env.NODE_ENV !== 'production') return compName;
//         return buildId + compName + buildIdPostfix;
//     },
// );