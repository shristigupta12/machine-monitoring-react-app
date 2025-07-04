import changelogSSP0173 from '../data/Machine1-SSP0173/changelog.json';
import changelogSSP0167 from '../data/Machine2-SSP0167/changelog.json'

const simulatedApiDelay = 300;

export const fetchChangelog = async (machineId) => {
    return new Promise((resolve, isRejected)=>{
        setTimeout(()=>{
            let data;
            if(machineId === 'SSP0173'){
                data = changelogSSP0173;
            }else if(machineId === 'SSP0167'){
                data = changelogSSP0167;
            }else{
                return isRejected(new Error(`Machine ${machineId} not found`));
            }
            resolve(data);
        }, simulatedApiDelay);
    })
}